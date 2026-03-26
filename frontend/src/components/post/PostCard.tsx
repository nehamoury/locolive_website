import { useState, type FC } from 'react';
import { Heart, MessageSquare, Share2, MapPin, MoreHorizontal, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

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
  const isOwner = currentUserID && post.user_id === currentUserID;

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
  const isTextOnly = post.media_type === 'text' || !post.media_url || post.media_url === 'text';

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
      className="flex flex-col bg-white rounded-[36px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-br from-[#FF3B8E] to-[#A436EE]">
            <div className="w-full h-full rounded-full bg-white overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl.startsWith('http') ? avatarUrl : `${BACKEND}${avatarUrl}`}
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[#FF3B8E] font-bold text-base">
                  {post.username?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">{post.full_name || post.username}</p>
            <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium mt-0.5">
              <span>@{post.username}</span>
              <span>·</span>
              <span>{timeAgo(post.created_at)}</span>
              {locationName && (
                <>
                  <span>·</span>
                  <MapPin className="w-3 h-3" />
                  <span>{locationName}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-300 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-1 min-w-[140px]">
              {isOwner && (
                <button
                  onClick={() => { setShowMenu(false); handleDelete(); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-red-500 hover:bg-red-50 text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Post
                </button>
              )}
              <button
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Share
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Caption */}
      {cleanCaption && (
        <p className="px-6 pb-3 text-gray-800 font-medium text-sm leading-relaxed">
          {cleanCaption}
        </p>
      )}

      {/* Text Post Bubble */}
      {isTextOnly && caption && (
        <div className="mx-6 mb-4 p-8 rounded-[28px] bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100">
          <p className="text-gray-800 font-medium text-xl leading-relaxed">{caption}</p>
        </div>
      )}

      {/* Media */}
      {!isTextOnly && post.media_url && (
        <div
          className="mx-4 mb-4 aspect-square rounded-[28px] overflow-hidden bg-gray-50 cursor-pointer group"
          onClick={() => onImageClick?.(post)}
        >
          {post.media_type === 'video' ? (
            <video
              src={`${BACKEND}${post.media_url}`}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              muted
              loop
              autoPlay
              playsInline
            />
          ) : (
            <img
              src={post.media_url.startsWith('http') ? post.media_url : `${BACKEND}${post.media_url}`}
              alt=""
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          )}
        </div>
      )}

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-6 pb-3">
          {hashtags.map((tag: string, i: number) => (
            <span key={i} className="text-[#A436EE] font-bold text-xs italic">{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 px-6 pb-5 pt-1">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-all group ${liked ? 'text-[#FF3B8E]' : 'text-gray-300 hover:text-[#FF3B8E]'}`}
        >
          <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${liked ? 'fill-[#FF3B8E]' : ''}`} />
          {likeCount > 0 && <span className="text-xs font-bold">{likeCount}</span>}
        </button>
        <button className="flex items-center gap-2 text-gray-300 hover:text-gray-600 transition-all">
          <MessageSquare className="w-5 h-5" />
          {post.comments_count > 0 && <span className="text-xs font-bold">{post.comments_count}</span>}
        </button>
        <button className="text-gray-300 hover:text-gray-600 transition-all">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default PostCard;
