import React from 'react';

interface Story {
  id: string;
  username: string;
  media_url: string;
  distance?: string;
}

interface NearbyStoriesGridProps {
  stories: Story[];
}

export const NearbyStoriesGrid: React.FC<NearbyStoriesGridProps> = ({ stories = [] }) => {
  if (!Array.isArray(stories) || stories.length === 0) return null;
  
  return (
    <div className="flex flex-col gap-4 mb-4">
      <h3 className="text-xs font-black text-gray-400 uppercase italic">Nearby</h3>
      <div className="grid grid-cols-3 gap-2">
        {stories.slice(0, 9).map((s, i) => (
          <div key={i} className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative group">
            {s?.media_url && <img src={`http://localhost:8080${s.media_url}`} className="w-full h-full object-cover relative z-0" alt="" />}
            
            {/* Dark overlay for text readability */}
            <div className="absolute z-10 inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 opacity-90 transition-opacity">
              <span className="text-[11px] font-bold text-white leading-tight truncate">
                {s.username || 'user'}
              </span>
              {s.distance && (
                <span className="text-[9px] font-semibold text-white/80">
                  {s.distance}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
