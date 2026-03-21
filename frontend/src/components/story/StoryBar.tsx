import { type FC } from 'react';
import { Plus } from 'lucide-react';

interface StoryBarProps {
  stories: any[];
  user: any;
  onCreateStory: () => void;
  onStoryClick: (stories: any[], index: number) => void;
}

const StoryBar: FC<StoryBarProps> = ({ stories, user, onCreateStory, onStoryClick }) => {
  // Group stories by username to show one circle per user
  // This logic should probably group own stories first
  const userStories = stories.filter(s => s.username === user?.username);
  const otherStories = stories.filter(s => s.username !== user?.username);
  
  const uniqueOtherStories = Array.from(new Map(otherStories.map(s => [s.username, s])).values());
  
  // Track viewed state locally for demo/UX
  // In a real app, this would be backend-driven
  const getViewedStatus = (username: string) => {
    return localStorage.getItem(`story_viewed_${username}`) === 'true';
  };

  return (
    <div className="flex gap-6 overflow-x-auto no-scrollbar py-2">
      {/* Persistent "Add Story" Button / Your Story */}
      <div 
        onClick={userStories.length > 0 ? () => onStoryClick(userStories, 0) : onCreateStory}
        className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group relative"
      >
        <div className={`w-[72px] h-[72px] rounded-full p-[3px] transition-all duration-300 group-hover:scale-105 active:scale-95 ${userStories.length > 0 ? 'bg-gradient-to-tr from-[#EE2A7B] to-[#6228D7]' : 'border-2 border-dashed border-slate-600 bg-transparent'}`}>
          <div className="w-full h-full rounded-full border-[3px] border-[#0B0F19] bg-zinc-900 flex items-center justify-center overflow-hidden relative">
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:8080${user.avatar_url}`} 
                className="w-full h-full object-cover" 
                alt="You"
              />
            ) : (
              <span className="text-xl font-bold text-white uppercase">{user?.full_name?.charAt(0) || 'U'}</span>
            )}
            
            {/* The Plus Badge (only if no stories) */}
            {userStories.length === 0 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                 <Plus className="w-8 h-8 text-white opacity-80" strokeWidth={2} />
              </div>
            )}
          </div>
        </div>
        <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">Your Story</span>
      </div>

      {/* Dynamic User Stories */}
      {uniqueOtherStories.map((story) => {
        const isViewed = getViewedStatus(story.username);
        const thisUserStories = stories.filter(s => s.username === story.username);
        return (
          <div 
            key={story.id} 
            onClick={() => onStoryClick(thisUserStories, 0)}
            className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer"
          >
            <div className={`
              w-[72px] h-[72px] rounded-full p-[3px] transition-all duration-300 group-hover:scale-105 active:scale-95
              ${isViewed ? 'bg-slate-700' : 'bg-gradient-to-tr from-[#EE2A7B] to-[#6228D7]'}
            `}>
              <div className="w-full h-full rounded-full border-[3px] border-[#0B0F19] bg-zinc-900 overflow-hidden">
                {story.avatar_url ? (
                  <img 
                    src={story.avatar_url.startsWith('http') ? story.avatar_url : `http://localhost:8080${story.avatar_url}`} 
                    alt={story.username} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white uppercase italic">
                    {story.username.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <span className={`text-[11px] font-bold max-w-[72px] truncate transition-colors ${isViewed ? 'text-slate-500' : 'text-slate-300'}`}>
              {story.username}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export { StoryBar };
