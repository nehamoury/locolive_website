import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Map, Compass, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import ReelItem from './ReelItem';

interface Reel {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  video_url: string;
  caption?: string;
  is_ai_generated: boolean;
  location_name?: string;
  distance_meters?: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  is_liked: boolean;
  is_saved: boolean;
}

interface ReelsViewProps {
  onCreateReel?: () => void;
}

const ReelsView = ({ onCreateReel }: ReelsViewProps) => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedType, setFeedType] = useState<'nearby' | 'foryou'>('foryou');
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchReels = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '/reels/feed';
      if (feedType === 'nearby') {
        const storedPos = localStorage.getItem('lastPosition');
        let lat = 0, lng = 0;
        if (storedPos) {
          const pos = JSON.parse(storedPos);
          lat = pos.lat || 0;
          lng = pos.lng || 0;
        }
        endpoint = `/reels/nearby?lat=${lat}&lng=${lng}`;
      }
      const { data } = await api.get(endpoint);
      setReels(data.reels || []);
    } catch (err) {
      console.error('Fetch reels failed:', err);
      setReels([]);
    } finally {
      setLoading(false);
    }
  }, [feedType]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollPos = e.currentTarget.scrollTop;
    const height = e.currentTarget.clientHeight;
    const index = Math.round(scrollPos / height);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  if (loading && reels.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-bg-base">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest text-text-muted">Loading Discovery...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col md:flex-row">

      {/* main snaps */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden h-full w-full">
        
        {/* Card Wrapper: Full height for mobile */}
        <div className="relative w-full h-full max-w-[420px] mx-auto group">
          
          {/* Floating Create Button */}
          <div className="absolute top-5 left-5 z-50 pointer-events-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateReel}
              aria-label="Create Reel"
              className="p-2.5 bg-white/10 backdrop-blur-xl rounded-2xl text-white shadow-xl hover:bg-white/20 transition-all border border-white/10"
            >
              <Camera className="w-4 h-4" />
            </motion.button>
          </div>

          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="w-full h-full bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10"
          >
            {reels.length > 0 ? (
              reels.map((reel, idx) => (
                <ReelItem key={reel.id} reel={reel} isActive={idx === activeIndex} />
              ))
            ) : (
              <div className="w-full h-screen flex flex-col items-center justify-center text-white/40 gap-6 p-8 text-center bg-black">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center shadow-inner">
                  <Compass className="w-12 h-12 text-primary/60" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-white flex items-center justify-center gap-2 font-black uppercase tracking-widest text-sm">
                    <Map className="w-4 h-4 text-primary" />
                    No Reels Yet
                  </h4>
                  <p className="text-xs font-medium text-white/40 max-w-[240px] leading-relaxed">
                    There are no reels around your location. Be the first to create one!
                  </p>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setFeedType('foryou')}
                    className="px-6 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Explore Global
                  </button>
                  <button
                    onClick={onCreateReel}
                    className="px-6 py-3.5 bg-white/10 border border-white/20 hover:bg-white/20 rounded-full text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all"
                  >
                    Create Reel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unified Desktop Dashboard Panel */}
      <div className="hidden lg:flex flex-col justify-center w-[440px] z-10 py-12 pr-10">
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="glass rounded-[60px] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col h-full max-h-[850px]"
        >
          {/* Animated Background Accents (Kept subtle to avoid text interference) */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col h-full p-12 space-y-12 relative z-10">
            {/* 1. Header: Feed Selection */}
            <div className="space-y-6">
              <div className="flex items-center gap-1.5 p-1.5 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl w-fit">
                {['nearby', 'foryou'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFeedType(type as any)}
                    className={`relative px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${feedType === type ? 'text-white' : 'text-text-muted hover:text-text-base'
                      }`}
                  >
                    <span className="relative z-10">{type === 'nearby' ? 'Nearby' : 'Global Feed'}</span>
                    {feedType === type && (
                      <motion.div
                        layoutId="dashboardTab"
                        className="absolute inset-0 bg-brand-gradient rounded-xl shadow-lg shadow-primary/20"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 dark:bg-primary/20 rounded-full border border-primary/20 dark:border-primary/30">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,0,110,0.8)]" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-primary">Live Discovery</span>
                </div>
                <h3 className="text-gradient font-black italic text-6xl uppercase tracking-tighter leading-[0.85] drop-shadow-2xl">Locolive<br />Reels</h3>
                <p className="text-sm font-semibold text-text-base leading-relaxed max-w-[320px] opacity-80">
                  Explore the hyper-local rhythm of your world. Every reel is a window into a moment happening right now.
                </p>
              </div>
            </div>

            <div className="h-px bg-white/10 w-full" />

            {/* 2. Middle: Content & Info */}
            <div className="flex-1 space-y-10">
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 rounded-3xl bg-primary/5 dark:bg-white/5 flex items-center justify-center shrink-0 border border-border-base/50 dark:border-white/10 shadow-inner group-hover:border-primary/50 transition-all duration-300">
                  <Map className="w-7 h-7 text-primary/40 dark:text-white/40 group-hover:text-primary transition-colors" />
                </div>
                <div className="space-y-2 pt-1">
                  <span className="text-[14px] font-black uppercase tracking-[0.2em] text-text-base">Smart Discovery</span>
                  <p className="text-xs font-bold text-text-muted leading-relaxed max-w-[240px]">Vertical snapping feed. Use Arrow Keys for instant switching.</p>
                </div>
              </div>

              <div className="flex items-center gap-5 p-7 bg-white/40 dark:bg-white/5 rounded-[40px] border border-border-base dark:border-white/10 backdrop-blur-md shadow-sm">
                <div className="relative shrink-0">
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
                  <div className="absolute inset-0 w-3.5 h-3.5 rounded-full bg-green-500 animate-ping opacity-40" />
                </div>
                <div className="flex flex-col gap-0.5">
                   <span className="text-[11px] font-black uppercase tracking-widest text-text-base">Hyper-Local Sync</span>
                   <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">Real-time neighborhood pulse active</span>
                </div>
              </div>
            </div>

            {/* 3. Footer: Metadata Tags */}
            <div className="pt-6 border-t border-border-base/30 dark:border-white/5">
              <div className="flex flex-wrap gap-3">
                {['Live', 'Nearby', 'Real-time', 'Social', 'Locolive'].map(tag => (
                  <span key={tag} className="px-5 py-2.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-border-base/50 dark:border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-text-muted hover:border-primary/40 hover:text-primary transition-all cursor-default">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default ReelsView;
