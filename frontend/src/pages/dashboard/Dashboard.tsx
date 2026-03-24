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
          <div className="flex flex-col h-full w-full overflow-hidden bg-white">
            {/* Messages Top Header */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 bg-white shrink-0">
              <h2 className="text-xl font-black text-gray-900 italic tracking-tight">Messages</h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all">
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                  {unreadCount > 0 ? `${unreadCount} pending requests` : '0 pending requests'}
                </button>
                <button
                  onClick={() => setSelectedChatUser(null)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-md shadow-pink-200 hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Chat
                </button>
              </div>
            </div>

            {/* Chat Split View */}
            <div className="flex flex-1 overflow-hidden">
              <div className={`h-full border-r border-gray-100 ${selectedChatUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 shrink-0`}>
                <ChatList onSelect={setSelectedChatUser} selectedId={selectedChatUser || undefined} />
              </div>
              {selectedChatUser ? (
                <div className="flex-1 h-full w-full">
                  <ChatWindow
                    receiverId={selectedChatUser}
                    onBack={() => setSelectedChatUser(null)}
                  />
                </div>
              ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-gray-50">
                  <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-5">
                    <MessageSquare className="w-9 h-9 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-black text-gray-800 italic tracking-tight mb-2">Your Messages</h3>
                  <p className="max-w-xs text-sm text-gray-400 leading-relaxed">
                    Select a conversation to start chatting with people near you
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-full bg-white text-gray-800 font-sans flex overflow-hidden">
      
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
      <main className="flex-1 relative overflow-hidden flex flex-col border-r border-gray-100 z-10">
        
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
          <div className="text-xl font-black italic tracking-tighter bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Locolive
          </div>
          <div className="flex space-x-4 text-gray-600">
            <button><Bell className="w-6 h-6" /></button>
            <button className="relative" onClick={() => setActiveTab('messages')}>
              <MessageSquare className="w-6 h-6" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border border-[#f9e8ff]" />}
            </button>
          </div>
        </div>

        {/* Dynamic Route View */}
        <div className="flex-1 overflow-hidden relative">
          {renderView()}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 w-full flex items-center justify-around bg-white/95 backdrop-blur-2xl border-t border-gray-100 px-4 h-16 z-[60] shadow-lg">
          <MobileNavItem icon={<Home className="w-6 h-6" />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <MobileNavItem icon={<MapIcon className="w-6 h-6" />} active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} />
          <MobileNavItem icon={<Sparkles className="w-6 h-6" />} active={activeTab === 'casting'} onClick={() => setActiveTab('casting')} />
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-full flex items-center justify-center transform -translate-y-4 shadow-lg active:scale-95 transition-all text-white border-[3px] border-white"
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary/20 backdrop-blur-xl p-6">
          <div className="glass border-2 border-red-500/50 p-8 rounded-[32px] max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-black mb-2 tracking-tight">Erase all data?</h2>
            <p className="text-black/60 text-sm mb-8 leading-relaxed">
              This will permanently delete all your messages, stories, and connections.
            </p>
            <div className="space-y-3">
              <button 
                onClick={handlePanic}
                className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-red-500/20"
              >
                Yes, Erase
              </button>
              <button 
                onClick={() => setShowPanicConfirm(false)}
                className="w-full py-3.5 bg-primary/5 hover:bg-primary/10 text-black rounded-2xl font-bold transition-all active:scale-95"
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
    className={`p-2 transition-colors ${active ? 'text-accent' : 'text-black/60 hover:text-black'}`}
  >
    {icon}
  </button>
);

export default Dashboard;
