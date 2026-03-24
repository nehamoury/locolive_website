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
        <div className={`w-[78px] h-[78px] rounded-full p-[2px] transition-all duration-300 group-hover:scale-105 active:scale-95 ${userStories.length > 0 ? 'bg-gradient-to-tr from-pink-500 to-purple-600' : 'border-2 border-dashed border-gray-200 bg-transparent'}`}>
          <div className="w-full h-full rounded-full border-[3px] border-white bg-white flex items-center justify-center overflow-hidden relative shadow-sm">
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:8080${user.avatar_url}`} 
                className="w-full h-full object-cover" 
                alt="You"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 text-xl font-bold text-gray-300 uppercase italic">
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || '?'}
              </div>
            )}
            
            {/* The Plus Badge (only if no stories) */}
            {userStories.length === 0 && (
              <div className="absolute inset-0 bg-white flex items-center justify-center">
                 <Plus className="w-7 h-7 text-pink-500" strokeWidth={3} />
              </div>
            )}
          </div>
        </div>
        <span className="text-[11px] font-bold text-gray-500 group-hover:text-pink-600 transition-colors uppercase tracking-tight">Your Story</span>
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
              w-[78px] h-[78px] rounded-full p-[2px] transition-all duration-300 group-hover:scale-105 active:scale-95 shadow-sm
              ${isViewed ? 'bg-gray-200' : 'bg-gradient-to-tr from-pink-500 to-purple-600'}
            `}>
              <div className="w-full h-full rounded-full border-[3px] border-white bg-white overflow-hidden">
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
            <span className={`text-[11px] font-bold max-w-[78px] truncate transition-colors uppercase tracking-tight ${isViewed ? 'text-gray-400' : 'text-pink-600'}`}>
              {story.username}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export { StoryBar };
