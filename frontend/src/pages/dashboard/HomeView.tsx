import { useState, useEffect, type FC } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { StoryBar } from '../../components/story/StoryBar';
import PostCard from '../../components/post/PostCard';
import api from '../../services/api';

interface HomeViewProps {
  stories: any[];
  user: any;
  loading: boolean;
  onCreateStory: () => void;
  onStoryClick: (userStories: any[], index: number) => void;
}

const HomeView: FC<HomeViewProps> = ({ stories, user, loading, onCreateStory, onStoryClick }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await api.get('/posts/feed');
      setPosts(res.data?.posts || []);
    } catch {
      // Feed may be empty on fresh install — that's OK
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    console.log('HomeView mounted - Auto-refreshing feed...');
    fetchPosts();
  }, []);


  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar relative w-full pb-20 md:pb-0 font-poppins">
      {/* Main Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-10 py-8 flex items-center justify-between">
        <div className="flex items-center justify-end w-full gap-4">
          <button
            onClick={onCreateStory}
            className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-[#FF3B8E] to-[#A436EE] text-white rounded-full text-[14px] font-bold shadow-lg shadow-pink-100 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[4]" />
            Create
          </button>
        </div>
      </div>

      {/* ── Stories Bar ─────────────────────────────────────────── */}
      <div className="px-10 py-6 border-b border-gray-50 flex-shrink-0 min-h-[140px]">
        <StoryBar
          stories={stories}
          user={user}
          onCreateStory={onCreateStory}
          onStoryClick={onStoryClick}
        />
      </div>

      {/* ── Posts Feed ──────────────────────────────────────────── */}
      <div className="flex-1 px-10 py-4 max-w-4xl mx-auto w-full">

        {(loading || loadingPosts) ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF3B8E]" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-300 mb-4">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Posts Yet</h3>
            <p className="text-gray-400 max-w-xs mb-6 text-sm font-medium">
              Be the first to share something! Posts from people you follow will appear here.
            </p>
            <button
              onClick={onCreateStory}
              className="px-8 py-3 bg-gradient-to-r from-[#FF3B8E] to-[#A436EE] text-white rounded-full text-sm font-bold shadow-lg shadow-pink-100"
            >
              Create a Post
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post: any) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserID={user?.id}
                onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeView;
