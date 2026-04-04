import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Home, Map as MapIcon, User, MessageSquare, Plus, Bell, Sun, Moon, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
import DiscoveryPage from './DiscoveryPage';
import { useGeolocation } from '../../hooks/useGeolocation';

// Modals
import CreatePostModal from '../../components/post/CreatePostModal';
import StoryViewer from '../../components/story/StoryViewer';
import ChatList from '../../components/chat/ChatList';
import ChatWindow from '../../components/chat/ChatWindow';
import ChatProfileSidebar from '../../components/chat/ChatProfileSidebar';

type TabType = 'home' | 'explore' | 'messages' | 'notifications' | 'profile' | 'connections' | 'settings' | 'search' | 'crossings' | 'casting' | 'discovery';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  // Real-time Notifications Hook
  const { unreadCount: totalUnreadCount, unreadMessagesCount } = useNotifications();

  // Crossings mapping
  useGeolocation(true);
  const [crossingsCount, setCrossingsCount] = useState<number>(0);
  const [nearbyCount, setNearbyCount] = useState<number>(0);
  const [storiesCount, setStoriesCount] = useState<number>(0);
  const [isSyncingStats, setIsSyncingStats] = useState(false);

  // Router-aware visibility
  const showSidebarRoutes = ['home', 'discovery']; // Tab IDs where sidebar is visible
  const isSidebarVisible = showSidebarRoutes.includes(activeTab);

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

      const [feedResponse, connResponse, meResponse] = await Promise.all([
        api.get('/feed', { params }).catch(() => ({ data: { stories: [] } })),
        api.get('/stories/connections').catch(() => ({ data: [] })),
        api.get('/stories/me').catch(() => ({ data: [] }))
      ]);
      
      const mapStories = feedResponse.data?.stories || [];
      const connStories = connResponse.data || [];
      const myStories = meResponse.data || [];
      
      const allStories = [...mapStories, ...connStories, ...myStories];
      const uniqueMap = new Map();
      allStories.forEach(s => {
        if (!uniqueMap.has(s.id)) {
          uniqueMap.set(s.id, s);
        }
      });
      const uniqueStories = Array.from(uniqueMap.values());
      uniqueStories.sort((a,b) => new Date(Object(b).created_at).getTime() - new Date(Object(a).created_at).getTime());
      
      setStories(uniqueStories);
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


  const fetchSidebarStats = useCallback(async () => {
    setIsSyncingStats(true);
    try {
      // 1. Get location for context
      const position: any = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
      }).catch(() => null);

      // Always fetch crossings (no location needed)
      const crossRes = await api.get('/crossings').catch(() => ({ data: [] }));
      const data = crossRes.data || [];
      const today = new Date().toISOString().split('T')[0];
      const todayCrossings = data.filter((c: any) => c.last_crossing_at?.startsWith(today));
      setCrossingsCount(todayCrossings.length);

      // Only fetch nearby + feed if we have location (both require lat/lng)
      if (position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const [nearbyRes, feedRes] = await Promise.all([
          api.get('/users/nearby', { params: { lat, lng, radius: 5 } }).catch(() => ({ data: [] })),
          api.get('/feed', { params: { latitude: lat, longitude: lng } }).catch(() => ({ data: { stories: [] } }))
        ]);

        setNearbyCount(nearbyRes.data?.length || 0);
        setStoriesCount(feedRes.data?.stories?.length || 0);
      }

    } catch (err) {
      console.error('Failed to sync sidebar stats:', err);
    } finally {
      setTimeout(() => setIsSyncingStats(false), 1000);
    }
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
    fetchSidebarStats();

    const handleConnectionAccepted = () => {
      console.log('Connection accepted, refreshing stories & stats...');
      fetchStories();
      fetchSidebarStats();
    };

    window.addEventListener('connection_accepted', handleConnectionAccepted);

    const interval = setInterval(() => {
      fetchSidebarStats();
    }, 10000); // Faster sync: 10 seconds for "real-time" feel

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('connection_accepted', handleConnectionAccepted);
      clearInterval(interval);
    };
  }, [fetchStories, fetchSidebarStats]);

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
            key={`home-${refreshKey}`}
            stories={stories}
            user={user}
            loading={loadingStories}
            onCreateStory={() => setIsCreateModalOpen(true)}
            onStoryClick={(userStories, index) => {
              setViewingStories(userStories);
              setViewingStoryIndex(index);
            }}
            showPanel={showRightSidebar}
            onTogglePanel={() => setShowRightSidebar(prev => !prev)}
            onNavigate={(tab) => setActiveTab(tab)}
            unreadNotificationsCount={totalUnreadCount}
            unreadMessagesCount={unreadMessagesCount}
          />
        );
      case 'profile':
        return <Profile onLogout={logout} />;
      case 'notifications':
        return <NotificationsView onUserSelect={handleUserSelect} />;
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
        return <CrossingsView onUserSelect={handleUserSelect} />;
      case 'casting':
        return <CastingPage />;
      case 'discovery':
        return <DiscoveryPage onUserSelect={handleUserSelect} />;
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
              {/* Column 1: Chat List */}
              <div className={`h-full border-r border-gray-100 ${selectedChatUser ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] shrink-0 bg-white`}>
                <ChatList onSelect={setSelectedChatUser} selectedId={selectedChatUser || undefined} />
              </div>

              {/* Column 2: Chat Window */}
              {selectedChatUser ? (
                <>
                  <div className="flex-1 h-full w-full border-r border-gray-100">
                    <ChatWindow
                      receiverId={selectedChatUser}
                      onBack={() => setSelectedChatUser(null)}
                    />
                  </div>
                  {/* Column 3: Profile Info (General Info) */}
                  <div className="hidden lg:flex h-full w-80 shrink-0 bg-white overflow-y-auto no-scrollbar">
                    <ChatProfileSidebar userId={selectedChatUser} />
                  </div>
                </>
              ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-white">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
                    <MessageSquare className="w-9 h-9 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">Select a Conversation</h3>
                  <p className="max-w-xs text-sm text-gray-400 leading-relaxed">
                    Choose a chat from the list or start a new one to view messages and details
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
    <div className="h-screen w-full bg-bg-base text-text-base font-poppins flex overflow-hidden p-0 md:p-3 md:gap-3 transition-colors duration-300">

      {/* 1. Left Sidebar */}
      <div className="hidden md:flex flex-col h-full bg-bg-sidebar md:rounded-[24px] shadow-sm relative flex-shrink-0 border border-border-base transition-all duration-300 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          logout={logout}
          unreadCount={totalUnreadCount}
          onCreatePost={() => setIsCreateModalOpen(true)}
        />
      </div>

      <Toaster position="top-right" reverseOrder={false} />

      {/* 2. Main Content Center (Scrollable) */}
      <main className="flex-1 relative overflow-hidden flex flex-col bg-bg-card md:rounded-[24px] shadow-sm z-10 w-full md:w-auto border border-border-base transition-colors duration-300">

        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 left-0 right-0 z-50 px-5 py-4 flex items-center justify-between bg-bg-card/95 backdrop-blur-xl border-b border-border-base">
          <div className="text-2xl font-black tracking-tighter italic">
            <span className="text-primary">Locolive</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle — always visible, not inside collapsible sidebar */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-base border border-border-base text-text-muted hover:text-primary hover:border-primary/30 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button className="relative hover:text-primary transition-colors text-text-muted" onClick={() => setActiveTab('notifications')}>
              <Bell className="w-6 h-6" />
              {totalUnreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-primary text-white text-[9px] font-black rounded-full border-2 border-bg-card flex items-center justify-center shadow-sm">{totalUnreadCount > 99 ? '99+' : totalUnreadCount}</span>}
            </button>
            <button className="relative hover:text-primary transition-colors text-text-muted" onClick={() => setActiveTab('messages')}>
              <MessageSquare className="w-6 h-6" />
              {unreadMessagesCount > 0 && <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-primary text-white text-[9px] font-black rounded-full border-2 border-bg-card flex items-center justify-center shadow-sm">{unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}</span>}
            </button>
          </div>
        </div>

        {/* Dynamic Route View */}
        <div className="flex-1 overflow-hidden relative">
          {renderView()}
        </div>

        {/* Mobile Bottom Navigation — 5 core tabs + floating create */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around bg-bg-card/95 backdrop-blur-2xl border-t border-border-base px-2 h-18 z-[60] shadow-[0_-8px_24px_rgba(255,0,110,0.06)]">
          <MobileNavItem icon={<Home className="w-5 h-5" />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <MobileNavItem icon={<MapIcon className="w-5 h-5" />} label="Map" active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} />

          <button
            onClick={() => setIsCreateModalOpen(true)}
            aria-label="Create new post"
            className="w-14 h-14 bg-brand-gradient rounded-full flex items-center justify-center transform -translate-y-4 shadow-xl shadow-primary/30 active:scale-90 transition-all text-white border-4 border-bg-card"
          >
            <Plus className="w-6 h-6 stroke-[3]" aria-hidden="true" />
          </button>

          <MobileNavItem icon={<Users className="w-5 h-5" />} label="People" active={activeTab === 'connections'} onClick={() => setActiveTab('connections')} />
          <MobileNavItem icon={<User className="w-5 h-5" />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>
      </main>

      {/* Right Sidebar — collapsible */}
      <div
        className={`hidden lg:flex flex-col overflow-hidden transition-all duration-300 ease-in-out bg-transparent md:rounded-[24px] ${
          showRightSidebar && isSidebarVisible ? 'w-80 opacity-100 px-0' : 'w-0 opacity-0 px-0 invisible'
        }`}
      >
        <div className="h-full bg-bg-sidebar border border-border-base md:rounded-[24px] overflow-hidden transition-colors duration-300">
          <RightSidebar 
            crossingsToday={crossingsCount} 
            nearbyCount={nearbyCount}
            storiesCount={storiesCount}
            isSyncing={isSyncingStats}
          />
        </div>
      </div>

      {/* Overlays / Modals */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchStories();
          setRefreshKey(prev => prev + 1);
        }}
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
const MobileNavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label?: string, active: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      aria-label={label || 'Navigate'}
      aria-current={active ? 'page' : undefined}
      className={`flex flex-col items-center gap-0.5 py-2 px-3 transition-all duration-300 ${active ? 'text-primary scale-105' : 'text-text-muted hover:text-primary/60'}`}
    >
      {icon}
      {label && <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-primary' : 'text-text-muted'}`}>{label}</span>}
    </button>
);

export default Dashboard;
