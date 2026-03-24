import React from 'react';
import { X, Star, Heart, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface PeopleNearbyCardProps {
  user: {
    username: string;
    full_name?: string;
    avatar_url?: string;
    distance?: string;
    bio?: string;
    tags?: string[];
  };
}

export const PeopleNearbyCard: React.FC<PeopleNearbyCardProps> = ({ user }) => {
  return (
    <div className="relative group">
      <div className="aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl relative border-4 border-white">
        {user.avatar_url ? (
          <img 
            src={`http://localhost:8080${user.avatar_url}`} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            alt={user.username} 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-5xl font-black text-pink-300 italic">
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* User Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-black italic tracking-tight">{user.full_name || user.username}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-bold uppercase tracking-widest mb-3">
             <MapPin className="w-3 h-3 text-pink-400" />
             {user.distance || '0.4km'} away · {user.bio || 'Exploring the area'}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(user.tags || ['Foodie 🍹', 'Reader 📚', 'Hiker 🏔️']).map((tag, i) => (
              <span key={i} className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold border border-white/10 uppercase">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <ActionButton icon={<X className="w-6 h-6" />} color="text-gray-400" bg="bg-white" shadow="shadow-gray-200" />
        <ActionButton icon={<Star className="w-5 h-5" />} color="text-yellow-500" bg="bg-white" aria-sm shadow="shadow-yellow-100" />
        <ActionButton icon={<Heart className="w-6 h-6 fill-white" />} color="text-white" bg="bg-gradient-to-tr from-pink-500 to-purple-600" large shadow="shadow-pink-300" />
      </div>
    </div>
  );
};

const ActionButton = ({ icon, color, bg, large, shadow }: { icon: React.ReactNode, color: string, bg: string, large?: boolean, shadow: string }) => (
  <motion.button
    whileHover={{ scale: 1.1, y: -2 }}
    whileTap={{ scale: 0.9 }}
    className={`${bg} ${color} ${shadow} ${large ? 'w-14 h-14' : 'w-12 h-12'} rounded-full flex items-center justify-center shadow-xl border border-gray-100 transition-all`}
  >
    {icon}
  </motion.button>
);
