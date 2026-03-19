import { type FC } from 'react';
import CastingCard from './CastingCard';

interface CastingUser {
  id: string;
  full_name: string;
  username: string;
  age: number;
  distance: string;
  avatar_url?: string;
  is_premium?: boolean;
}

interface CastingGridProps {
  users: CastingUser[];
  onMatch: (id: string) => void;
  onPass: (id: string) => void;
  loading: boolean;
}

const CastingGrid: FC<CastingGridProps> = ({ users, onMatch, onPass, loading }) => {
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
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <div className="w-10 h-10 border-2 border-dashed border-purple-500 rounded-full animate-spin" />
        </div>
        <h3 className="text-xl font-bold mb-2">Finding new faces...</h3>
        <p className="text-gray-500 max-w-sm">We're searching for more users in your area. Check back in a moment!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 pb-24">
      {users.map((user) => (
        <CastingCard 
          key={user.id} 
          user={user} 
          onMatch={onMatch} 
          onPass={onPass} 
        />
      ))}
    </div>
  );
};

export default CastingGrid;
