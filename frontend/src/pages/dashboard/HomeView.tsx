import { type FC } from 'react';
import { RefreshCcw, Heart, MessageSquare, Share2, MapPin, MoreHorizontal, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { StoryBar } from '../../components/story/StoryBar';

interface HomeViewProps {
  stories: any[];
  user: any;
  loading: boolean;
  onRefresh: () => void;
  onCreateStory: () => void;
  onStoryClick: (userStories: any[], index: number) => void;
}

const HomeView: FC<HomeViewProps> = ({ stories, user, loading, onRefresh, onCreateStory, onStoryClick }) => {
  const getHashtags = (text: string) => {
    const matches = text.match(/#[a-z0-9_]+/gi);
    return matches || [];
  };

  const cleanCaption = (text: string) => {
    return text.replace(/#[a-z0-9_]+/gi, '').trim();
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar relative w-full pb-20 md:pb-0 font-poppins">
      <style>{`
        .text-post-bubble p {
          text-align: left !important;
          margin-left: 0 !important;
          margin-right: auto !important;
          width: 100% !important;
          display: block !important;
          justify-content: flex-start !important;
        }
        .text-post-bubble {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          justify-content: flex-start !important;
        }
      `}</style>
      {/* Main Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-10 py-8 flex items-center justify-between">
        <h1 className="text-[32px] font-black text-gray-900 tracking-tighter">Home</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-[13px] font-bold text-gray-500 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={onCreateStory}
            className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-[#FF3B8E] to-[#A436EE] text-white rounded-full text-[14px] font-bold shadow-lg shadow-pink-100 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[4]" />
            Create Post
          </button>
        </div>
      </div>

      {/* Stories Bar Area */}
      <div className="px-10 py-2 border-b border-gray-50 flex-shrink-0 min-h-[140px]">
        <StoryBar 
          stories={stories} 
          user={user} 
          onCreateStory={onCreateStory}
          onStoryClick={onStoryClick}
        />
      </div>

      {/* Vertical Feed Area */}
      <div className="flex-1 px-10 py-10 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF3B8E]" />
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-300 mb-4">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Posts Nearby</h3>
            <p className="text-gray-400 max-w-xs mb-6 text-sm font-medium">Be the first to share something amazing happening around you.</p>
            <button 
              onClick={onCreateStory}
              className="px-8 py-3 bg-gradient-to-r from-[#FF3B8E] to-[#A436EE] text-white rounded-full text-sm font-bold shadow-lg shadow-pink-100"
            >
              Create a Post
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {stories.map((story) => {
              const tags = getHashtags(story.caption || '');
              const isTextOnly = story.media_type === 'text' || !story.media_url;

              return (
                <motion.div 
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-5 bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="flex items-center justify-between px-8 pt-8">
                    <div className="flex items-center gap-4">
                      <div className="w-[52px] h-[52px] rounded-full p-[2.5px] bg-gradient-to-br from-[#FF3B8E] to-[#A436EE]">
                        <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center border-[2px] border-white">
                          {story.avatar_url ? (
                            <img src={`http://localhost:8080${story.avatar_url}`} className="w-full h-full object-cover rounded-full" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[#FF3B8E] font-bold text-lg">
                              {story.username?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-base tracking-tight">
                            {story.full_name || story.username}
                          </span>
                          <div className="w-3.5 h-3.5 bg-[#4AA8FF] rounded-full flex items-center justify-center text-[8px] text-white font-black shadow-sm">✓</div>
                        </div>
                        <div className="flex items-center gap-2.5 text-[12px] font-bold">
                          <span className="text-gray-400">@{story.username}</span>
                          <span className="text-gray-300 font-medium">
                            {(() => {
                              const diff = Math.floor((Date.now() - new Date(story.created_at).getTime()) / 60000);
                              if (diff < 1) return 'just now';
                              if (diff < 60) return `${diff}m ago`;
                              if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
                              return `${Math.floor(diff/1440)}d ago`;
                            })()}
                          </span>
                          <span className="text-[#FF3B8E] flex items-center gap-1 bg-pink-50/50 px-2.5 py-0.5 rounded-full border border-pink-50">
                            <MapPin className="w-3 h-3 fill-[#FF3B8E] stroke-transparent" />
                            Near you
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-300 hover:text-gray-600 transition-colors p-2">
                      <MoreHorizontal className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="px-8 flex flex-col gap-4">
                    {/* Caption for Media Posts or The Text Content itself */}
                    {!isTextOnly ? (
                      <p className="text-gray-800 font-bold text-lg leading-snug tracking-tight">
                        {cleanCaption(story.caption)}
                      </p>
                    ) : (
                      <div className="text-post-bubble w-full p-10 rounded-[48px] bg-[#FDF2F8]/50 border border-pink-50/50 flex flex-col items-start justify-start shadow-sm" style={{ textAlign: 'left', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                        <p className="text-[#1A1A1A] font-medium text-xl md:text-2xl leading-normal tracking-tight" style={{ textAlign: 'left', margin: 0, marginRight: 'auto', display: 'block', width: '100%' }}>
                          {cleanCaption(story.caption)}
                        </p>
                      </div>
                    )}

                    {/* Media Container (Only if not text-only) */}
                    {!isTextOnly && (
                      <div 
                        className="aspect-[1.3/1] rounded-[48px] overflow-hidden bg-gray-50 relative cursor-pointer group shadow-sm border border-gray-50"
                        onClick={() => {
                          const userStories = stories.filter(s => s.username === story.username);
                          onStoryClick(userStories, userStories.findIndex(s => s.id === story.id));
                        }}
                      >
                        <div className="absolute inset-0 bg-black/5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {story.media_type === 'video' ? (
                          <video src={`http://localhost:8080${story.media_url}`} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" autoPlay loop muted playsInline />
                        ) : (
                          <img src={`http://localhost:8080${story.media_url}`} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" alt="" />
                        )}
                      </div>
                    )}

                    {/* Hashtags Row */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                        {tags.map((tag, idx) => (
                          <span key={idx} className="font-bold text-[#A436EE] text-[15px] italic hover:underline cursor-pointer tracking-tight">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Interaction Footer */}
                  <div className="flex items-center justify-between px-10 pb-8 pt-2">
                    <div className="flex items-center gap-10">
                      <button className="flex items-center gap-3 text-gray-300 hover:text-[#FF3B8E] transition-all group">
                        <Heart className={`w-6 h-6 ${story.liked ? 'fill-[#FF3B8E] text-[#FF3B8E]' : 'group-hover:fill-pink-50'}`} />
                        <span className="text-sm font-bold">{story.likes_count || ''}</span>
                      </button>
                      <button className="flex items-center gap-3 text-gray-300 hover:text-gray-600 transition-all">
                        <MessageSquare className="w-6 h-6" />
                        <span className="text-sm font-bold"></span>
                      </button>
                      <button className="text-gray-300 hover:text-gray-600 transition-all">
                        <Share2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeView;
