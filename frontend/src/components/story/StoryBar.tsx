import { type FC } from 'react';
import { Plus } from 'lucide-react';

interface StoryBarProps {
  stories: any[];
  user: any;
  onCreateStory: () => void;
  onStoryClick: (stories: any[], index: number) => void;
}

const StoryBar: FC<StoryBarProps> = ({ stories = [], user, onCreateStory, onStoryClick }) => {
  const myStories = (stories || []).filter(s => s && s.username === user?.username);
  const otherStories = (stories || []).filter(s => s && s.username !== user?.username);
  const uniqueOtherStories = Array.from(new Map(otherStories.filter(s => s && s.username).map(s => [s.username, s])).values());
  
  const getViewedStatus = (username: string) => {
    return localStorage.getItem(`story_viewed_${username}`) === 'true';
  };

  const hasMyStories = myStories.length > 0;

  return (
    <div className="flex gap-6 overflow-x-auto no-scrollbar py-2 font-poppins min-h-[130px]">
      {/* Your Story */}
      <div 
        onClick={() => hasMyStories ? onStoryClick(myStories, 0) : onCreateStory()}
        className="flex flex-col items-center gap-2.5 flex-shrink-0 cursor-pointer group"
      >
        <div className={`
          w-[76px] h-[76px] rounded-full p-[2px] transition-all duration-300 group-hover:scale-105 active:scale-95 relative
          ${hasMyStories ? 'bg-gradient-to-tr from-[#FF3B8E] to-[#A436EE]' : 'border-2 border-dashed border-gray-100'}
        `}>
          <div className="w-full h-full rounded-full border-[3px] border-white bg-white overflow-hidden flex items-center justify-center">
            {user?.avatar_url || (hasMyStories && myStories[0].avatar_url) ? (
              <img 
                src={user?.avatar_url?.startsWith('http') ? user.avatar_url : `http://localhost:8080${user?.avatar_url || myStories[0].avatar_url}`} 
                alt="My Story" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[#FF3B8E] font-bold text-xl uppercase">
                {user?.username?.charAt(0) || 'Y'}
              </div>
            )}
          </div>
          
          {/* Blue Plus Overlay */}
          <div 
            onClick={(e) => { e.stopPropagation(); onCreateStory(); }}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#38BDF8] border-[3px] border-white flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform"
          >
            <Plus className="w-4 h-4 stroke-[4]" />
          </div>
        </div>
        <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-800 transition-colors tracking-tight">Your story</span>
      </div>

      {/* Dynamic User Stories */}
      {uniqueOtherStories.map((story, index) => {
        const isViewed = getViewedStatus(story.username);
        const thisUserStories = stories.filter(s => s.username === story.username);
        const isLive = index === 0; // Mocking first story as LIVE for visual alignment

        return (
          <div 
            key={story.id} 
            onClick={() => onStoryClick(thisUserStories, 0)}
            className="flex flex-col items-center gap-2.5 flex-shrink-0 group cursor-pointer"
          >
            <div className={`
              w-[76px] h-[76px] rounded-full p-[2.5px] transition-all duration-300 group-hover:scale-105 active:scale-95 relative shadow-sm
              ${isViewed ? 'bg-gray-200' : 'bg-gradient-to-tr from-[#FF3B8E] to-[#6366F1]'}
            `}>
              <div className="w-full h-full rounded-full border-[3px] border-white bg-white overflow-hidden">
                {story?.avatar_url ? (
                  <img src={`http://localhost:8080${story.avatar_url}`} alt={story.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[#FF3B8E] font-bold text-xl uppercase">
                    {story?.username?.charAt(0) || '?'}
                  </div>
                )}
              </div>

              {/* LIVE Badge */}
              {isLive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF3B8E] to-[#A436EE] text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm border-2 border-white uppercase tracking-tighter">
                  LIVE
                </div>
              )}
            </div>
            <span className={`text-[11px] font-bold max-w-[76px] truncate transition-colors tracking-tight ${isViewed ? 'text-gray-400' : 'text-gray-600'}`}>
              {story?.username || 'User'}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export { StoryBar };
