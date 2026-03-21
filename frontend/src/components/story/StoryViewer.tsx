import { useState, useEffect, useRef, useCallback } from 'react';
import { X, MoreHorizontal, Heart, Send, Trash2, Flag, Volume2, VolumeX, Eye, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type?: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  caption?: string;
  created_at: string;
  expires_at?: string;
  likes_count?: number;
  views_count?: number;
  liked?: boolean;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  currentUser?: string;
  currentUserID?: string;
  onDelete?: (storyId: string) => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function timeLeft(dateStr?: string) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m left`;
  return `${h}h left`;
}

const StoryViewer = ({ stories, initialIndex, onClose, currentUser, currentUserID, onDelete }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [reply, setReply] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [countdown, setCountdown] = useState(STORY_DURATION / 1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const story = stories[currentIndex];
  const isOwn = story?.user_id === currentUserID || story?.username === currentUser;
  const isVideo = story?.media_type === 'video';

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(i => i + 1);
      setProgress(0);
      setCountdown(STORY_DURATION / 1000);
      setLiked(false);
      setReply('');
      setMenuOpen(false);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setProgress(0);
      setCountdown(STORY_DURATION / 1000);
      setLiked(false);
      setReply('');
      setMenuOpen(false);
    }
  };

  // Progress bar + countdown timer
  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const tickMs = 50; 
    const step = 100 / (STORY_DURATION / tickMs);
    intervalRef.current = setInterval(() => {
      setProgress(prev => Math.min(prev + step, 100));
      setCountdown(prev => {
        const next = prev - tickMs / 1000;
        return next < 0 ? 0 : Math.round(next * 10) / 10;
      });
    }, tickMs);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [currentIndex, paused]);

  // Handle auto-next when progress completes
  useEffect(() => {
    if (progress >= 100) {
      goNext();
    }
  }, [progress, goNext]);

  // Video mute sync
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const handleLike = async () => {
    setLiked(v => !v);
    try { await api.post(`/stories/${story.id}/react`, { emoji: '❤️' }); } catch { /* ignore */ }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSendingReply(true);
    try {
      await api.post('/messages', { receiver_id: story.user_id, content: reply });
    } catch { /* ignore */ }
    setReply('');
    setSendingReply(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    
    setMenuOpen(false);
    try {
      setPaused(true);
      await api.delete(`/stories/${story.id}`);
      
      // Notify parent to remove from state
      onDelete?.(story.id);
      
      // If this was the only story, the parent's onClose will handle it via state change
      // But we can also proactively call onClose if we know it's the last one
      if (stories.length <= 1) {
        onClose();
        return;
      }

      // If there are more stories, the parent updates the list. 
      // We should probably just let the parent handle the "move to next" if it wants,
      // but for now we'll just adjust index if needed.
      if (currentIndex >= stories.length - 1) {
        setCurrentIndex(Math.max(0, stories.length - 2));
      }
      
      setProgress(0);
      setCountdown(STORY_DURATION / 1000);
      setPaused(false);
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(err.response?.data?.error || 'Failed to delete story');
      setPaused(false);
    }
  };

  if (!story) return null;

  const expiryText = timeLeft(story.expires_at);

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-xl flex items-center justify-center overflow-hidden"
      >

        {/* Story Card */}
        <motion.div 
          key={currentIndex}
          initial={{ scale: 0.8, opacity: 0, x: 100 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          exit={{ scale: 0.8, opacity: 0, x: -100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm h-full md:h-[90vh] md:max-h-[780px] overflow-hidden md:rounded-3xl shadow-2xl bg-black z-20"
        >
          {/* Media Content */}
          <div className="absolute inset-0">
            {isVideo ? (
              <video
                ref={videoRef}
                src={`http://localhost:8080${story.media_url}`}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted={muted}
                playsInline
              />
            ) : (
              <img
                src={`http://localhost:8080${story.media_url}`}
                alt="Story"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Navigation Layers - Inside card but above media */}
          <div className="absolute inset-0 flex z-10 pointer-events-none">
            <div
              className="w-1/3 h-full cursor-pointer pointer-events-auto"
              onClick={goPrev}
              onMouseDown={() => setPaused(true)}
              onMouseUp={() => setPaused(false)}
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
            />
            <div className="flex-1 h-full pointer-events-auto" onMouseDown={() => setPaused(true)} onMouseUp={() => setPaused(false)} onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)} />
            <div
              className="w-1/3 h-full cursor-pointer pointer-events-auto"
              onClick={goNext}
              onMouseDown={() => setPaused(true)}
              onMouseUp={() => setPaused(false)}
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
            />
          </div>

          {/* Overlays */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/80 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />



          {/* Top Bar Actions - High Z-Index */}
          <div className="absolute top-0 inset-x-0 p-4 pt-4 space-y-4 z-[100]">
            {/* Progress Segmented Bar */}
            <div className="flex gap-1.5 h-1">
              {stories.map((_, idx) => (
                <div key={idx} className="flex-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' }}
                    transition={{ duration: 0 }}
                    className="h-full bg-white shadow-[0_0_8px_white/50]"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
                  <div className="w-full h-full rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center font-bold text-white text-sm">
                    {story.avatar_url ? (
                      <img 
                        src={story.avatar_url.startsWith('http') ? story.avatar_url : `http://localhost:8080${story.avatar_url}`} 
                        alt={story.username} 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      story.username.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm tracking-tight">{story.username}</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest">{timeAgo(story.created_at)}</p>
                    {expiryText && (
                      <span className="flex items-center gap-1 text-[9px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        <Clock className="w-2.5 h-2.5" />
                        {expiryText}
                      </span>
                    )}
                    <span className="text-[9px] font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      {Math.ceil(countdown)}s
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isVideo && (
                  <button onClick={() => setMuted(!muted)} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white/80 transition-all hover:bg-white/20 border border-white/10">
                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                )}
                
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(!menuOpen);
                    }} 
                    className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white/80 transition-all hover:bg-white/20 border border-white/10"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  
                  {menuOpen && (
                    <div className="absolute top-12 right-0 w-48 bg-zinc-900 border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {isOwn && (
                        <button 
                          onClick={handleDelete}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Story
                        </button>
                      )}
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                        <Flag className="w-4 h-4" /> Report Story
                      </button>
                    </div>
                  )}
                </div>

                <button onClick={onClose} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white/80 transition-all hover:bg-white/20 border border-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Area Actions */}
          <div className="absolute bottom-0 inset-x-0 p-6 space-y-4 z-[100]">
            {story.caption && (
              <div className="space-y-2">
                <p className="text-white text-sm font-medium drop-shadow-lg text-center leading-relaxed">{story.caption}</p>
                {story.views_count !== undefined && (
                  <div className="flex justify-center">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      <Eye className="w-3 h-3" /> {story.views_count} Views
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onFocus={() => setPaused(true)}
                  onBlur={() => setPaused(false)}
                  onKeyDown={e => e.key === 'Enter' && handleReply()}
                  className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/30"
                  placeholder={`Reply to ${story.username}...`}
                />
                <button 
                  onClick={handleReply}
                  disabled={!reply.trim() || sendingReply}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-violet-600 rounded-full text-white hover:bg-violet-500 disabled:opacity-40 transition-all active:scale-90 shadow-lg shadow-violet-600/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={handleLike}
                className={`w-12 h-12 flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-full transition-all ${liked ? 'text-rose-500 scale-110 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'text-white/80'}`}
              >
                <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Paused Indicator Overlay */}
        <AnimatePresence>
          {paused && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-black/60 backdrop-blur-3xl p-8 rounded-full border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="flex gap-2.5">
                  <div className="w-3 h-10 bg-white/90 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                  <div className="w-3 h-10 bg-white/90 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoryViewer;
