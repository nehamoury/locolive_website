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
    <div className="flex flex-col gap-6 mb-10 px-2">
      <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">
        Nearby Stories <span className="text-lg">📍</span>
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {stories.map((story, i) => (
          <div key={i} className="aspect-square rounded-[24px] overflow-hidden relative group cursor-pointer shadow-md active:scale-95 transition-all border-2 border-white shadow-pink-500/5">
            <img 
               src={`http://localhost:8080${story.media_url}`} 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
               alt="" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 group-hover:opacity-80 transition-opacity" />
            <div className="absolute bottom-2.5 left-2.5 text-white">
              <p className="text-[9px] font-black italic tracking-tighter uppercase">{story.username}</p>
              <p className="text-[8px] font-bold text-white/60 uppercase tracking-widest opacity-80">
                {story.distance || '0.5km'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
