import { useState, useEffect, type FC } from 'react';
import { Settings, Grid3x3, Footprints, MapPin, Heart, Lock, Eye, Bell, Zap, LogOut, Users, Share2, MoreHorizontal, Volume2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import EditProfileModal from './EditProfileModal';
import StoryViewer from '../../components/story/StoryViewer';
import Highlights from '../../components/profile/Highlights';
import { useNotifications } from '../../hooks/useNotifications';

interface ProfileProps {
  onLogout?: () => void;
}

const Profile: FC<ProfileProps> = ({ onLogout }) => {
  const { user, logout } = useAuth();
  const { audioEnabled, toggleAudio } = useNotifications();
  const [profile, setProfile] = useState<any>(null);
  const [myStories, setMyStories] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'stories' | 'posts' | 'history' | 'network'>('stories');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  const [isPanicModalOpen, setIsPanicModalOpen] = useState(false);
  const [isPanicking, setIsPanicking] = useState(false);

  // Mock Highlights for now (can be fetched from API later)
  const mockHighlights = [
    { id: '1', title: 'Summer 24', cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200' },
    { id: '2', title: 'Roadtrip', cover_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200' },
    { id: '3', title: 'Late Night', cover_url: 'https://images.unsplash.com/photo-1514525253344-f81aba6e258e?w=200' },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, storiesRes, visitorsRes, connRes] = await Promise.all([
          api.get('/profile/me'),
          api.get('/stories/me'),
          api.get('/profile/visitors'),
          api.get('/connections').catch(() => ({ data: [] })),
        ]);
        setProfile(profileRes.data);
        setMyStories(storiesRes.data || []);
        setVisitors(visitorsRes.data || []);
        setConnections(connRes.data || []);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleLogout = () => {
    if (onLogout) onLogout();
    else logout();
  };

  const handleToggleGhostMode = async () => {
    const nextValue = !displayProfile?.is_ghost_mode;
    // Optimistic Update
    setProfile((prev: any) => ({ ...prev, is_ghost_mode: nextValue }));
    
    try {
      await api.post('/location/ghost-mode', { enabled: nextValue, duration: 0 });
      toast.success(nextValue ? 'Ghost Mode activated' : 'Ghost Mode deactivated');
    } catch (err) {
      toast.error('Failed to update Ghost Mode');
      setProfile((prev: any) => ({ ...prev, is_ghost_mode: !nextValue }));
    }
  };

  const handleToggleVisibility = async () => {
    const nextValue = displayProfile?.profile_visibility === 'everyone' ? 'connections' : 'everyone';
    // Optimistic Update
    setProfile((prev: any) => ({ ...prev, profile_visibility: nextValue }));

    try {
      await api.put('/profile', { profile_visibility: nextValue });
      toast.success(`Visibility set to ${nextValue}`);
    } catch (err) {
      toast.error('Failed to update visibility');
      setProfile((prev: any) => ({ ...prev, profile_visibility: nextValue === 'everyone' ? 'connections' : 'everyone' }));
    }
  };

  const handlePanic = async () => {
     setIsPanicking(true);
     try {
        await api.post('/location/panic');
        toast.success('Privacy scrub complete. Logging out…', { duration: 3000 });
        setTimeout(() => {
           localStorage.clear();
           window.location.href = '/login';
        }, 1500);
     } catch (err) {
        console.error('Panic failed:', err);
        toast.error('Scrub failed. Please logout manually.');
        setIsPanicking(false);
     }
  };

  const displayProfile = profile || user;
  const avatarLetter = (displayProfile?.full_name || displayProfile?.username || 'U').charAt(0).toUpperCase();

  return (
    <div className="h-full bg-white text-black overflow-y-auto no-scrollbar pb-24 md:pb-0">
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="relative">
          {/* ─── Hero Header ─── */}
          <div className="relative h-64 w-full bg-gradient-to-br from-[#f9e8ff] to-[#f5d9ff] overflow-hidden">
            {displayProfile?.cover_url ? (
              <img src={`http://localhost:8080${displayProfile.cover_url}`} className="w-full h-full object-cover" alt="Cover" />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-pink-100/50 via-transparent to-transparent" />
            )}
            
            {/* Top Controls Overlay */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
              <button aria-label="Share profile" className="p-2.5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/60 transition-all">
                <Share2 className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                <button aria-label="Edit profile" onClick={() => setIsEditOpen(true)} className="p-2.5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/60 transition-all">
                  <Settings className="w-5 h-5" />
                </button>
                <button aria-label="More options" className="p-2.5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/60 transition-all">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* ─── Profile Content overlap ─── */}
          <div className="relative px-6 -mt-16 pb-12">
            <div className="flex flex-col">
              {/* Avatar & Main Actions Area */}
              <div className="flex items-end justify-between mb-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-[32px] bg-white p-1 shadow-2xl shadow-black/5 rotate-[-2deg]">
                    <div className="w-full h-full rounded-[28px] bg-gradient-to-tr from-primary to-accent p-1">
                      <div className="w-full h-full rounded-[24px] bg-white overflow-hidden flex items-center justify-center">
                        {displayProfile?.avatar_url ? (
                          <img src={`http://localhost:8080${displayProfile.avatar_url}`} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-4xl font-black text-primary italic">{avatarLetter}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pb-2 pt-20">
                  <button onClick={() => setIsEditOpen(true)} className="px-6 py-2.5 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all">
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Name & Bio */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-black tracking-tight italic text-black uppercase">
                    {displayProfile?.full_name || 'Your Name'}
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-accent font-black text-sm uppercase tracking-wider mb-3">
                  <span>@{displayProfile?.username || 'username'}</span>
                  <div className="w-1.5 h-1.5 bg-accent/20 rounded-full" />
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-black/40">{displayProfile?.location || 'Raipur, India'}</span>
                  </div>
                </div>
                {displayProfile?.bio && (
                  <p className="text-sm text-black/60 font-bold leading-relaxed max-w-md italic border-l-4 border-primary/20 pl-4 py-1">
                    {displayProfile.bio}
                  </p>
                )}
              </div>

              {/* Stats Bento Grid - Premium styling */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                <BentoStat label="Moments" value={myStories.length} icon={<Zap className="w-4 h-4" />} color="bg-pink-50" textColor="text-pink-600" />
                <BentoStat label="Stamps" value={profile?.crossings_count || 0} icon={<Footprints className="w-4 h-4" />} color="bg-blue-50" textColor="text-blue-600" />
                <BentoStat label="Network" value={connections.length} icon={<Users className="w-4 h-4" />} color="bg-purple-50" textColor="text-purple-600" />
                <BentoStat label="Views" value={formatCount(profile?.views_count || 0)} icon={<Eye className="w-4 h-4" />} color="bg-orange-50" textColor="text-orange-600" />
              </div>

              {/* Story Highlights */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">Highlights</span>
                </div>
                <Highlights
                  highlights={mockHighlights}
                  isOwnProfile
                  onAdd={() => alert('New highlight function coming soon!')}
                />
              </div>

              {/* ─── Navigation Tabs ─── */}
              <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-20 flex gap-8 border-b border-gray-100 mb-6 px-1">
                {([
                  { id: 'stories', label: 'Stories', icon: <Zap className="w-4 h-4" /> },
                  { id: 'posts', label: 'Posts', icon: <Grid3x3 className="w-4 h-4" /> },
                  { id: 'history', label: 'Stamps', icon: <Footprints className="w-4 h-4" /> },
                  { id: 'network', label: 'Network', icon: <Users className="w-4 h-4" /> },
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 relative flex items-center gap-2 transition-all ${
                      activeTab === tab.id ? 'text-black' : 'text-black/30 hover:text-black/50'
                    }`}
                  >
                    {tab.icon}
                    <span className="text-xs font-black uppercase tracking-[2px]">{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabProfile"
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
                    myStories.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {myStories.map((story, idx) => (
                          <div
                            key={story.id}
                            onClick={() => setViewingStoryIndex(idx)}
                            className="aspect-[9/16] bg-gray-50 rounded-[24px] overflow-hidden relative cursor-pointer group shadow-sm border border-gray-100"
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
                      <EmptyState label="No active stories" icon="⚡" />
                    )
                  )}

                  {activeTab === 'posts' && <EmptyState label="Archive empty" icon="📸" />}
                  
                  {activeTab === 'history' && (
                    <div className="space-y-4">
                      {visitors.length > 0 ? (
                        visitors.slice(0, 10).map((v: any) => (
                           <VisitorCard key={v.id} visitor={v} />
                        ))
                      ) : (
                        <EmptyState label="No history found" icon="👣" />
                      )}
                    </div>
                  )}

                  {activeTab === 'network' && (
                    <div className="space-y-3">
                      {connections.length > 0 ? (
                        connections.map((c: any) => (
                          <div key={c.id || c.username} className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-gray-100 transition-all">
                             <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-sm">
                                   <div className="w-full h-full rounded-[14px] bg-primary/10 flex items-center justify-center overflow-hidden">
                                      {c.avatar_url ? (
                                        <img src={`http://localhost:8080${c.avatar_url}`} className="w-full h-full object-cover" alt="" />
                                      ) : (
                                        <span className="font-black text-primary italic">{(c.full_name || c.username).charAt(0).toUpperCase()}</span>
                                      )}
                                   </div>
                                </div>
                                <div>
                                   <p className="text-sm font-black text-black">{c.full_name || c.username}</p>
                                   <p className="text-[10px] font-bold text-black/30">@{c.username}</p>
                                </div>
                             </div>
                             <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-black transition-colors">
                                View
                             </button>
                          </div>
                        ))
                      ) : (
                        <EmptyState label="Network is quiet" icon="🤝" />
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* ─── Unified System Control (Redesigned) ─── */}
      <div className="px-6 pb-32 mt-12 relative overflow-hidden">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-[-10%] w-[400px] h-[400px] bg-pink-100/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-[-10%] w-[400px] h-[400px] bg-blue-100/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 bg-white/60 backdrop-blur-3xl border border-white/80 rounded-[48px] p-8 shadow-2xl shadow-pink-500/5">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-black/10">
                  <Settings className="w-5 h-5 text-white" />
               </div>
               <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-black">System Terminal</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Privacy & Session Management</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
              <SystemToggle 
                icon={<Lock className="w-5 h-5 text-black" />} 
                label="Ghost Mode" 
                subtitle="Full invisibility" 
                active={displayProfile?.is_ghost_mode}
                onClick={handleToggleGhostMode}
              />
              <SystemToggle 
                icon={<Bell className="w-5 h-5 text-black" />} 
                label="Pings" 
                subtitle="Crossing alerts" 
                active={true}
              />
              <SystemToggle 
                icon={<Zap className="w-5 h-5 text-black" />} 
                label="Peek" 
                subtitle="Profile transparency" 
                active={displayProfile?.profile_visibility === 'everyone'} 
                onClick={handleToggleVisibility}
              />
              <SystemToggle 
                icon={<Volume2 className="w-5 h-5 text-black" />} 
                label="Audio Alerts" 
                subtitle="Alert sounds" 
                active={audioEnabled}
                onClick={toggleAudio}
              />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => setIsPanicModalOpen(true)}
              className="group relative h-[84px] bg-red-50 hover:bg-red-100/80 rounded-[32px] border border-red-200/50 transition-all flex items-center px-8 overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)] mr-4">
                 <Zap className="w-6 h-6 text-white fill-white animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-sm font-black uppercase tracking-widest text-red-600">Secure Scrub</p>
                <p className="text-[10px] font-bold text-red-600/40 italic">Emergency data wipe</p>
              </div>
              <ArrowRight className="ml-auto w-5 h-5 text-red-200 group-hover:text-red-400 transform group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={handleLogout}
              className="group h-[84px] bg-gray-50 hover:bg-gray-100/80 rounded-[32px] border border-gray-100 transition-all flex items-center px-8"
            >
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm mr-4 group-hover:bg-black transition-colors">
                 <LogOut className="w-5 h-5 text-black/40 group-hover:text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-black uppercase tracking-widest text-black">Terminate</p>
                <p className="text-[10px] font-bold text-black/30">Safely end session</p>
              </div>
              <ArrowRight className="ml-auto w-5 h-5 text-gray-200 group-hover:text-black transform group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>

      {/* Panic Confirmation Modal */}
      <AnimatePresence>
        {isPanicModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isPanicking && setIsPanicModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#111] border border-red-500/30 rounded-[40px] p-8 text-center shadow-2xl shadow-red-500/10"
            >
               <div className="w-20 h-20 bg-red-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.4)]">
                  <Zap className="w-10 h-10 text-white fill-white" />
               </div>
               <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Initialize Panic?</h3>
               <p className="text-sm font-bold text-white/40 mb-8 leading-relaxed">
                  This will scrubbing all active stories, crossings, and live data from our servers. This action is <span className="text-red-500">irreversible</span>.
               </p>

               <div className="space-y-3">
                  <button 
                    disabled={isPanicking}
                    onClick={handlePanic}
                    className="w-full py-5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-600/20"
                  >
                    {isPanicking ? 'Scrubbing…' : 'Confirm Destruction'}
                  </button>
                  <button 
                    disabled={isPanicking}
                    onClick={() => setIsPanicModalOpen(false)}
                    className="w-full py-5 bg-white/5 hover:bg-white/10 text-white/60 rounded-3xl font-black uppercase tracking-widest text-xs transition-all"
                  >
                    Cancel
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />

      {viewingStoryIndex !== null && (
        <StoryViewer
          stories={myStories}
          initialIndex={viewingStoryIndex}
          onClose={() => setViewingStoryIndex(null)}
          currentUser={user?.username}
          currentUserID={user?.id}
          onDelete={(storyId) => setMyStories(prev => prev.filter(s => s.id !== storyId))}
        />
      )}
    </div>
  );
};

// ─── Sub-components ───

const BentoStat = ({ label, value, icon, color, textColor }: { label: string; value: number | string; icon: React.ReactNode, color: string, textColor: string }) => (
  <div className={`p-4 ${color} rounded-[28px] border border-transparent hover:border-white/50 transition-all relative overflow-hidden group`}>
    <div className="flex items-center justify-between mb-2">
       <div className={`${textColor} opacity-40 group-hover:opacity-100 transition-opacity`}>{icon}</div>
    </div>
    <div className="flex flex-col">
       <span className="text-2xl font-black text-black italic tracking-tighter leading-none mb-1">{value}</span>
       <span className="text-[9px] font-black uppercase tracking-widest text-black/30 whitespace-nowrap">{label}</span>
    </div>
  </div>
);

const VisitorCard = ({ visitor }: { visitor: any }) => (
  <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:shadow-black/[0.02] transition-all group">
     <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group-hover:border-primary/30 transition-colors">
          {visitor.avatar_url ? (
            <img src={`http://localhost:8080${visitor.avatar_url}`} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-black text-black/20 italic">
               {(visitor.full_name || visitor.username).charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
           <p className="text-[12px] font-black text-black leading-none mb-1 group-hover:text-primary transition-colors">{visitor.full_name || visitor.username}</p>
           <p className="text-[9px] font-bold text-black/30 leading-none">@{visitor.username}</p>
        </div>
     </div>
     <div className="text-[9px] font-black uppercase tracking-widest text-black/20">Just now</div>
  </div>
);

const SystemToggle = ({ icon, label, subtitle, active = false, onClick }: { icon: any; label: string; subtitle: string; active?: boolean; onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between p-5 bg-gray-50/50 border border-gray-100 rounded-[28px] hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all cursor-pointer group"
  >
     <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-black text-white shadow-lg shadow-black/20' : 'bg-white text-black/20 shadow-sm group-hover:text-black/40'}`}>
           {icon}
        </div>
        <div>
           <p className="text-sm font-black uppercase tracking-widest text-black/80">{label}</p>
           <p className="text-[10px] font-bold text-black/30 tracking-tight">{subtitle}</p>
        </div>
     </div>
     <div className={`w-10 h-6 rounded-full relative transition-all p-1 ${active ? 'bg-black' : 'bg-gray-200'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${active ? 'translate-x-4' : 'translate-x-0'}`} />
     </div>
  </div>
);

const EmptyState = ({ label, icon }: { label: string; icon: string }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="text-3xl mb-4 grayscale opacity-20">{icon}</div>
    <p className="text-xs font-black uppercase tracking-widest text-black/20 italic">{label}</p>
  </div>
);

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export { Profile };
