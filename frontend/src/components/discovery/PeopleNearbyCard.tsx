import React from 'react';
import { X, Star, Heart, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface PeopleNearbyCardProps {
  user: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    distance?: string;
    bio?: string;
    tags?: string[];
  };
  onConnect?: (userId: string) => void;
  onProfileClick?: (userId: string) => void;
}

export const PeopleNearbyCard: React.FC<PeopleNearbyCardProps> = ({ user, onConnect, onProfileClick }) => {
  return (
    <div className="relative group px-2">
      <div 
        onClick={() => onProfileClick?.(user.id)}
        className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl relative border-[6px] border-white shadow-pink-100/50 cursor-pointer"
      >
        {user.avatar_url ? (
          <img 
            src={`http://localhost:8080${user.avatar_url}`} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            alt={user.username} 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-5xl font-black text-pink-300 italic">
            {(user.username?.charAt(0) || 'U').toUpperCase()}
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

        {/* User Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white pointer-events-none">
          <div className="flex flex-wrap gap-2 mb-3">
            {(user.tags || ['Explorer 📍', 'Coffee Lover ☕']).map((tag, i) => (
              <span key={i} className="px-3 py-1.5 bg-black/20 backdrop-blur-md rounded-full text-[10px] font-black border border-white/20 uppercase tracking-tighter shadow-lg">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-3xl font-black italic tracking-tighter uppercase">{user.full_name || user.username}</h3>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-[10px] font-black uppercase tracking-widest">
             <MapPin className="w-3 h-3 text-pink-400" />
             Nearby · {user.distance || 'Recently'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-5 mt-8">
        <ActionButton icon={<X className="w-7 h-7" />} color="text-gray-400" bg="bg-white" shadow="shadow-gray-200/50" />
        <ActionButton 
          onClick={() => onConnect?.(user.id)}
          icon={<Heart className="w-7 h-7 fill-white" />} 
          color="text-white" 
          bg="bg-gradient-to-tr from-pink-500 to-purple-600" 
          large 
          shadow="shadow-pink-300/50" 
        />
        <ActionButton icon={<Star className="w-6 h-6" />} color="text-amber-400" bg="bg-white" shadow="shadow-amber-100" />
      </div>
    </div>
  );
};

const ActionButton = ({ icon, color, bg, large, shadow, onClick }: { icon: React.ReactNode, color: string, bg: string, large?: boolean, shadow: string, onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.1, y: -2 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`${bg} ${color} ${shadow} ${large ? 'w-14 h-14' : 'w-12 h-12'} rounded-full flex items-center justify-center shadow-xl border border-gray-100 transition-all`}
  >
    {icon}
  </motion.button>
);
