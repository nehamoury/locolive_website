import { type FC } from 'react';
import { Heart, X, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface CastingUser {
  id: string;
  full_name: string;
  username: string;
  age: number;
  distance: string;
  avatar_url?: string;
  is_premium?: boolean;
}

interface CastingCardProps {
  user: CastingUser;
  onMatch: (id: string) => void;
  onPass: (id: string) => void;
}

const CastingCard: FC<CastingCardProps> = ({ user, onMatch, onPass }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="relative group aspect-[3/4] rounded-[32px] overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl cursor-pointer"
    >
      {/* User Image */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
        {user.avatar_url ? (
          <img src={`http://localhost:8080${user.avatar_url}`} alt={user.full_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="text-6xl font-black text-white/10 italic select-none">LOCO</div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

      {/* Tags */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
        <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold text-white flex items-center gap-1">
          <MapPin className="w-3 h-3 text-purple-400" />
          {user.distance} away
        </div>
        {user.is_premium && (
          <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-[10px] font-black text-black flex items-center gap-1 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <Star className="w-3 h-3 fill-black" />
            PREMIUM
          </div>
        )}
      </div>

      {/* User Info Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col z-20">
        <div className="flex items-end justify-between mb-4">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-white leading-tight tracking-tight">
              {user.full_name}, {user.age}
            </h3>
            <p className="text-xs text-white/60 font-medium">@{user.username}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); onPass(user.id); }}
            className="flex-1 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 group/btn"
          >
            <X className="w-6 h-6 text-white group-hover/btn:text-red-400 transition-colors" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onMatch(user.id); }}
            className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-[#ee2a7b] to-[#6228d7] flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(238,42,123,0.4)] transition-all active:scale-95 shadow-lg group/btn"
          >
            <Heart className="w-5 h-5 text-white fill-white group-hover/btn:scale-110 transition-transform" />
            <span className="text-sm font-black text-white uppercase tracking-wider">Match</span>
          </button>
        </div>
      </div>

      {/* Selection Border Glow (Hover) */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/50 rounded-[32px] transition-all pointer-events-none" />
    </motion.div>
  );
};

export default CastingCard;
