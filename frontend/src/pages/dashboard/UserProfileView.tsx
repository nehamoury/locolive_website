import { useState, useEffect, type FC } from 'react';
import { ArrowLeft, MessageSquare, MapPin, Grid3x3, Heart, Share2, MoreHorizontal, Zap, Footprints, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import StoryViewer from '../../components/story/StoryViewer';
import Highlights from '../../components/profile/Highlights';

interface UserProfileViewProps {
  userId: string;
  onBack: () => void;
  onMessage: (userId: string) => void;
}

const UserProfileView: FC<UserProfileViewProps> = ({ userId, onBack, onMessage }) => {
  const [profile, setProfile] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'stories' | 'posts' | 'history'>('stories');

  useEffect(() => {
    const fetchFullProfile = async () => {
      try {
        setLoading(true);
        const [userRes, storiesRes] = await Promise.all([
          api.get(`/users/${userId}`),
          api.get(`/stories/user/${userId}`).catch(() => ({ data: [] }))
        ]);
        setProfile(userRes.data);
        setStories(storiesRes.data || []);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullProfile();
  }, [userId]);

  const handleFollow = async () => {
    try {
      await api.post('/connections/request', { target_user_id: userId });
      setProfile((prev: any) => ({ ...prev, requested: true }));
    } catch (err) {
      console.error('Follow request failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center bg-white h-full flex flex-col items-center justify-center">
        <p className="text-black/60 font-bold uppercase tracking-widest">User not found</p>
        <button onClick={onBack} className="mt-4 text-primary font-black uppercase tracking-[2px] text-xs">Return Home</button>
      </div>
    );
  }

  const avatarLetter = (profile.full_name || profile.username || '?').charAt(0).toUpperCase();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full bg-white text-black overflow-y-auto no-scrollbar"
    >
      {/* ─── Hero Header ─── */}
      <div className="relative h-64 w-full bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] overflow-hidden">
        {profile.cover_url ? (
          <img src={`http://localhost:8080${profile.cover_url}`} className="w-full h-full object-cover" alt="Cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent" />
        )}
        
        {/* Top Navigation */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <button onClick={onBack} className="p-2.5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/60 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button className="p-2.5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/60 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2.5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/60 transition-all">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Profile Content overlap ─── */}
      <div className="relative px-6 -mt-16 pb-12">
        <div className="flex flex-col">
          {/* Avatar & Action Buttons */}
          <div className="flex items-end justify-between mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-[32px] bg-white p-1 shadow-2xl shadow-black/5">
                <div className="w-full h-full rounded-[28px] bg-gradient-to-tr from-primary to-accent p-1">
                  <div className="w-full h-full rounded-[24px] bg-white overflow-hidden flex items-center justify-center">
                    {profile.avatar_url ? (
                      <img src={`http://localhost:8080${profile.avatar_url}`} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="text-4xl font-black text-primary italic">{avatarLetter}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pb-2">
              <button 
                onClick={handleFollow}
                disabled={profile.requested}
                className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95
                  ${profile.requested 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-black text-white shadow-black/10'}`}
              >
                {profile.requested ? 'Requested' : 'Follow'}
              </button>
              <button 
                onClick={() => onMessage(userId)}
                className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/20 hover:bg-primary/20 transition-all"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Name & Bio */}
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight italic text-black uppercase mb-1">
              {profile.full_name || profile.username}
            </h1>
            <div className="flex items-center gap-2 text-accent font-black text-sm uppercase tracking-wider mb-4">
              <span>@{profile.username}</span>
              <div className="w-1.5 h-1.5 bg-accent/20 rounded-full" />
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-black/40">{profile.location || 'Locolive Community'}</span>
              </div>
            </div>
            {profile.bio && (
              <p className="text-sm text-black/60 font-medium leading-relaxed max-w-md italic border-l-4 border-gray-100 pl-4 py-1">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100 mb-8">
            <QuickStat label="Moments" value={stories.length} icon={<Zap className="w-3.5 h-3.5" />} />
            <QuickStat label="Connections" value={profile.connection_count || 0} icon={<Users className="w-3.5 h-3.5" />} />
            <QuickStat label="Crossed" value={profile.crossings_count || 0} icon={<Footprints className="w-3.5 h-3.5" />} />
          </div>

          {/* Highlights */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">Featured</span>
            </div>
            <Highlights highlights={[]} isOwnProfile={false} />
          </div>

          {/* ─── Navigation Tabs ─── */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-20 flex gap-10 border-b border-gray-100 mb-6 px-1">
            {([
              { id: 'stories', label: 'Stories', icon: <Zap className="w-4 h-4" /> },
              { id: 'posts', label: 'Posts', icon: <Grid3x3 className="w-4 h-4" /> },
              { id: 'history', label: 'Common', icon: <Footprints className="w-4 h-4" /> },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 relative flex items-center gap-2 transition-all ${
                  activeTab === tab.id ? 'text-black' : 'text-black/20 hover:text-black/40'
                }`}
              >
                {tab.icon}
                <span className="text-xs font-black uppercase tracking-[2px]">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabUser"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* ─── Tab Content ─── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="min-h-[400px]"
            >
              {activeTab === 'stories' && (
                stories.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {stories.map((story, idx) => (
                      <div
                        key={story.id}
                        onClick={() => setViewingStoryIndex(idx)}
                        className="aspect-[9/16] bg-gray-50 rounded-[24px] overflow-hidden relative cursor-pointer group border border-gray-100"
                      >
                        <img src={`http://localhost:8080${story.media_url}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                           <div className="flex items-center gap-1.5 text-white/90">
                              <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
                              <span className="text-[10px] font-black">{story.reactions_count || 0}</span>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState label="Archive empty" icon="📸" />
                )
              )}

              {activeTab === 'posts' && <EmptyState label="No posts yet" icon="🖼️" />}
              {activeTab === 'history' && <EmptyState label="No common paths" icon="👣" />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {viewingStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={viewingStoryIndex}
          onClose={() => setViewingStoryIndex(null)}
          currentUser={""}
          currentUserID={""}
        />
      )}
    </motion.div>
  );
};

// ─── Sub-components Content matches Profile.tsx for consistency ───

const QuickStat = ({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center">
    <div className="flex items-center gap-1.5 mb-0.5">
       <span className="text-black/10">{icon}</span>
       <span className="text-xl font-black text-black italic tracking-tight">{value}</span>
    </div>
    <span className="text-[9px] font-black uppercase tracking-widest text-black/30">{label}</span>
  </div>
);

const EmptyState = ({ label, icon }: { label: string; icon: string }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="text-3xl mb-4 grayscale opacity-20">{icon}</div>
    <p className="text-xs font-black uppercase tracking-widest text-black/20 italic">{label}</p>
  </div>
);

export default UserProfileView;
