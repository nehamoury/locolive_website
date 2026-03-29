import { useState, useEffect, type FC } from 'react';
import { Settings, Grid3x3, Bookmark, Footprints, Trash2, MapPin, Camera, Heart, Lock, Eye, Bell, Zap, LogOut, Users, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import EditProfileModal from './EditProfileModal';
import StoryViewer from '../../components/story/StoryViewer';

interface ProfileProps {
  onLogout?: () => void;
}

const Profile: FC<ProfileProps> = ({ onLogout }) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [myStories, setMyStories] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'stories' | 'archived' | 'visitors'>('stories');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);

  // Toggle states (local for now — can hook to API later)
  const [ghostMode, setGhostMode] = useState(false);
  const [allowCrossings, setAllowCrossings] = useState(true);
  const [storyViewNotifs, setStoryViewNotifs] = useState(true);
  const [crossingAlerts, setCrossingAlerts] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // latitude and longitude are no longer needed for /stories/me

        const [profileRes, storiesRes, visitorsRes] = await Promise.all([
          api.get('/profile/me'),
          api.get('/stories/me'),
          api.get('/profile/visitors'),
        ]);
        setProfile(profileRes.data);
        setMyStories(storiesRes.data || []);
        setVisitors(visitorsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Delete this story permanently?')) return;
    try {
      await api.delete(`/stories/${storyId}`);
      setMyStories(prev => prev.filter(s => s.id !== storyId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete story');
    }
  };

  const toggleGhostMode = async (val: boolean) => {
    setGhostMode(val);
    try { await api.put('/location/ghost-mode', { enabled: val, duration: 0 }); } catch { /* ignore */ }
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    else logout();
  };

  const displayProfile = profile || user;
  const avatarLetter = displayProfile?.full_name?.charAt(0)?.toUpperCase() || displayProfile?.username?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="h-full bg-[#f9e8ff] text-black overflow-y-auto no-scrollbar pb-24 md:pb-0">
      <div className="max-w-xl mx-auto px-4 py-8">

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden border-2 border-primary/30">
                    {displayProfile?.avatar_url ? (
                      <img src={`http://localhost:8080${displayProfile.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-white">{avatarLetter}</span>
                    )}
                  </div>
                </div>
                {/* Name + handle + location */}
                <div>
                  <h2 className="text-xl font-black tracking-tight text-black">{displayProfile?.full_name || 'Your Name'}</h2>
                  <p className="text-accent font-semibold text-sm">@{displayProfile?.username || 'username'}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-black/40" />
                    <span className="text-xs text-black/40">{displayProfile?.location || 'Location-based discovery'}</span>
                  </div>
                </div>
              </div>
              {/* Settings gear */}
              <button onClick={() => setIsEditOpen(true)} className="p-2.5 bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors border border-primary/10">
                <Settings className="w-5 h-5 text-black/60" />
              </button>
            </div>

            {/* Bio */}
            {displayProfile?.bio && (
              <p className="text-sm text-black/60 leading-relaxed mb-5 max-w-sm">{displayProfile.bio}</p>
            )}

            {/* Edit Profile button */}
            <button
              onClick={() => setIsEditOpen(true)}
              className="w-full py-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all mb-6 text-black"
            >
              <Camera className="w-4 h-4" />
              Edit Profile
            </button>

            {/* ─── Stats Row (matching reference) ─── */}
            <div className="grid grid-cols-4 gap-3 mb-8">
              <StatCard icon={<Zap className="w-4 h-4 text-accent" />} value={myStories.length} label="Stories" />
              <StatCard icon={<Footprints className="w-4 h-4 text-accent" />} value={profile?.crossings_count || 0} label="Crossings" />
              <StatCard icon={<Eye className="w-4 h-4 text-accent" />} value={profile?.views_count ? formatCount(profile.views_count) : '0'} label="Views" />
              <StatCard icon={<Users className="w-4 h-4 text-accent" />} value={profile?.connection_count || 0} label="Connections" />
            </div>

            {/* ─── PRIVACY Section ─── */}
            <SectionHeader icon={<Lock className="w-4 h-4" />} label="PRIVACY" />
            <div className="bg-primary/5 border border-primary/10 rounded-2xl mb-6 overflow-hidden">
              <ToggleRow
                icon={<Lock className="w-5 h-5 text-black/40" />}
                title="Ghost Mode"
                subtitle="Hide your location"
                value={ghostMode}
                onChange={toggleGhostMode}
              />
              <div className="h-px bg-primary/10" />
              <ToggleRow
                icon={<Footprints className="w-5 h-5 text-black/40" />}
                title="Allow Crossings"
                subtitle="Detect path intersections"
                value={allowCrossings}
                onChange={setAllowCrossings}
              />
            </div>

            {/* ─── NOTIFICATIONS Section ─── */}
            <SectionHeader icon={<Bell className="w-4 h-4" />} label="NOTIFICATIONS" />
            <div className="bg-primary/5 border border-primary/10 rounded-2xl mb-6 overflow-hidden">
              <ToggleRow
                icon={<Eye className="w-5 h-5 text-black/40" />}
                title="Story Views"
                subtitle=""
                value={storyViewNotifs}
                onChange={setStoryViewNotifs}
              />
              <div className="h-px bg-primary/10" />
              <ToggleRow
                icon={<Zap className="w-5 h-5 text-black/40" />}
                title="Crossing Alerts"
                subtitle=""
                value={crossingAlerts}
                onChange={setCrossingAlerts}
              />
            </div>

            {/* ─── ACCOUNT Section ─── */}
            <SectionHeader icon={<Settings className="w-4 h-4" />} label="ACCOUNT" />
            <div className="bg-primary/5 border border-primary/10 rounded-2xl mb-8 overflow-hidden">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-semibold text-red-500">Sign Out</span>
                </div>
                <ChevronRight className="w-4 h-4 text-black/20" />
              </button>
            </div>

            {/* ─── Content Tabs ─── */}
            <div className="flex border-b border-primary/10 mb-4">
              {([
                { key: 'stories', label: 'Stories', icon: <Grid3x3 className="w-4 h-4" /> },
                { key: 'archived', label: 'Archived', icon: <Bookmark className="w-4 h-4" /> },
                { key: 'visitors', label: 'Visitors', icon: <Footprints className="w-4 h-4" /> },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3 flex justify-center items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-all relative
                    ${activeTab === tab.key ? 'text-black' : 'text-black/40 hover:text-black'}`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Stories Grid */}
            {activeTab === 'stories' && (
              myStories.length > 0 ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {myStories.map((story, index) => (
                    <div
                      key={story.id}
                      className="aspect-[9/16] bg-primary/5 rounded-xl overflow-hidden relative group cursor-pointer"
                      onClick={() => setViewingStoryIndex(index)}
                    >
                      <img src={`http://localhost:8080${story.media_url}`} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs font-bold">
                            <Heart className="w-3 h-3" />
                            <span>{story.reactions_count || 0}</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteStory(story.id); }}
                            className="p-1.5 bg-red-500/30 hover:bg-red-500/60 rounded-lg transition-colors text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon="📸" title="No stories yet" text="Share your first moment from the Home feed!" />
              )
            )}

            {activeTab === 'archived' && (
              <EmptyState icon="🗂️" title="Nothing archived" text="Stories you archive will appear here." />
            )}

            {activeTab === 'visitors' && (
              visitors.length > 0 ? (
                <div className="space-y-3">
                  {visitors.map((v: any) => (
                    <div key={v.id} className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl border border-primary/10">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-sm font-bold overflow-hidden text-white">
                        {v.avatar_url
                          ? <img src={`http://localhost:8080${v.avatar_url}`} alt="" className="w-full h-full object-cover" />
                          : v.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-black">{v.full_name || v.username}</p>
                        <p className="text-xs text-black/40">@{v.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon="👣" title="No visitors yet" text="People who visit your profile show up here." />
              )
            )}
          </>
        )}
      </div>

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

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) => (
  <div className="flex flex-col items-center p-3 bg-primary/5 border border-primary/10 rounded-2xl">
    {icon}
    <span className="text-lg font-black mt-1 text-black">{value}</span>
    <span className="text-[10px] text-black/60 font-semibold uppercase tracking-wider">{label}</span>
  </div>
);

const SectionHeader = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="text-black/40">{icon}</span>
    <span className="text-[11px] font-bold text-black/60 uppercase tracking-widest">{label}</span>
  </div>
);

const ToggleRow = ({ icon, title, subtitle, value, onChange }: {
  icon: React.ReactNode; title: string; subtitle: string;
  value: boolean; onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between p-4">
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-sm font-semibold text-black">{title}</p>
        {subtitle && <p className="text-[10px] text-black/40">{subtitle}</p>}
      </div>
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-primary' : 'bg-primary/20'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${value ? 'left-6' : 'left-1'}`} />
    </button>
  </div>
);

const EmptyState = ({ icon, title, text }: { icon: string; title: string; text: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
    <span className="text-4xl">{icon}</span>
    <p className="text-sm font-bold text-black/60">{title}</p>
    <p className="text-xs text-black/40 max-w-[220px] leading-relaxed">{text}</p>
  </div>
);

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export { Profile };
