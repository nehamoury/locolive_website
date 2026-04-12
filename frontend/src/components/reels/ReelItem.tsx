import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Volume2, VolumeX, MapPin, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { BACKEND } from '../../utils/config';

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

interface ReelItemProps {
  reel: Reel;
  isActive: boolean;
}

const ReelItem = ({ reel, isActive }: ReelItemProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(reel.is_liked);
  const [saved, setSaved] = useState(reel.is_saved);
  const [likesCount, setLikesCount] = useState(reel.likes_count);
  const [muted, setMuted] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(() => { });
      bgVideoRef.current?.play().catch(() => { });
    } else {
      videoRef.current?.pause();
      bgVideoRef.current?.pause();
      if (videoRef.current) videoRef.current.currentTime = 0;
      if (bgVideoRef.current) bgVideoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const handleLike = async () => {
    try {
      if (liked) {
        await api.delete(`/reels/${reel.id}/like`);
        setLikesCount(prev => prev - 1);
      } else {
        await api.post(`/reels/${reel.id}/like`);
        setLikesCount(prev => prev + 1);
        setShowHeartAnim(true);
        setTimeout(() => setShowHeartAnim(false), 1000);
      }
      setLiked(!liked);
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleSave = async () => {
    try {
      if (saved) {
        await api.delete(`/reels/${reel.id}/save`);
      } else {
        await api.post(`/reels/${reel.id}/save`);
      }
      setSaved(!saved);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const formatDistance = (meters?: number) => {
    if (meters === undefined) return '';
    if (meters < 1000) return `${Math.round(meters)}m away`;
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  return (
    <div className="relative w-full h-full bg-black snap-start snap-always overflow-hidden flex items-center justify-center flex-shrink-0">
      {/* Cinematic Blurred Background Wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <video
          ref={bgVideoRef}
          src={`${BACKEND}${reel.video_url}`}
          className="w-full h-full object-cover blur-2xl scale-110 opacity-40 brightness-75"
          muted
          playsInline
          autoPlay
          loop
        />
      </div>

      {/* Primary High-Fidelity Video Foreground */}
      <video
        ref={videoRef}
        src={`${BACKEND}${reel.video_url}`}
        className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
        loop
        muted={muted}
        playsInline
        onClick={() => setMuted(!muted)}
      />

      {/* Double Tap Heart Animation */}
      <AnimatePresence>
        {showHeartAnim && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -15 }}
            animate={{ scale: 1.8, opacity: 1, rotate: 0 }}
            exit={{ scale: 2.2, opacity: 0 }}
            className="absolute z-50 pointer-events-none"
          >
            <Heart className="w-28 h-28 text-white fill-white drop-shadow-[0_0_30px_rgba(255,0,110,0.8)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay Gradients - Refined for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent via-40% to-black pointer-events-none" />

      {/* Right Side Actions: Compact & Functional */}
      <div className="absolute right-4 bottom-38 flex flex-col items-center gap-6 z-20">

        {/* Like */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            aria-label={liked ? "Unlike" : "Like"}
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300 ${liked
              ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,0,110,0.5)]'
              : 'bg-black/40 text-white border border-white/10 hover:bg-black/60'
              }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          </motion.button>
          <span className="text-[10px] font-black tracking-tight text-white drop-shadow-md">{likesCount}</span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="View comments"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-black/60 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
          </motion.button>
          <span className="text-[10px] font-black tracking-tight text-white drop-shadow-md">{reel.comments_count}</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Share reel"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-black/60 transition-all font-variant-numeric: tabular-nums"
        >
          <Share2 className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSave}
          aria-label={saved ? "Unsave" : "Save"}
          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300 ${saved
            ? 'bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.5)]'
            : 'bg-black/40 text-white border border-white/10 hover:bg-black/60'
            }`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </motion.button>

        {/* Volume Button: Compact & Bottom-Right as requested */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setMuted(!muted)}
          aria-label={muted ? "Unmute" : "Mute"}
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/20 text-white hover:bg-black/60 transition-all shadow-2xl"
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="More options"
          className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-all"
        >
          <MoreVertical className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Bottom Information: Legibility Focused */}
      <div className="absolute bottom-32 left-6 right-24 z-20 space-y-5">
        {/* User Info & Follow */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-14 h-14 rounded-2xl p-[3px] bg-brand-gradient group-hover:scale-105 transition-all">
              <div className="w-full h-full rounded-[13px] border-2 border-black overflow-hidden bg-gray-900">
                {reel.avatar_url ? (
                  <img src={`${BACKEND}${reel.avatar_url}`} alt={reel.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-black italic text-lg bg-gray-800">
                    {reel.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-3">
              <h4 className="text-white font-black text-xl italic tracking-tighter leading-none">@{reel.username}</h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] font-black uppercase tracking-widest text-white transition-all"
              >
                Follow
              </motion.button>
            </div>
            <div className="flex items-center gap-2 text-white/50">
              {reel.location_name && (
                <span className="flex items-center gap-1 text-[11px] font-bold">
                  <MapPin className="w-3 h-3 text-primary" />
                  {reel.location_name}
                </span>
              )}
              {reel.distance_meters !== undefined && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-[11px] font-bold">{formatDistance(reel.distance_meters)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Caption */}
        {reel.caption && (
          <p className="text-white text-sm font-medium leading-relaxed drop-shadow-md line-clamp-2 pr-6 max-w-sm">
            {reel.caption}
          </p>
        )}

        {/* AI Badge & Audio Info */}
        <div className="flex items-center gap-5">
          {reel.is_ai_generated && (
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 backdrop-blur-xl border border-primary/30 rounded-[10px] shadow-[0_0_15px_rgba(255,0,110,0.2)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary fill-primary/20" />
              <span className="text-[9px] text-white font-black uppercase tracking-[0.15em]">AI-Enhanced</span>
            </motion.div>
          )}
          <div className="flex items-center gap-2.5 text-white/40">
            <div className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center animate-spin-slow">
              <Volume2 className="w-2.5 h-2.5" />
            </div>
            <div className="text-[10px] font-bold tracking-wide animate-marquee whitespace-nowrap overflow-hidden max-w-[120px]">
              Original Audio • {reel.username}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default ReelItem;
