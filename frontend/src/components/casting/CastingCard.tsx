import { type FC, useState } from 'react';
import { Heart, CheckCircle2, User, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface CastingUser {
  id: string;
  full_name: string;
  username: string;
  distance_km?: number;
  avatar_url?: string;
  is_verified?: boolean;
  is_online?: boolean;
  last_active_at?: string;
  bio?: string;
  mutual_count?: number;
}

interface CastingCardProps {
  user: CastingUser;
  onMatch: (id: string) => void;
  onPass: (id: string) => void;
  onViewProfile: (id: string) => void;
}

const CastingCard: FC<CastingCardProps> = ({ user, onMatch, onPass, onViewProfile }) => {
  const [isLiked, setIsLiked] = useState(false);

  // Extract hashtags from bio for interest tags
  const tags = user.bio?.match(/#[a-z0-9]+/gi) || [];

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-[40px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col gap-4 group transition-all"
    >
      {/* Profile Image Container */}
      <div 
        className="relative aspect-square rounded-[32px] overflow-hidden bg-gray-50 cursor-pointer"
        onClick={() => onViewProfile(user.id)}
      >
        {user.avatar_url ? (
          <img
            src={`http://localhost:8080${user.avatar_url}`}
            alt={user.full_name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
            <User className="w-12 h-12 text-pink-200" />
            <span className="text-[10px] font-black italic text-pink-100 uppercase tracking-widest mt-2">Locolive</span>
          </div>
        )}

        {/* Favorite Heart Overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-90 shadow-lg ${
            isLiked 
              ? 'bg-pink-500 text-white shadow-pink-200' 
              : 'bg-white/80 text-gray-400 hover:text-pink-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Online Status Indicator */}
        {user.is_online && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-white/80 backdrop-blur-md rounded-full shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-gray-700 uppercase">Online</span>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex flex-col px-1">
        <div className="flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <h3 className="text-[17px] font-bold text-gray-900 truncate tracking-tight leading-tight">
              {user.full_name}
            </h3>
            {user.mutual_count && user.mutual_count > 0 ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-pink-50 to-purple-50 rounded-full border border-pink-100/50 shadow-sm animate-pulse-slow">
                <Users className="w-3 h-3 text-pink-500" />
                <span className="text-[10px] font-black text-pink-600 uppercase tracking-tighter">
                  {user.mutual_count} Mutuals
                </span>
              </div>
            ) : (
                user.is_verified && <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50" />
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs font-semibold text-gray-400">@{user.username}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-md">
            {user.distance_km ? `${user.distance_km.toFixed(1)} km away` : 'Nearby'}
          </p>
        </div>

        {/* Interest Tags (limited to 3) */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.slice(0, 3).map((tag, i) => (
              <span 
                key={tag}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-tight ${
                  i === 0 ? 'bg-pink-50 text-pink-600' :
                  i === 1 ? 'bg-purple-50 text-purple-600' :
                  'bg-blue-50 text-blue-600'
                }`}
              >
                {tag.replace('#', '')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={() => onMatch(user.id)}
          className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-pink-100 hover:shadow-pink-200 transition-all active:scale-95"
        >
          Connect
        </button>
        <button
          onClick={() => onPass(user.id)}
          className="px-4 py-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 hover:text-gray-600 transition-all active:scale-95"
        >
          Skip
        </button>
      </div>
    </motion.div>
  );
};

export default CastingCard;
