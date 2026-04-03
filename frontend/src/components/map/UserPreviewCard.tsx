import React from 'react';
import { motion } from 'framer-motion';
import { X, Heart, ExternalLink, MapPin, Zap } from 'lucide-react';

interface UserPreviewCardProps {
  user: any;
  isConnection?: boolean;
  onClose: () => void;
  onConnect: (userId: string) => void;
  onProfileOpen: (userId: string) => void;
}

export const UserPreviewCard: React.FC<UserPreviewCardProps> = ({ user, isConnection, onClose, onConnect, onProfileOpen }) => {
  if (!user) return null;

  const userData = user.stories?.[0] || user;
  const avatar = userData.avatar_url 
    ? (userData.avatar_url.startsWith('http') ? userData.avatar_url : `http://localhost:8080${userData.avatar_url}`) 
    : null;
    
  const distance = userData.distance ? `${Number(userData.distance).toFixed(1)} km away` : 'Nearby';

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-sm px-4 pointer-events-auto"
    >
      <div className="bg-white/80 backdrop-blur-3xl border border-white/20 rounded-[40px] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-500/10 blur-[60px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[60px] rounded-full" />

        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 h-10 w-10 flex items-center justify-center bg-gray-50/50 hover:bg-gray-100 rounded-full text-gray-400 transition-all active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center relative z-10">
          <div className="relative group px-1 pt-1 pb-1">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-pink-500 to-purple-600 mb-5 relative">
              <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center border-4 border-white shadow-xl">
                {avatar ? (
                  <img src={avatar} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt="" />
                ) : (
                  <span className="text-3xl font-black text-pink-500 italic">{(userData.username || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
              
              {/* Online Indicator Badge */}
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-lg" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-black text-gray-900 italic tracking-tight translate-x-1">@{userData.username}</h3>
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">
            <MapPin className="w-3 h-3 text-pink-400" />
            {distance} · {user.isUserOnly ? 'Just Now' : `${user.count} Stories`}
          </div>
          
          <div className="flex gap-4 w-full">
            {isConnection ? (
              <div 
                className="flex-1 py-4 bg-gray-100 text-gray-500 font-black italic rounded-[24px] flex items-center justify-center gap-2 group cursor-default"
              >
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500" /> 
                <span>Connected</span>
              </div>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onConnect(userData.user_id || userData.id)}
                className="flex-1 py-4 bg-pink-500 text-white font-black italic rounded-[24px] shadow-xl shadow-pink-200 active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                <Heart className="w-4 h-4 transition-transform group-hover:scale-125" /> 
                <span>Like</span>
              </motion.button>
            )}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onProfileOpen(userData.user_id || userData.id)}
              className="flex-1 py-4 bg-white/50 border border-white/40 text-gray-900 font-black italic rounded-[24px] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm hover:bg-white"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Profile</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
