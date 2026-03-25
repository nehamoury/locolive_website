import React from 'react';

interface Crossing {
  user_id: string;
  username: string;
  avatar_url?: string;
  last_crossing_at?: string;
  crossing_count: number;
}

interface PathCrossingsListProps {
  crossings: Crossing[];
  onUserSelect?: (userId: string) => void;
}

const formatRelativeTime = (dateStr?: string) => {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMins < 1) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
};

export const PathCrossingsList: React.FC<PathCrossingsListProps> = ({ crossings, onUserSelect }) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">
          Path Crossings <span className="text-lg">🏃</span>
        </h3>
      </div>
      
      <div className="space-y-6">
        {crossings.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 p-8 rounded-[32px] text-center">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No crossings yet</p>
          </div>
        ) : (
          crossings.slice(0, 3).map((c) => (
            <div 
              key={c.user_id} 
              onClick={() => onUserSelect?.(c.user_id)}
              className="flex items-center gap-4 group px-2 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg shadow-pink-500/5 group-hover:from-pink-500 group-hover:to-purple-600 transition-all duration-300">
                  <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center border-2 border-white">
                    {c.avatar_url ? (
                      <img src={`http://localhost:8080${c.avatar_url}`} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="font-black text-pink-500 text-lg italic">{(c.username?.charAt(0) || 'U').toUpperCase()}</span>
                    )}
                  </div>
                </div>
                {c.crossing_count > 1 && (
                  <div className="absolute -bottom-1 -left-1 bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[8px] font-black border-2 border-white shadow-md">
                    {c.crossing_count}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-base font-black text-black italic tracking-tighter truncate uppercase group-hover:text-pink-600 transition-colors">@{c.username}</h4>
                  <span className="text-[11px] font-black text-pink-600 italic tracking-tighter">
                    x{c.crossing_count}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight truncate">
                  Near You · {formatRelativeTime(c.last_crossing_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
