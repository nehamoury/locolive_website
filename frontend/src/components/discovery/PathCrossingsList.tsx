import React from 'react';
import { Footprints } from 'lucide-react';

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2 italic uppercase">
          Path Crossings <Footprints className="w-5 h-5 text-pink-500" />
        </h3>
      </div>
      
      <div className="space-y-4">
        {crossings.length === 0 ? (
          <div className="bg-white/50 border border-dashed border-gray-100 p-8 rounded-3xl text-center">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No crossings yet</p>
          </div>
        ) : (
          crossings.slice(0, 3).map((c, i) => (
            <div key={i} className="flex items-center gap-4 group">
              <div className="relative">
                <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-pink-500 to-purple-600 transition-transform group-hover:scale-110">
                  <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                    {c.avatar_url ? (
                      <img src={`http://localhost:8080${c.avatar_url}`} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="font-black text-pink-500 text-sm italic">{c.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>
                {c.count && c.count > 1 && (
                  <div className="absolute -bottom-1 -right-1 bg-white shadow-sm border border-gray-100 rounded-full w-5 h-5 flex items-center justify-center text-[8px] font-black text-pink-600">
                    x{c.count}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-gray-900 italic tracking-tight truncate">{c.username}</h4>
                  <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest bg-pink-50 px-2 py-0.5 rounded-full">
                    ×{c.count || 1}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 truncate">
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
