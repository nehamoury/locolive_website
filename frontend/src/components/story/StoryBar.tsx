import React from 'react';
import { Plus } from 'lucide-react';

interface StoryBarProps {
  stories: any[];
  user: any;
  onCreateStory: () => void;
  onStoryClick: (index: number) => void;
}

const StoryBar: React.FC<StoryBarProps> = ({ stories, user, onCreateStory, onStoryClick }) => {
  // Group stories by username to show one circle per user
  const uniqueStories = Array.from(new Map(stories.map(s => [s.username, s])).values());

  return (
    <div className="flex gap-4 p-4 overflow-x-auto no-scrollbar bg-black/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
      {/* Create Story */}
      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
        <div 
          onClick={onCreateStory}
          className="relative w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all overflow-hidden"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="You" className="w-full h-full object-cover opacity-80" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center translate-x-1 translate-y-1">
            <Plus className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        </div>
        <span className="text-[11px] font-medium text-gray-400">Your Story</span>
      </div>

      {/* Dynamic Stories */}
      {uniqueStories.map((story) => (
        <div 
          key={story.id} 
          onClick={() => onStoryClick(stories.indexOf(story))}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] group-hover:scale-105 active:scale-95 transition-all">
            <div className="w-full h-full rounded-full border-2 border-black bg-zinc-900 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white uppercase italic">
                {story.username.charAt(0)}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-medium text-gray-400 max-w-[64px] truncate">
            {story.username}
          </span>
        </div>
      ))}
    </div>
  );
};

export { StoryBar };
