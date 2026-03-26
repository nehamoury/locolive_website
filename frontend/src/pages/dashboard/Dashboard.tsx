import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Home, Map as MapIcon, User, Sparkles, MessageSquare, Plus, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Toaster } from 'react-hot-toast';
import { useNotifications } from '../../hooks/useNotifications';

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
import AdminView from './AdminView';
import { useGeolocation } from '../../hooks/useGeolocation';

// Modals
import CreateStoryModal from '../../components/story/CreateStoryModal';
import StoryViewer from '../../components/story/StoryViewer';
import ChatList from '../../components/chat/ChatList';
import ChatWindow from '../../components/chat/ChatWindow';

type TabType = 'home' | 'explore' | 'messages' | 'notifications' | 'profile' | 'connections' | 'settings' | 'search' | 'crossings' | 'casting' | 'admin';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [viewingStories, setViewingStories] = useState<any[]>([]);
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);

  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [selectedUserProfileId, setSelectedUserProfileId] = useState<string | null>(null);
  const [activeConnectionTab, setActiveConnectionTab] = useState<'suggestions' | 'requests' | 'my-connections'>('suggestions');
  const [, setPanicSequence] = useState('');
  const [showPanicConfirm, setShowPanicConfirm] = useState(false);

  // Real-time Notifications Hook
  const { unreadCount: totalUnreadCount } = useNotifications();

  // Crossings mapping
  useGeolocation(true);
  const [crossingsCount, setCrossingsCount] = useState<number>(0);

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

  // Removed manual message unread count (now handled by useNotifications)


  const fetchCrossings = useCallback(async () => {
    try {
      const response = await api.get('/crossings');
      const data = response.data || [];
      const today = new Date().toISOString().split('T')[0];
      const todayCrossings = data.filter((c: any) => c.last_crossing_at?.startsWith(today));
      setCrossingsCount(todayCrossings.length);
    } catch (err) { }
  }, []);

  // Panic & Data Polling
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

    fetchStories();
    fetchCrossings();

    const interval = setInterval(() => {
      fetchCrossings();
    }, 30000); // Crossings sync every 30s

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, [fetchStories, fetchCrossings]);

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

  const handleUserSelect = (userId: string) => {
    setSelectedUserProfileId(userId);
    setActiveTab('search');
  };

  const handleStartMessage = (userId: string) => {
    setSelectedChatUser(userId);
    setSelectedUserProfileId(null);
    setActiveTab('messages');
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
            onCreateStory={() => setIsCreateModalOpen(true)}
            onStoryClick={(userStories, index) => {
              setViewingStories(userStories);
              setViewingStoryIndex(index);
            }}
          />
        );
      case 'admin':
        return <AdminView />;
      case 'profile':
        return <Profile onLogout={logout} />;
      case 'notifications':
        return <NotificationsView />;
      case 'explore':
        return <MapPage onUserSelect={handleUserSelect} />;
      case 'connections':
        return (
          <ConnectionsView 
            initialTab={activeConnectionTab} 
            onUserSelect={handleUserSelect}
            onMessage={handleStartMessage}
          />
        );
      case 'settings':
        return <SettingsView onBack={() => setActiveTab('profile')} />;
      case 'search':
        return selectedUserProfileId ? (
          <UserProfileView 
            userId={selectedUserProfileId} 
            onBack={() => setSelectedUserProfileId(null)}
            onMessage={handleStartMessage}
          />
        ) : (
          <SearchView onUserSelect={handleUserSelect} />
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
                <button 
                  onClick={() => {
                    setActiveConnectionTab('requests');
                    setActiveTab('connections');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${totalUnreadCount > 0 ? 'bg-pink-500 animate-pulse' : 'bg-gray-300'}`} />
                  {totalUnreadCount > 0 ? `${totalUnreadCount} pending requests` : '0 pending requests'}
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
    <div className="h-screen w-full bg-white text-gray-800 font-poppins flex overflow-hidden">
      
      {/* 1. Left Sidebar (Fixed) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        logout={logout} 
        unreadCount={totalUnreadCount} 
        onCreatePost={() => setIsCreateModalOpen(true)}
      />

      <Toaster position="top-right" reverseOrder={false} />

      {/* 2. Main Content Center (Scrollable) */}
      <main className="flex-1 relative overflow-hidden flex flex-col border-r border-gray-50 z-10">
        
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-white/95 backdrop-blur-xl border-b border-gray-50">
          <div className="text-2xl font-black tracking-tighter">
            <span className="bg-gradient-to-r from-[#FF3B8E] to-[#A436EE] bg-clip-text text-transparent">Locolive</span>
          </div>
          <div className="flex space-x-4 text-gray-400">
            <button className="hover:text-[#FF3B8E] transition-colors"><Bell className="w-6 h-6" /></button>
            <button className="relative hover:text-[#FF3B8E] transition-colors" onClick={() => setActiveTab('messages')}>
              <MessageSquare className="w-6 h-6" />
              {totalUnreadCount > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF3B8E] rounded-full border-2 border-white shadow-sm" />}
            </button>
          </div>
        </div>

        {/* Dynamic Route View */}
        <div className="flex-1 overflow-hidden relative">
          {renderView()}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 w-full flex items-center justify-around bg-white/95 backdrop-blur-2xl border-t border-gray-50 px-4 h-18 z-[60] shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <MobileNavItem icon={<Home className="w-6 h-6" />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <MobileNavItem icon={<MapIcon className="w-6 h-6" />} active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} />
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-13 h-13 bg-gradient-to-tr from-[#FF3B8E] to-[#A436EE] rounded-full flex items-center justify-center transform -translate-y-5 shadow-lg shadow-pink-200 active:scale-90 transition-all text-white border-4 border-white"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>
          
          <MobileNavItem icon={<Sparkles className="w-6 h-6" />} active={activeTab === 'casting'} onClick={() => setActiveTab('casting')} />
          <MobileNavItem icon={<User className="w-6 h-6" />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>
      </main>

      {/* Rightsider with data */}
      <RightSidebar crossingsToday={crossingsCount} />

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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/10 backdrop-blur-xl p-6">
          <div className="bg-white border border-gray-100 p-8 rounded-[40px] max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <ShieldAlert className="w-11 h-11" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">System Purge?</h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed font-medium">
              This will permanently wipe all your data from this device and the server. This action cannot be undone.
            </p>
            <div className="space-y-3">
              <button 
                onClick={handlePanic}
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-red-100"
              >
                Execute Purge
              </button>
              <button 
                onClick={() => setShowPanicConfirm(false)}
                className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl font-bold transition-all active:scale-95"
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
    className={`p-2 transition-all duration-300 ${active ? 'text-[#FF3B8E] scale-110' : 'text-gray-300 hover:text-gray-500'}`}
  >
    {icon}
  </button>
);

export default Dashboard;
