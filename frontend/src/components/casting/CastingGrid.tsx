import { type FC } from 'react';
import { motion } from 'framer-motion';
import CastingCard from './CastingCard';

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

interface CastingGridProps {
  users: CastingUser[];
  onMatch: (id: string) => void;
  onPass: (id: string) => void;
  onViewProfile: (id: string) => void;
  loading: boolean;
}

const CastingGrid: FC<CastingGridProps> = ({ users, onMatch, onPass, onViewProfile, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="aspect-[3/4] rounded-[32px] bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-full flex flex-col items-center justify-center p-8 text-center"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-full flex items-center justify-center mb-6 border border-white/10">
          <span className="text-4xl">✨</span>
        </div>
        <h3 className="text-xl font-black mb-2 text-white">You've seen everyone!</h3>
        <p className="text-gray-500 max-w-sm mb-6 text-sm">
          No more people nearby right now. Check back later or refresh to see new faces!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 pb-24">
      {users.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <CastingCard
            user={user}
            onMatch={onMatch}
            onPass={onPass}
            onViewProfile={onViewProfile}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default CastingGrid;
