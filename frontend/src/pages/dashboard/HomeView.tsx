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
    <div className="flex flex-col h-full bg-[#0B0F19] overflow-y-auto no-scrollbar relative w-full pb-20 md:pb-0">
      
      {/* Main Header */}
      <div className="sticky top-0 z-30 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/5 px-6 lg:px-10 py-6 flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Home</h1>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-slate-300 hover:text-white transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stories Bar Container */}
      <div className="px-6 lg:px-10 py-6 border-b border-white/5">
        <StoryBar 
          stories={stories} 
          user={user} 
          onCreateStory={onCreateStory}
          onStoryClick={onStoryClick}
        />
      </div>

      {/* Vertical Feed Area */}
      <div className="flex-1 px-6 lg:px-10 py-8 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#EE2A7B]" />
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-white/[0.02] rounded-[32px] border border-dashed border-white/10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-500 mb-4">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Posts Nearby</h3>
            <p className="text-slate-500 max-w-xs mb-6 text-sm">Be the first to share something amazing happening around you.</p>
            <Button variant="primary" onClick={onCreateStory}>Create a Post</Button>
          </div>
        ) : (
          <div className="space-y-12">
            {stories.map((story) => (
              <motion.div 
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-[#EE2A7B] to-[#6228D7]">
                      <div className="w-full h-full rounded-full bg-[#0B0F19] overflow-hidden flex items-center justify-center">
                        {story.avatar_url ? (
                          <img src={`http://localhost:8080${story.avatar_url}`} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-white font-bold">{story.username.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">{story.full_name || story.username}</span>
                      <div className="flex items-center gap-2 text-[11px] font-bold">
                        <span className="text-slate-500">
                          {(() => {
                            const diff = Math.floor((Date.now() - new Date(story.created_at).getTime()) / 60000);
                            if (diff < 60) return `${diff} minutes ago`;
                            return `${Math.floor(diff/60)} hours ago`;
                          })()}
                        </span>
                        <span className="text-[#EE2A7B] flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {story.location_name || 'Nearby'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-slate-500 hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Post Image/Video */}
                <div 
                  className="w-full aspect-square sm:aspect-[4/3] md:aspect-[16/9] rounded-[32px] overflow-hidden bg-black relative cursor-pointer group shadow-2xl"
                  onClick={() => {
                    const userStories = stories.filter(s => s.username === story.username);
                    onStoryClick(userStories, userStories.findIndex(s => s.id === story.id));
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {story.media_type === 'video' ? (
                    <video src={`http://localhost:8080${story.media_url}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" autoPlay loop muted playsInline />
                  ) : (
                    <img src={`http://localhost:8080${story.media_url}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                  )}
                  {story.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                      <p className="text-white font-medium text-sm drop-shadow-lg line-clamp-2">{story.caption}</p>
                    </div>
                  )}
                </div>

                {/* Interaction Footer */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-slate-400 hover:text-pink-500 transition-colors group">
                      <Heart className={`w-5 h-5 ${story.liked ? 'fill-pink-500 text-pink-500' : 'group-hover:fill-pink-500/20'}`} />
                      <span className="text-xs font-bold text-white group-hover:text-pink-500">{story.likes_count || '1.2K'}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors group">
                      <MessageSquare className="w-5 h-5 group-hover:fill-purple-400/20" />
                      <span className="text-xs font-bold text-white group-hover:text-purple-400">452</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors group">
                      <Share2 className="w-5 h-5 group-hover:fill-blue-400/20" />
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
