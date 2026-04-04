import { useState, useEffect, type FC } from 'react';
import { MapPin, Plus, Search, Bell, MessageCircle, PanelRight } from 'lucide-react';
import { StoryBar } from '../../components/story/StoryBar';
import PostCard from '../../components/post/PostCard';
import PostInputBox from '../../components/post/PostInputBox';
import api from '../../services/api';

interface HomeViewProps {
  stories: any[];
  user: any;
  loading: boolean;
  onCreateStory: () => void;
  onStoryClick: (userStories: any[], index: number) => void;
  showPanel: boolean;
  onTogglePanel: () => void;
  onNavigate: (tab: any) => void;
  unreadNotificationsCount?: number;
  unreadMessagesCount?: number;
}

const HomeView: FC<HomeViewProps> = ({ stories, user, loading, onCreateStory, onStoryClick, showPanel, onTogglePanel, onNavigate, unreadNotificationsCount = 0, unreadMessagesCount = 0 }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await api.get('/posts/feed');
      setPosts(res.data?.posts || []);
    } catch {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto no-scrollbar relative w-full pb-20 md:pb-0 font-poppins">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-bg-card/95 backdrop-blur-xl px-6 pt-5 pb-5 flex items-center justify-between shrink-0 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border-b border-border-base transition-colors duration-300">
        {/* Search bar on the left */}
        <div className="flex-1 relative group mr-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-[#FF3B8E] transition-colors" />
          <input
            type="text"
            placeholder="Search people, posts, locations..."
            className="w-full pl-12 pr-4 py-3 bg-bg-base border border-transparent rounded-full text-[13.5px] font-medium text-text-base placeholder-text-muted/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:bg-bg-base/80 focus:outline-none focus:bg-bg-card focus:border-primary/20 focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Actions on the right */}
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('notifications')} className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-bg-base text-text-muted hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-black rounded-full border-2 border-bg-card flex items-center justify-center shadow-sm">{unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}</span>}
          </button>

          <button onClick={() => onNavigate('messages')} className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-bg-base text-text-muted hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
            <MessageCircle className="w-5 h-5" />
            {unreadMessagesCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-black rounded-full border-2 border-bg-card flex items-center justify-center shadow-sm">{unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}</span>}
          </button>

          <button
            onClick={onTogglePanel}
            className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-colors ${showPanel ? 'bg-primary/10 text-primary' : 'bg-bg-base text-text-muted hover:bg-primary/10 hover:text-primary'}`}
            title={showPanel ? "Hide Sidebar" : "Show Sidebar"}
          >
            <PanelRight className="w-5 h-5" />
          </button>

          <button
            onClick={onCreateStory}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#FF3B8E] to-[#A436EE] text-white rounded-[20px] text-[13px] font-bold shadow-[0_8px_20px_-6px_rgba(255,59,142,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(255,59,142,0.5)] hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap ml-1"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Create Post
          </button>
        </div>
      </div>

      {/* ── Left-Aligned Content ─────────────────────────────── */}
      <div className="flex-1 w-full px-6 pt-6 pb-20 flex flex-col items-start bg-transparent">

        {/* Stories Card */}
        <div className="w-full bg-bg-card rounded-[24px] border border-border-base shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-5 mb-6 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-[17px] font-bold text-text-base tracking-tight">Stories Nearby</h2>
            <div className="flex items-center gap-1">
               <button className="w-7 h-7 flex items-center justify-center rounded-full bg-bg-base text-text-muted hover:text-text-base hover:bg-bg-base/80 transition-colors">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
               </button>
               <button className="w-7 h-7 flex items-center justify-center rounded-full bg-bg-base text-text-muted hover:text-text-base hover:bg-bg-base/80 transition-colors">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
               </button>
            </div>
          </div>
          <StoryBar
            stories={stories}
            user={user}
            onCreateStory={onCreateStory}
            onStoryClick={onStoryClick}
          />
        </div>

        {/* Post Input Box */}
        <div className="w-full max-w-3xl mb-6">
          <div className="bg-bg-card rounded-full p-2 border border-border-base shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex items-center justify-center transition-colors duration-300">
            <PostInputBox user={user} onClick={onCreateStory} />
          </div>
        </div>

        {/* Feed List */}
        <div className="w-full flex flex-col items-start gap-6">
          {(loading || loadingPosts) ? (
            <div className="w-full max-w-3xl flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-transparent border-t-[#FF3B8E]" />
            </div>
          ) : posts.length === 0 ? (
            <div className="w-full max-w-3xl flex flex-col items-center justify-center text-center py-24 bg-bg-card rounded-[24px] border border-border-base shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-colors duration-300">
              <div className="w-16 h-16 bg-bg-base rounded-full flex items-center justify-center text-text-muted mb-6">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text-base mb-2 tracking-tight">No updates near you</h3>
              <p className="text-text-muted max-w-xs mb-8 text-sm font-medium">
                Try following more people or sharing your own moment!
              </p>
            </div>
          ) : (
            posts.map((post: any) => (
              <div key={post.id} className="w-full max-w-3xl">
                <PostCard
                  post={post}
                  currentUserID={user?.id}
                  onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeView;
