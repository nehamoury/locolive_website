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
        endpoint = '/reels/nearby?lat=0&lng=0'; 
      }
      const { data } = await api.get(endpoint);
      setReels(data.reels || []);
    } catch (err) {
      console.error('Fetch reels failed:', err);
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
    <div className="relative w-full h-full bg-bg-base overflow-hidden flex flex-col md:flex-row p-0 md:p-6 gap-6">
      
      {/* Main Vertically Snapping Container: Floating Magazine View */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        
        {/* Card Wrapper for Absolute Elements */}
        <div className="relative w-full h-full max-w-[480px]">

          {/* Top Navigation Bar: Premium Glass Pill */}
          <div className="absolute top-6 md:top-8 inset-x-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-1 p-1.5 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl pointer-events-auto">
              {['nearby', 'foryou'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFeedType(type as any)}
                  className={`relative px-7 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                    feedType === type ? 'text-white' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <span className="relative z-10 drop-shadow-md">{type === 'nearby' ? 'Nearby' : 'For You'}</span>
                  {feedType === type && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-brand-gradient rounded-full shadow-[0_0_20px_rgba(255,0,110,0.4)]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Floating Create Button (Inside Card) */}
          <div className="absolute top-6 md:top-8 right-6 z-50 pointer-events-auto hidden md:block">
              <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCreateReel}
                  className="p-3.5 bg-white/10 backdrop-blur-xl rounded-full text-white shadow-xl hover:bg-white/20 transition-all border border-white/20"
              >
                  <Camera className="w-5 h-5" />
              </motion.button>
          </div>

          <div 
              ref={containerRef}
              onScroll={handleScroll}
              className="w-full h-full bg-black md:rounded-[40px] shadow-[0_40px_80px_-15px_rgba(255,0,110,0.25)] overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10 border border-border-base/10"
          >
            {reels.length > 0 ? (
            reels.map((reel, idx) => (
                <ReelItem key={reel.id} reel={reel} isActive={idx === activeIndex} />
            ))
            ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/40 gap-6 p-8 text-center bg-[#0a0a0a]">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center shadow-inner">
                    <Compass className="w-12 h-12 text-primary/60" />
                </div>
                <div className="space-y-3">
                    <h4 className="text-white flex items-center justify-center gap-2 font-black uppercase tracking-widest text-sm">
                        <Map className="w-4 h-4 text-primary" />
                        Quiet Neighborhood
                    </h4>
                    <p className="text-xs font-medium text-white/40 max-w-[240px] leading-relaxed">
                        There are no locolive reels around your current location. Be the first to drop one!
                    </p>
                </div>
                <div className="flex gap-3 mt-4">
                    <button 
                        onClick={() => setFeedType('foryou')} 
                        className="px-6 py-3.5 bg-brand-gradient rounded-full text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Explore Global
                    </button>
                    <button 
                        onClick={onCreateReel}
                        className="px-6 py-3.5 bg-white/10 border border-white/20 hover:bg-white/20 rounded-full text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all"
                    >
                        Drop Reel
                    </button>
                </div>
            </div>
            )}
        </div>
        </div>
      </div>

      {/* Desktop Info Panel: Glassmorphic Cards */}
      <div className="hidden lg:flex flex-col justify-center gap-10 w-96 z-10">
        <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="p-10 glass rounded-[40px] space-y-6"
        >
            <div className="space-y-3">
               <h3 className="text-gradient font-black italic text-4xl uppercase tracking-tighter leading-none">Locolive<br/>Reels</h3>
               <p className="text-sm font-semibold text-text-muted leading-relaxed">
                  Experience full-screen beauty through location-aware discovery.
               </p>
            </div>
            
            <div className="h-px bg-border-base w-full" />
            
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                        <Map className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-black uppercase tracking-widest text-primary">Discovery Engine</span>
                        <p className="text-xs font-bold text-text-muted">Scroll to explore. Use arrow keys to navigate the vertical feed.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-bg-base/50 rounded-2xl border border-border-base">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Real-time Sync Active</span>
                </div>
            </div>
        </motion.div>

        <div className="px-10 flex flex-wrap gap-3">
            {['Live', 'Nearby', 'Real-time', 'Social'].map(tag => (
                <span key={tag} className="px-4 py-1.5 rounded-full bg-white/60 border border-white/80 text-[10px] font-black uppercase tracking-widest text-text-muted/60 shadow-sm">
                    #{tag}
                </span>
            ))}
        </div>
      </div>

    </div>
  );
};

export default ReelsView;
