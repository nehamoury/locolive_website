import React from 'react';

interface Crossing {
  user_id: string;
  username: string;
  avatar_url?: string;
  location_name?: string;
  crossed_at?: string;
  connected?: boolean;
  count?: number;
}

interface PathCrossingsListProps {
  crossings: Crossing[];
}

export const PathCrossingsList: React.FC<PathCrossingsListProps> = ({ crossings }) => {
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
          crossings.slice(0, 3).map((c, i) => (
            <div key={i} className="flex items-center gap-4 group px-2 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
              <div className="relative">
                <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/20">
                  <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center border-2 border-white">
                    {c.avatar_url ? (
                      <img src={`http://localhost:8080${c.avatar_url}`} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="font-black text-pink-500 text-lg italic">{c.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-1 -left-1 bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[8px] font-black border-2 border-white shadow-md">
                  {i === 0 ? 3 : i === 1 ? 7 : 2}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-base font-black text-black italic tracking-tighter truncate uppercase">{c.username}</h4>
                  <span className="text-[11px] font-black text-pink-600 italic tracking-tighter">
                    x{i === 0 ? 3 : i === 1 ? 7 : 2}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight truncate">
                  Near {c.location_name || 'Civil Lines'} · {c.crossed_at || '2h ago'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
