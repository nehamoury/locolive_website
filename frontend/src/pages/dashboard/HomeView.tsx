import { useState, useEffect, type FC } from 'react';
import { MapPin, Plus, Search, Bell, MessageCircle, PanelRight } from 'lucide-react';
import { StoryBar } from '../../components/story/StoryBar';
import PostCard from '../../components/post/PostCard';
import api from '../../services/api';

interface HomeViewProps {
  stories: any[];
  user: any;
  loading: boolean;
  onCreateStory: () => void;
  onStoryClick: (userStories: any[], index: number) => void;
  showPanel: boolean;
  onTogglePanel: () => void;
}

const HomeView: FC<HomeViewProps> = ({ stories, user, loading, onCreateStory, onStoryClick, showPanel, onTogglePanel }) => {
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
    <div className="flex flex-col h-full bg-[#ffffff] overflow-y-auto no-scrollbar relative w-full pb-20 md:pb-0">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between shrink-0">
        {/* Search bar on the left */}
        <div className="flex-1 max-w-md relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-full text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:bg-white focus:border-pink-100 focus:ring-4 focus:ring-pink-50/20 transition-all"
          />
        </div>

        {/* Actions on the right */}
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-pink-50 hover:text-pink-500 transition-all cursor-pointer">
            <Bell className="w-5 h-5" />
          </button>

          <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-pink-50 hover:text-pink-500 transition-all cursor-pointer">
            <MessageCircle className="w-5 h-5" />
          </button>

          <button
            onClick={onTogglePanel}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer ${showPanel ? 'bg-pink-50 text-pink-500' : 'text-gray-400 hover:bg-gray-50'}`}
            title={showPanel ? "Hide Sidebar" : "Show Sidebar"}
          >
            <PanelRight className="w-5 h-5" />
          </button>

          <button
            onClick={onCreateStory}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-[#FF3B8E] to-[#A436EE] text-white rounded-full text-sm font-black shadow-[0_8px_20px_-6px_rgba(255,59,142,0.4)] hover:scale-[1.02] transition-all cursor-pointer whitespace-nowrap ml-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Create Post
          </button>
        </div>
      </div>

      {/* ── Left-Aligned Content ─────────────────────────────── */}
      <div className="flex-1 w-full px-6 pb-20 flex flex-col items-start translate-y-2">

        {/* Stories Card */}
        <div className="w-full bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-[11px] font-black text-gray-300 uppercase tracking-[0.1em]">Stories Nearby</h2>
          </div>
          <StoryBar
            stories={stories}
            user={user}
            onCreateStory={onCreateStory}
            onStoryClick={onStoryClick}
          />
        </div>

        {/* Feed List */}
        <div className="w-full flex flex-col items-start gap-6">
          {(loading || loadingPosts) ? (
            <div className="w-full flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF3B8E]" />
            </div>
          ) : posts.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center text-center py-24 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2">No updates near you</h3>
              <p className="text-gray-400 max-w-xs mb-8 text-sm font-medium">
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
