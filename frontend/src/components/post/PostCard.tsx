import { useState, useRef, useEffect, type FC } from 'react';
import { Heart, MessageSquare, Share2, MapPin, MoreHorizontal, Trash2, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useSound } from '../../context/SoundContext';

interface PostCardProps {
  post: any;
  currentUserID?: string;
  onDelete?: (postId: string) => void;
  onImageClick?: (post: any) => void;
}

const timeAgo = (date: string) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  if (diff < 10080) return `${Math.floor(diff / 1440)}d`;
  return new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' });
};

const BACKEND = 'http://localhost:8080';

const PostCard: FC<PostCardProps> = ({ post, currentUserID, onDelete, onImageClick }) => {
  const [liked, setLiked] = useState<boolean>(post.liked_by_viewer ?? false);
  const [likeCount, setLikeCount] = useState<number>(post.likes_count ?? 0);
  const [showMenu, setShowMenu] = useState(false);
  const isTextOnly = post.media_type === 'text' || !post.media_url || post.media_url === 'text';
  const isOwner = currentUserID && post.user_id === currentUserID;
  const { isMuted, toggleMute } = useSound();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Normalize NullString objects from Go backend ({ String: "...", Valid: true })
  const caption = typeof post.caption === 'object' && post.caption !== null
    ? (post.caption.String || '')
    : (post.caption || '');
  const locationName = typeof post.location_name === 'object' && post.location_name !== null
    ? (post.location_name.String || '')
    : (post.location_name || '');
  const avatarUrl = typeof post.avatar_url === 'object' && post.avatar_url !== null
    ? (post.avatar_url.String || '')
    : (post.avatar_url || '');

  const hashtags = caption.match(/#[a-z0-9_]+/gi) || [];
  const cleanCaption = caption.replace(/#[a-z0-9_]+/gi, '').trim();

  // Sync muted state with DOM element to bypass React reconciliation lag on media tags
  useEffect(() => {
     if (videoRef.current) {
        videoRef.current.muted = isMuted;
        if (!isMuted) {
           videoRef.current.play().catch(() => {});
        }
     }
  }, [isMuted]);

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c: number) => wasLiked ? c - 1 : c + 1);
    try {
      if (wasLiked) {
        await api.delete(`/posts/${post.id}/like`);
      } else {
        await api.post(`/posts/${post.id}/like`);
      }
    } catch {
      // Revert on failure
      setLiked(wasLiked);
      setLikeCount((c: number) => wasLiked ? c + 1 : c - 1);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post.id}`);
      onDelete?.(post.id);
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col bg-bg-card rounded-[24px] border border-border-base/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] transition-all duration-500 overflow-hidden group/card"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-primary to-accent shadow-sm">
            <div className="w-full h-full rounded-full bg-bg-card p-[1.5px]">
              <div className="w-full h-full rounded-full overflow-hidden bg-bg-sidebar flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl.startsWith('http') ? avatarUrl : `${BACKEND}${avatarUrl}`}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <span className="text-primary font-black text-sm">
                    {post.username?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <h4 className="font-black text-text-base text-[14px] leading-none tracking-tight">
              {post.full_name || post.username}
            </h4>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-text-muted/60">
              <span className="text-text-base/40">@{post.username}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-border-base" />
              <span>{timeAgo(post.created_at)}</span>
              {locationName && (
                <>
                  <span className="w-0.5 h-0.5 rounded-full bg-border-base" />
                  <div className="flex items-center gap-0.5 text-primary/60">
                    <MapPin className="w-2.5 h-2.5" />
                    <span className="max-w-[100px] truncate">{locationName}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-text-muted/40 hover:text-text-base transition-colors rounded-full hover:bg-bg-sidebar cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-bg-card border border-border-base rounded-2xl shadow-xl z-20 py-1 min-w-[140px] transition-colors duration-300">
              {isOwner && (
                <button
                  onClick={() => { setShowMenu(false); handleDelete(); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-red-500 hover:bg-red-500/10 text-sm font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Post
                </button>
              )}
              <button
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-text-base hover:bg-bg-sidebar text-sm font-medium transition-colors cursor-pointer"
              >
                Share
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Caption */}
      {cleanCaption && (
        <p className="px-5 pb-3 text-text-base/80 font-medium text-[14px] leading-relaxed tracking-tight">
          {cleanCaption}
        </p>
      )}

      {/* Text Post Bubble */}
      {isTextOnly && caption && (
        <div className="mx-4 mb-4 p-10 rounded-[24px] bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 flex items-center justify-center text-center">
          <p className="text-text-base font-black text-xl leading-snug tracking-tight">{caption}</p>
        </div>
      )}

      {/* Media */}
      {!isTextOnly && post.media_url && (
        <div
          className="mx-3 mb-3 aspect-[4/5] md:aspect-video rounded-[24px] overflow-hidden bg-bg-sidebar cursor-pointer relative group/media shadow-sm border border-border-base transition-colors duration-300"
          onClick={() => onImageClick?.(post)}
        >
          {post.media_type === 'video' ? (
            <>
              <video
                ref={videoRef}
                src={`${BACKEND}${post.media_url}`}
                className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-700 ease-out"
                muted={isMuted}
                loop
                autoPlay
                playsInline
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                aria-label={isMuted ? "Unmute video" : "Mute video"}
                className="absolute bottom-3 right-3 p-2.5 bg-black/50 backdrop-blur-xl rounded-full text-white transition-all duration-300 opacity-100 scale-100 hover:bg-black/70 hover:scale-110 active:scale-95 shadow-lg z-10"
              >
                {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
              </button>
            </>
          ) : (
            <img
              src={post.media_url.startsWith('http') ? post.media_url : `${BACKEND}${post.media_url}`}
              alt=""
              className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-700 ease-out"
            />
          )}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/media:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-5 pb-3">
          {hashtags.map((tag: string, i: number) => (
            <span key={i} className="text-accent font-black text-[10px] uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-5 pb-5 pt-1">
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 p-2 rounded-2xl transition-all group cursor-pointer ${liked ? 'bg-primary/10 text-primary' : 'hover:bg-bg-sidebar text-text-muted/60 hover:text-text-base'}`}
          >
            <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 group-active:scale-90 ${liked ? 'fill-primary' : ''}`} />
            <span className="text-[12px] font-black">{likeCount}</span>
          </button>
          
          <button className="flex items-center gap-2 p-2 rounded-2xl hover:bg-bg-sidebar text-text-muted/60 hover:text-text-base transition-all group cursor-pointer">
            <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110 rounded-full" />
            <span className="text-[12px] font-black">{post.comments_count || 0}</span>
          </button>
        </div>

        <button className="p-2 rounded-2xl hover:bg-bg-sidebar text-text-muted/60 hover:text-text-base transition-all group cursor-pointer">
          <Share2 className="w-5 h-5 transition-transform group-hover:rotate-12" />
        </button>
      </div>
    </motion.div>
  );
};

export default PostCard;
