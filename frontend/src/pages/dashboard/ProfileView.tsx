import React, { useState, useEffect } from 'react';
import { Settings, Grid3x3, Heart, Bookmark, Footprints } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import EditProfileModal from './EditProfileModal';

interface ProfileViewProps {
  onLogout?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [myStories, setMyStories] = useState<any[]>([]);
  const [archivedStories, setArchivedStories] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'stories' | 'archived' | 'visitors'>('stories');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, storiesRes, archivedRes, visitorsRes] = await Promise.all([
          api.get('/profile/me'),
          api.get('/feed', { params: { latitude: 28.6139, longitude: 77.2090 } }),
          api.get('/stories/archived'),
          api.get('/profile/visitors'),
        ]);
        setProfile(profileRes.data);
        // Filter stories to only show current user's stories
        const allStories = storiesRes.data?.stories || storiesRes.data || [];
        setMyStories(allStories.filter((s: any) => s.user_id === user?.id || s.username === user?.username));
        setArchivedStories(archivedRes.data || []);
        setVisitors(visitorsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const displayProfile = profile || user;

  return (
    <div className="h-full bg-black text-white overflow-y-auto no-scrollbar pb-24 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold tracking-tight">@{displayProfile?.username || 'username'}</h1>
          <button 
            onClick={() => setIsEditOpen(true)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Profile Info */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 border-2 border-black flex items-center justify-center shadow-xl shadow-purple-500/20 mb-4 overflow-hidden">
                {displayProfile?.avatar_url ? (
                  <img src={`http://localhost:8080${displayProfile.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold">{displayProfile?.full_name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <h2 className="text-lg font-bold mb-1 tracking-tight">{displayProfile?.full_name || 'User'}</h2>
              <p className="text-gray-400 font-medium text-sm mb-2">@{displayProfile?.username || 'username'}</p>
              {displayProfile?.bio && (
                <p className="text-xs text-gray-500 max-w-xs mb-3">{displayProfile.bio}</p>
              )}
              
              <div className="flex space-x-8 mt-2">
                <div className="flex flex-col items-center">
                  <span className="text-base font-bold">{myStories.length}</span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mt-0.5">Stories</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-base font-bold">{profile?.connections_count || 0}</span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mt-0.5">Following</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-base font-bold">{visitors.length}</span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mt-0.5">Visitors</span>
                </div>
              </div>

              <button 
                onClick={() => setIsEditOpen(true)}
                className="mt-4 px-6 py-2 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20 transition-colors"
              >
                Edit Profile
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-4">
              <button 
                onClick={() => setActiveTab('stories')}
                className={`flex-1 py-3 flex justify-center items-center text-sm font-semibold transition-all relative ${activeTab === 'stories' ? 'text-white' : 'text-gray-500'}`}
              >
                <Grid3x3 className="w-4 h-4 mr-1.5" />
                Stories
                {activeTab === 'stories' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('archived')}
                className={`flex-1 py-3 flex justify-center items-center text-sm font-semibold transition-all relative ${activeTab === 'archived' ? 'text-white' : 'text-gray-500'}`}
              >
                <Bookmark className="w-4 h-4 mr-1.5" />
                Archived
                {activeTab === 'archived' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('visitors')}
                className={`flex-1 py-3 flex justify-center items-center text-sm font-semibold transition-all relative ${activeTab === 'visitors' ? 'text-white' : 'text-gray-500'}`}
              >
                <Footprints className="w-4 h-4 mr-1.5" />
                Visitors
                {activeTab === 'visitors' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />}
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'stories' && (
              myStories.length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                  {myStories.map(story => (
                    <div key={story.id} className="aspect-[9/16] bg-white/5 rounded-lg overflow-hidden relative group cursor-pointer">
                      <img src={`http://localhost:8080${story.media_url}`} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex items-center space-x-1 text-xs font-bold">
                          <Heart className="w-3.5 h-3.5" />
                          <span>{story.reactions_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="No stories yet. Share your first moment!" />
              )
            )}

            {activeTab === 'archived' && (
              archivedStories.length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                  {archivedStories.map(story => (
                    <div key={story.id} className="aspect-[9/16] bg-white/5 rounded-lg overflow-hidden relative group cursor-pointer">
                      <img src={`http://localhost:8080${story.media_url}`} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1">
                        <Bookmark className="w-3 h-3 text-white drop-shadow" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="No archived stories. Archive stories to keep them forever!" />
              )
            )}

            {activeTab === 'visitors' && (
              visitors.length > 0 ? (
                <div className="space-y-2">
                  {visitors.map((visitor: any, idx: number) => (
                    <div key={idx} className="flex items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-sm mr-3">
                        {visitor.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">@{visitor.username}</p>
                        <p className="text-[10px] text-gray-500">{visitor.visited_at ? new Date(visitor.visited_at).toLocaleDateString() : 'Recently'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="No profile visitors yet. Share your stories to attract visitors!" />
              )
            )}
          </>
        )}
      </div>

      <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </div>
  );
};

const EmptyState = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
    <p className="text-sm font-medium max-w-[220px]">{text}</p>
  </div>
);

export default ProfileView;
