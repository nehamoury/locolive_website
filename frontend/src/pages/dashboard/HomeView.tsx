import { type FC } from 'react';
import { RefreshCcw, Heart, MessageSquare, Share2, MapPin, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { StoryBar } from '../../components/story/StoryBar';
import { Button } from '../../components/ui/button';

interface HomeViewProps {
  stories: any[];
  user: any;
  loading: boolean;
  onRefresh: () => void;
  onCreateStory: () => void;
  onStoryClick: (userStories: any[], index: number) => void;
}

const HomeView: FC<HomeViewProps> = ({ stories, user, loading, onRefresh, onCreateStory, onStoryClick }) => {
  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar relative w-full pb-20 md:pb-0">
      
      {/* Main Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-6 lg:px-10 py-4 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Home</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-xs font-semibold text-gray-500 hover:text-gray-800 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onCreateStory}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-xs font-bold shadow-md hover:shadow-pink-300 transition-all active:scale-95"
          >
            + Create Post
          </button>
        </div>
      </div>

      {/* Stories Bar Container */}
      <div className="px-6 lg:px-10 py-4 border-b border-gray-100">
        <StoryBar 
          stories={stories} 
          user={user} 
          onCreateStory={onCreateStory}
          onStoryClick={onStoryClick}
        />
      </div>

      {/* Vertical Feed Area */}
      <div className="flex-1 px-6 lg:px-10 py-6 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-pink-500" />
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Posts Nearby</h3>
            <p className="text-gray-400 max-w-xs mb-6 text-sm">Be the first to share something amazing happening around you.</p>
            <Button variant="primary" onClick={onCreateStory}>Create a Post</Button>
          </div>
        ) : (
          <div className="space-y-8">
            {stories.map((story) => (
              <motion.div 
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between px-5 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-pink-500 to-purple-600">
                      <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                        {story.avatar_url ? (
                          <img src={`http://localhost:8080${story.avatar_url}`} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-pink-500 font-bold text-sm">{story.username?.charAt(0)?.toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-sm flex items-center gap-1">
                        {story.full_name || story.username}
                        <span className="text-pink-500">✓</span>
                      </span>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-gray-400">
                          {(() => {
                            const diff = Math.floor((Date.now() - new Date(story.created_at).getTime()) / 60000);
                            if (diff < 60) return `${diff} minutes ago`;
                            return `${Math.floor(diff/60)} hours ago`;
                          })()}
                        </span>
                        <span className="text-pink-500 flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3" />
                          {story.location_name || 'Nearby'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-300 hover:text-gray-600 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Caption */}
                {story.caption && (
                  <p className="px-5 text-gray-700 text-sm leading-relaxed">{story.caption}</p>
                )}

                {/* Post Image/Video */}
                <div 
                  className="w-full aspect-[4/3] overflow-hidden bg-gray-100 relative cursor-pointer group"
                  onClick={() => {
                    const userStories = stories.filter(s => s.username === story.username);
                    onStoryClick(userStories, userStories.findIndex(s => s.id === story.id));
                  }}
                >
                  <div className="absolute inset-0 bg-black/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {story.media_type === 'video' ? (
                    <video src={`http://localhost:8080${story.media_url}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" autoPlay loop muted playsInline />
                  ) : (
                    <img src={`http://localhost:8080${story.media_url}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                  )}
                </div>

                {/* Interaction Footer */}
                <div className="flex items-center justify-between px-5 pb-4">
                  <div className="flex items-center gap-5">
                    <button className="flex items-center gap-1.5 text-gray-400 hover:text-pink-500 transition-colors group">
                      <Heart className={`w-5 h-5 ${story.liked ? 'fill-pink-500 text-pink-500' : 'group-hover:fill-pink-100'}`} />
                      <span className="text-xs font-semibold">{story.likes_count || ''}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                      <MessageSquare className="w-5 h-5" />
                      <span className="text-xs font-semibold"></span>
                    </button>
                    <button className="text-gray-400 hover:text-gray-700 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeView;
