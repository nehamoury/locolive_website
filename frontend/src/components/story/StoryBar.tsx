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
    <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar py-2 font-poppins min-h-[140px] items-start pb-2">
      {/* Your Story */}
      <div 
        onClick={() => hasMyStories ? onStoryClick(myStories, 0) : onCreateStory()}
        className="flex flex-col items-center gap-2.5 flex-shrink-0 cursor-pointer group w-[76px]"
      >
        <div className={`
          w-[76px] h-[76px] rounded-full p-[2.5px] transition-all duration-300 group-hover:scale-105 active:scale-95 relative
          ${hasMyStories ? 'bg-gradient-to-tr from-primary to-accent group-hover:shadow-primary/20' : 'bg-gradient-to-tr from-primary/10 to-accent/10'}
        `}>
          <div className="w-full h-full rounded-full border-[3px] border-bg-card bg-bg-card overflow-hidden flex items-center justify-center">
            {user?.avatar_url || (hasMyStories && myStories[0].avatar_url) ? (
              <img 
                src={user?.avatar_url?.startsWith('http') ? user.avatar_url : `http://localhost:8080${user?.avatar_url || myStories[0].avatar_url}`} 
                alt="My Story" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-bg-sidebar text-primary font-black text-xl uppercase">
                {user?.username?.charAt(0) || 'Y'}
              </div>
            )}
          </div>
          
          {/* Blue Plus Overlay */}
          <div 
            onClick={(e) => { e.stopPropagation(); onCreateStory(); }}
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[22px] h-[22px] rounded-full bg-primary border-[2px] border-bg-card flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[4]" />
          </div>
        </div>
        <div className="flex flex-col items-center text-center mt-1">
          <span className="text-[12.5px] font-bold text-text-base transition-colors tracking-tight leading-none text-center">Your Story</span>
          <span className="text-[10px] text-text-muted mt-1 font-medium">Your Story</span>
        </div>
      </div>

      {/* Dynamic User Stories */}
      {uniqueOtherStories.map((story, index) => {
        const isViewed = getViewedStatus(story.username);
        const thisUserStories = stories.filter(s => s.username === story.username);
        
        // Mock distances for design effect
        const mockDistances = ['0.9 km away', '1.2 km away', '2.1 km away', '2.4 km away', '3.8 km away'];
        const distanceStr = mockDistances[index % mockDistances.length];

        return (
          <div 
            key={story.id} 
            onClick={() => onStoryClick(thisUserStories, 0)}
            className="flex flex-col items-center gap-2.5 flex-shrink-0 group cursor-pointer w-[76px]"
          >
            <div className={`
              w-[76px] h-[76px] rounded-full p-[2.5px] transition-all duration-300 group-hover:scale-105 active:scale-95 relative
              ${isViewed ? 'bg-border-base' : 'bg-gradient-to-tr from-primary to-accent group-hover:shadow-primary/20'}
            `}>
              <div className="w-full h-full rounded-full border-[3px] border-bg-card bg-bg-card overflow-hidden">
                {story?.avatar_url ? (
                  <img src={story.avatar_url.startsWith('http') ? story.avatar_url : `http://localhost:8080${story.avatar_url}`} alt={story.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-bg-sidebar text-primary font-black text-xl uppercase">
                    {story?.username?.charAt(0) || '?'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-center text-center mt-1">
              <span className={`text-[12.5px] font-bold max-w-[76px] truncate transition-colors tracking-tight leading-none text-center ${isViewed ? 'text-text-muted/60' : 'text-text-base'}`}>
                {story?.full_name?.split(' ')[0] || story?.username || 'User'}
              </span>
              <span className="text-[10px] text-text-muted/40 mt-1 font-medium whitespace-nowrap flex items-center gap-0.5">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted/30">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {distanceStr}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { StoryBar };
