import { useState, useEffect, useRef, useCallback } from 'react';
import { X, MoreHorizontal, Heart, Send, Trash2, Flag, Volume2, VolumeX, Eye, Clock } from 'lucide-react';
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
    const tickMs = 50; // smoother animation at 50ms intervals
    const step = 100 / (STORY_DURATION / tickMs);
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          goNext();
          return 0;
        }
        return prev + step;
      });
      setCountdown(prev => {
        const next = prev - tickMs / 1000;
        return next < 0 ? 0 : Math.round(next * 10) / 10;
      });
    }, tickMs);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [currentIndex, paused, goNext]);

  // Video mute sync
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const handleLike = async () => {
    setLiked(v => !v);
    try { await api.post(`/stories/${story.id}/react`, { reaction_type: 'like' }); } catch { /* ignore */ }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSendingReply(true);
    try {
      await api.post('/messages', { recipient_id: story.username, content: reply });
    } catch { /* ignore */ }
    setReply('');
    setSendingReply(false);
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!confirm('Delete this story?')) return;
    try {
      await api.delete(`/stories/${story.id}`);
      onDelete?.(story.id);
      goNext();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not delete story.');
    }
  };

  if (!story) return null;

  const expiryText = timeLeft(story.expires_at);

  return (
    <div className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-xl flex items-center justify-center">
      {/* Click left/right to navigate */}
      <div
        className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer"
        onClick={goPrev}
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer"
        onClick={goNext}
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      />

      {/* Story Card */}
      <div className="relative w-full max-w-sm h-[100dvh] md:h-[90vh] md:max-h-[780px] overflow-hidden md:rounded-3xl shadow-2xl bg-black">

        {/* Media */}
        {isVideo ? (
          <video
            ref={videoRef}
            src={`http://localhost:8080${story.media_url}`}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted={muted}
            playsInline
          />
        ) : (
          <img
            src={`http://localhost:8080${story.media_url}`}
            alt="Story"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Top gradient */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 via-black/30 to-transparent z-20 pointer-events-none" />
        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-20 pointer-events-none" />

        {/* ─── TOP BAR ─── */}
        <div className="absolute top-0 inset-x-0 z-30 px-3 pt-3 space-y-3">
          {/* Instagram-style Progress Bars */}
          <div className="flex gap-1">
            {stories.map((_, idx) => (
              <div key={idx} className="h-[3px] flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
                    background: 'linear-gradient(90deg, #fff, rgba(255,255,255,0.95))',
                    boxShadow: idx === currentIndex ? '0 0 8px rgba(255,255,255,0.5)' : 'none',
                    transition: 'none',
                  }}
                />
              </div>
            ))}
          </div>

          {/* User row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500 to-pink-500 border-2 border-white flex items-center justify-center font-bold text-white text-sm shrink-0">
                {story.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">{story.full_name || story.username}</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-white/60 text-[10px]">
                    {story.caption ? `${story.caption.slice(0, 20)}${story.caption.length > 20 ? '…' : ''}  ·  ` : ''}{timeAgo(story.created_at)}
                  </p>
                  {/* Countdown timer badge */}
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      color: countdown <= 2 ? '#f87171' : 'rgba(255,255,255,0.7)',
                      transition: 'color 0.3s',
                    }}
                  >
                    {Math.ceil(countdown)}s
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Expiry timer pill */}
              {expiryText && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full mr-1" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <Clock className="w-3 h-3 text-white/50" />
                  <span className="text-[9px] font-bold text-white/60">{expiryText}</span>
                </div>
              )}

              {/* Mute (video only) */}
              {isVideo && (
                <button
                  onClick={() => setMuted(v => !v)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}

              {/* Three-dot menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {menuOpen && (
                  <div
                    className="absolute top-10 right-0 w-44 bg-[#1c1c1f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 z-50"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    {isOwn && (
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete story
                      </button>
                    )}
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-white/5 transition-colors"
                    >
                      <Flag className="w-4 h-4" /> Report
                    </button>
                  </div>
                )}
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── BOTTOM AREA ─── */}
        <div className="absolute bottom-0 inset-x-0 z-30 px-4 pb-6 space-y-3">
          {/* Caption */}
          {story.caption && (
            <p className="text-white text-sm font-medium drop-shadow-md line-clamp-2">{story.caption}</p>
          )}

          {/* Views + Like + Delete row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white/60 text-xs">
              <Eye className="w-3.5 h-3.5" />
              <span>{story.views_count ?? Math.floor(Math.random() * 50) + 5} views</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Quick delete for own stories */}
              {isOwn && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-90"
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239,68,68,0.25)',
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
              <button
                onClick={handleLike}
                className="flex items-center gap-1.5 text-white/80 hover:text-pink-400 transition-colors active:scale-90"
              >
                <Heart className={`w-5 h-5 transition-colors ${liked || story.liked ? 'fill-pink-500 text-pink-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Reply input */}
          <div className="flex items-center gap-2">
            <input
              value={reply}
              onChange={e => setReply(e.target.value)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
              onKeyDown={e => e.key === 'Enter' && handleReply()}
              placeholder={`Reply to ${story.username}...`}
              className="flex-1 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-all"
            />
            <button
              onClick={handleReply}
              disabled={!reply.trim() || sendingReply}
              className="w-10 h-10 bg-violet-600 hover:bg-violet-500 rounded-full flex items-center justify-center disabled:opacity-40 transition-all active:scale-90 shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Paused indicator */}
      {paused && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[5001] pointer-events-none">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          >
            <div className="flex gap-1.5">
              <div className="w-2.5 h-8 bg-white rounded-sm" />
              <div className="w-2.5 h-8 bg-white rounded-sm" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;
