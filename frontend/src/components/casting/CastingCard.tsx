import { type FC, useState } from 'react';
import { Heart, X, MapPin, Star, User } from 'lucide-react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';

interface CastingUser {
  id: string;
  full_name: string;
  username: string;
  age: number;
  distance: string;
  avatar_url?: string;
  is_premium?: boolean;
  bio?: string;
}

interface CastingCardProps {
  user: CastingUser;
  onMatch: (id: string) => void;
  onPass: (id: string) => void;
  onViewProfile: (id: string) => void;
}

const CastingCard: FC<CastingCardProps> = ({ user, onMatch, onPass, onViewProfile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const controls = useAnimation();

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const passOpacity = useTransform(x, [-120, -20], [1, 0]);
  const cardOpacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);

  const handleDragEnd = async (_: any, info: any) => {
    const threshold = 130;
    if (info.offset.x > threshold) {
      await controls.start({ x: 600, opacity: 0, transition: { duration: 0.3 } });
      onMatch(user.id);
    } else if (info.offset.x < -threshold) {
      await controls.start({ x: -600, opacity: 0, transition: { duration: 0.3 } });
      onPass(user.id);
    } else {
      controls.start({ x: 0, rotate: 0, transition: { type: 'spring', stiffness: 300 } });
    }
    setIsDragging(false);
  };

  const handleMatch = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await controls.start({ x: 600, opacity: 0, rotate: 15, transition: { duration: 0.4 } });
    onMatch(user.id);
  };

  const handlePass = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await controls.start({ x: -600, opacity: 0, rotate: -15, transition: { duration: 0.4 } });
    onPass(user.id);
  };

  return (
    <motion.div
      style={{ x, rotate, opacity: cardOpacity }}
      animate={controls}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      className="relative aspect-[3/4] rounded-[32px] overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl cursor-grab active:cursor-grabbing select-none"
    >
      {/* User Image */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        onClick={() => !isDragging && onViewProfile(user.id)}
      >
        {user.avatar_url ? (
          <img
            src={`http://localhost:8080${user.avatar_url}`}
            alt={user.full_name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-600/30 to-purple-800/30 flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
              <User className="w-10 h-10 text-white/40" />
            </div>
            <p className="text-white/20 font-black text-4xl italic tracking-tighter">LOCO</p>
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

      {/* LIKE stamp — shows when dragging right */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-12 left-6 rotate-[-20deg] border-4 border-green-400 rounded-xl px-4 py-1 z-30 pointer-events-none"
      >
        <span className="text-green-400 font-black text-3xl tracking-widest">MATCH</span>
      </motion.div>

      {/* NOPE stamp — shows when dragging left */}
      <motion.div
        style={{ opacity: passOpacity }}
        className="absolute top-12 right-6 rotate-[20deg] border-4 border-red-400 rounded-xl px-4 py-1 z-30 pointer-events-none"
      >
        <span className="text-red-400 font-black text-3xl tracking-widest">NOPE</span>
      </motion.div>

      {/* Tags */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20 pointer-events-none">
        <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold text-white flex items-center gap-1">
          <MapPin className="w-3 h-3 text-pink-400" />
          {user.distance} away
        </div>
        {user.is_premium && (
          <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-[10px] font-black text-black flex items-center gap-1 shadow-lg">
            <Star className="w-3 h-3 fill-black" />
            PREMIUM
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col z-20 pointer-events-none">
        <div className="mb-3">
          <h3 className="text-xl font-black text-white leading-tight tracking-tight">
            {user.full_name}{user.age && user.age !== 25 ? `, ${user.age}` : ''}
          </h3>
          <p className="text-xs text-white/50 font-medium">@{user.username}</p>
          {user.bio && <p className="text-xs text-white/70 mt-1 line-clamp-2">{user.bio}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={handlePass}
            className="flex-1 h-12 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-400/50 transition-all active:scale-95 group/btn"
          >
            <X className="w-6 h-6 text-white group-hover/btn:text-red-400 transition-colors" />
          </button>
          <button
            onClick={handleMatch}
            className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-[#ee2a7b] to-[#6228d7] flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(238,42,123,0.5)] transition-all active:scale-95 shadow-lg group/btn"
          >
            <Heart className="w-5 h-5 text-white fill-white group-hover/btn:scale-125 transition-transform" />
            <span className="text-sm font-black text-white uppercase tracking-wider">Match</span>
          </button>
        </div>
      </div>

      {/* Hover glow border */}
      <div className="absolute inset-0 border-2 border-transparent hover:border-purple-500/30 rounded-[32px] transition-all pointer-events-none" />
    </motion.div>
  );
};

export default CastingCard;
