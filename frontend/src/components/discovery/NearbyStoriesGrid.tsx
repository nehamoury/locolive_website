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

export const NearbyStoriesGrid: React.FC<NearbyStoriesGridProps> = ({ stories }) => {
  return (
    <div className="flex flex-col gap-4 mb-10">
      <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2 italic uppercase">
        Nearby Stories <span className="text-pink-500">📍</span>
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {stories.map((story, i) => (
          <div key={i} className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm active:scale-95 transition-all">
            <img 
               src={`http://localhost:8080${story.media_url}`} 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
               alt="" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-100 group-hover:opacity-80 transition-opacity" />
            <div className="absolute bottom-2 left-2 text-white">
              <p className="text-[10px] font-black italic tracking-tight">{story.username}</p>
              <p className="text-[8px] font-bold text-white/70 uppercase tracking-tighter opacity-80">
                {story.distance || '0.5km'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
