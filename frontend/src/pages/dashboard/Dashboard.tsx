import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Home, Map as MapIcon, Users, User, Sparkles, MessageSquare, Plus, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Views and Components
import Sidebar from '../../components/layout/Sidebar';
import RightSidebar from '../../components/layout/RightSidebar';
import HomeView from './HomeView';
import { Profile } from './Profile';
import NotificationsView from './NotificationsView';
import ConnectionsView from './ConnectionsView';
import SettingsView from './SettingsView';
import SearchView from './SearchView';
import UserProfileView from './UserProfileView';
import CrossingsView from './CrossingsView';
import CastingPage from './CastingPage';
import MapPage from './MapPage';

// Modals
import CreateStoryModal from '../../components/story/CreateStoryModal';
import StoryViewer from '../../components/story/StoryViewer';
import ChatList from '../../components/chat/ChatList';
import ChatWindow from '../../components/chat/ChatWindow';

type TabType = 'home' | 'explore' | 'messages' | 'notifications' | 'profile' | 'connections' | 'settings' | 'search' | 'crossings' | 'casting';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [viewingStories, setViewingStories] = useState<any[]>([]);
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedUserProfileId, setSelectedUserProfileId] = useState<string | null>(null);
  const [, setPanicSequence] = useState('');
  const [showPanicConfirm, setShowPanicConfirm] = useState(false);

  // Core Data Fetching
  const fetchStories = useCallback(async () => {
    setLoadingStories(prev => {
      if (prev) return prev;
      return true;
    });
    try {
      const position: any = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      }).catch(() => null);

      const defaultCoords = { latitude: 28.6139, longitude: 77.2090 };
      const params = position
        ? { latitude: position.coords.latitude, longitude: position.coords.longitude }
        : defaultCoords;

      const response = await api.get('/feed', { params });
      setStories(response.data.stories || []);
    } catch (err: any) {
      console.error('Failed to fetch stories:', err.response?.data || err.message);
      setStories([]);
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoadingStories(false);
    }
  }, [logout]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/messages/unread-count');
      setUnreadCount(response.data.unread_count || 0);
    } catch (err) { }
  }, []);

  // Panic & Ping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const char = e.key.toUpperCase();
      if ("DELETE".includes(char)) {
        setPanicSequence((prev: string) => {
          const next = (prev + char).slice(-6);
          if (next === "DELETE") setShowPanicConfirm(true);
          return next;
        });
      } else {
        setPanicSequence('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const pingLocation = () => {
      if (!('geolocation' in navigator)) return;
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await api.post('/location/ping', {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          } catch { }
        },
        () => { },
        { timeout: 5000 }
      );
    };

    fetchStories();
    fetchUnreadCount();
    pingLocation();

    const interval = setInterval(() => {
      fetchUnreadCount();
      pingLocation();
    }, 60000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, [fetchStories, fetchUnreadCount]);

  useEffect(() => {
    if (activeTab === 'home') {
      fetchStories();
    }
  }, [activeTab, fetchStories]);

  const handlePanic = async () => {
    try {
      await api.post('/location/panic');
      logout();
      window.location.href = '/';
    } catch (err) {
      console.error("Panic failed:", err);
    }
  };

  // ─── Render View Component ────────────────────────────────────────────────────────
  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView 
            stories={stories}
            user={user}
            loading={loadingStories}
            onRefresh={fetchStories}
            onCreateStory={() => setIsCreateModalOpen(true)}
            onStoryClick={(userStories, index) => {
              setViewingStories(userStories);
              setViewingStoryIndex(index);
            }}
          />
        );
      case 'profile':
        return <Profile onLogout={logout} />;
      case 'notifications':
        return <NotificationsView />;
      case 'explore':
        return <MapPage />;
      case 'connections':
        return <ConnectionsView />;
      case 'settings':
        return <SettingsView onBack={() => setActiveTab('profile')} />;
      case 'search':
        return selectedUserProfileId ? (
          <UserProfileView 
            userId={selectedUserProfileId} 
            onBack={() => setSelectedUserProfileId(null)}
            onMessage={(userId) => {
              setSelectedChatUser(userId);
              setActiveTab('messages');
              setSelectedUserProfileId(null);
            }}
          />
        ) : (
          <SearchView onUserSelect={setSelectedUserProfileId} />
        );
      case 'crossings':
        return <CrossingsView />;
      case 'casting':
        return <CastingPage />;
      case 'messages':
        return (
          <div className="flex h-full w-full overflow-hidden bg-[#0a0a0c]">
            <div className={`h-full w-full md:w-80 border-r border-white/10 ${selectedChatUser ? 'hidden md:block' : 'block'}`}>
              <ChatList onSelect={setSelectedChatUser} selectedId={selectedChatUser || undefined} />
            </div>
            {selectedChatUser ? (
              <div className="flex-1 h-full w-full flex flex-col relative">
                <button 
                  onClick={() => setSelectedChatUser(null)}
                  className="md:hidden absolute top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <ChatWindow receiverId={selectedChatUser} />
              </div>
            ) : (
              <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-[#6228D7]">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Your Conversations</h3>
                <p className="max-w-sm text-sm">Select a chat from the list on the left to start messaging. Your privacy is our priority.</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-full bg-[#0B0F19] text-white font-sans flex overflow-hidden">
      
      {/* 1. Left Sidebar (Fixed) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        logout={logout} 
        unreadCount={unreadCount} 
        onCreatePost={() => setIsCreateModalOpen(true)}
      />

      {/* 2. Main Content Center (Scrollable) */}
      <main className="flex-1 relative overflow-hidden flex flex-col border-r border-white/5 shadow-2xl z-10">
        
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/5">
          <div className="text-xl font-black italic tracking-tighter bg-gradient-to-r from-[#EE2A7B] to-[#6228D7] bg-clip-text text-transparent">
            Locolive
          </div>
          <div className="flex space-x-4 text-white">
            <button><Bell className="w-6 h-6" /></button>
            <button className="relative" onClick={() => setActiveTab('messages')}>
              <MessageSquare className="w-6 h-6" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#EE2A7B] rounded-full border border-black" />}
            </button>
          </div>
        </div>

        {/* Dynamic Route View */}
        <div className="flex-1 overflow-hidden relative">
          {renderView()}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 w-full flex items-center justify-around bg-[#0B0E14]/90 backdrop-blur-2xl border-t border-white/5 px-4 h-16 z-[60]">
          <MobileNavItem icon={<Home className="w-6 h-6" />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <MobileNavItem icon={<MapIcon className="w-6 h-6" />} active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} />
          <MobileNavItem icon={<Sparkles className="w-6 h-6" />} active={activeTab === 'casting'} onClick={() => setActiveTab('casting')} />
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-12 h-12 bg-gradient-to-tr from-[#EE2A7B] to-[#6228D7] rounded-full flex items-center justify-center transform -translate-y-4 shadow-lg shadow-pink-500/20 active:scale-95 transition-all text-white border-[3px] border-[#0B0E14]"
          >
            <Plus className="w-6 h-6" />
          </button>
          
          <MobileNavItem icon={<Users className="w-6 h-6" />} active={activeTab === 'connections'} onClick={() => setActiveTab('connections')} />
          <MobileNavItem icon={<User className="w-6 h-6" />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>
      </main>

      {/* 3. Right Sidebar (Widgets - Desktop only) */}
      <RightSidebar />

      {/* Overlays / Modals */}
      <CreateStoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchStories}
      />

      {viewingStoryIndex !== null && (
        <StoryViewer
          stories={viewingStories}
          initialIndex={viewingStoryIndex}
          onClose={() => {
            setViewingStoryIndex(null);
            setViewingStories([]);
          }}
          currentUser={user?.username}
          currentUserID={user?.id}
          onDelete={(storyId) => {
            setStories(prev => prev.filter(s => s.id !== storyId));
            setViewingStories(prev => prev.filter(s => s.id !== storyId));
          }}
        />
      )}

      {showPanicConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6">
          <div className="bg-[#1a1a1e] border-2 border-red-500/50 p-8 rounded-[32px] max-w-sm w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Erase all data?</h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              This will permanently delete all your messages, stories, and connections.
            </p>
            <div className="space-y-3">
              <button 
                onClick={handlePanic}
                className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all active:scale-95"
              >
                Yes, Erase
              </button>
              <button 
                onClick={() => setShowPanicConfirm(false)}
                className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mobile Nav Item helper
const MobileNavItem = ({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className={`p-2 transition-colors ${active ? 'text-[#EE2A7B]' : 'text-slate-500 hover:text-slate-300'}`}
  >
    {icon}
  </button>
);

export default Dashboard;
