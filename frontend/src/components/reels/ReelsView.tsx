import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Compass, Loader2 } from 'lucide-react';
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
  const [feedType] = useState<'nearby' | 'foryou'>('foryou');
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
    <div className="relative w-full h-full bg-slate-50 overflow-hidden flex flex-col items-center justify-center">

      {/* main snaps wrapper: Full screen on mobile, premium card on desktop */}
      <div className="relative w-full h-full md:max-w-[420px] md:max-h-[860px] md:my-4 group bg-black shadow-[0_40px_120px_-20px_rgba(0,0,0,0.4)] overflow-hidden md:rounded-[44px] md:border-[10px] md:border-white ring-1 ring-black/10">
        
        {/* Top Bar Navigation (IG Style) */}
        <div className="absolute top-4 md:top-6 w-full px-4 md:px-6 flex items-center justify-between z-50 pointer-events-auto">
          
          <div className="w-10"></div>
          
          <div className="flex items-center">
            <span className="text-xs font-black tracking-widest uppercase text-white/90">
              Reels
            </span>
          </div>

          <div className="w-10 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCreateReel}
              className="text-white hover:text-primary transition-colors"
            >
              <Camera className="w-6 h-6 drop-shadow-md" />
            </motion.button>
          </div>
        </div>

        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="w-full h-full bg-black scroll-smooth overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10"
          style={{
            scrollSnapType: 'y mandatory'
          }}
        >
          {reels.length > 0 ? (
            reels.map((reel, idx) => (
              <ReelItem key={reel.id} reel={reel} isActive={idx === activeIndex} />
            ))
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/40 gap-6 p-8 text-center bg-black">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                <Compass className="w-10 h-10 text-primary/60" />
              </div>
              <div className="space-y-2">
                <h4 className="text-white font-black uppercase tracking-widest text-xs">No Reels Yet</h4>
                <p className="text-[10px] font-medium text-white/40 max-w-[200px]">Be the first to share a reel in your location!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReelsView;
