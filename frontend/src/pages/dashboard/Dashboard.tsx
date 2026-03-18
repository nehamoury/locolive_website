import React, { useState, useEffect } from 'react';
import { LogOut, Home, Map as MapIcon, MessageSquare, User, Bell, Plus, Heart, Share2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import MapView from '../map/MapView';
import CreateStoryModal from '../../components/stories/CreateStoryModal';
import api from '../../lib/api';
import ChatList from '../../components/chat/ChatList';
import ChatWindow from '../../components/chat/ChatWindow';
import StoryViewer from '../../components/stories/StoryViewer';
import ProfileView from './ProfileView';
import NotificationsView from './NotificationsView';
import ConnectionsView from './ConnectionsView';
import SettingsView from './SettingsView';
import SearchView from './SearchView';
import CrossingsView from './CrossingsView';
import { Users, Search, Footprints } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'messages' | 'notifications' | 'profile' | 'connections' | 'settings' | 'search' | 'crossings'>('home');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  const [, setPanicSequence] = useState('');
  const [showPanicConfirm, setShowPanicConfirm] = useState(false);

  const fetchStories = async () => {
    if (loadingStories) return;
    setLoadingStories(true);
    try {
      // Get current location for feed (silently falls back to Delhi on desktop)
      const position: any = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      }).catch(() => null);

      // Default to Delhi if geolocation fails
      const defaultCoords = { latitude: 28.6139, longitude: 77.2090 };
      const params = position ? { latitude: position.coords.latitude, longitude: position.coords.longitude } : defaultCoords;

      const response = await api.get('/feed', { params });
      setStories(response.data.stories || []);
    } catch (err: any) {
      const backendError = err.response?.data?.error || err.response?.data?.message || 'Unknown error';
      console.error('Failed to fetch stories:', backendError, err.response?.data);
      setStories([]); // Set empty stories on error to prevent infinite loading
      if (err.response?.status === 401) {
        console.warn('Unauthorized! Logging out...');
        logout();
      }
    } finally {
      setLoadingStories(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/messages/unread-count');
      setUnreadCount(response.data.unread_count || 0);
    } catch (err) {
      console.warn('Failed to fetch unread count:', err);
    }
  };

  useEffect(() => {
    // Keyboard shortcut for Panic Mode
    const handleKeyDown = (e: KeyboardEvent) => {
      const char = e.key.toUpperCase();
      if ("DELETE".includes(char)) {
        setPanicSequence((prev: string) => {
          const next = (prev + char).slice(-6);
          if (next === "DELETE") {
            setShowPanicConfirm(true);
          }
          return next;
        });
      } else {
        setPanicSequence('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Live Location Pinger (Heartbeat)
    const pingLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              await api.post('/location/ping', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
            } catch (err) {
              console.error("Failed to ping location:", err);
            }
          },
          () => {}, // Silently ignore geolocation errors on desktop
          { timeout: 10000, enableHighAccuracy: true }
        );
      }
    };

    // Initial ping
    pingLocation();
    // Ping every 30 seconds
    const interval = setInterval(pingLocation, 30000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  const handlePanic = async () => {
    try {
      await api.post('/location/panic');
      logout();
      window.location.href = '/login';
    } catch (err) {
      console.error("Panic failed:", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'home') {
      fetchStories();
    }
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="h-screen w-full bg-black text-white font-sans flex flex-col md:flex-row overflow-hidden relative">
      {/* Sidebar - Desktop */}
      <aside className="w-20 md:w-64 border-r border-white/10 bg-black hidden md:flex flex-col px-4 py-6 z-20">
        <div className="mb-8 px-4 flex justify-center md:justify-start">
          <div className="text-xl font-black italic tracking-tighter">Locolive</div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<Home className="w-6 h-6" />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem icon={<Search className="w-6 h-6" />} label="Search" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
          <NavItem icon={<MapIcon className="w-6 h-6" />} label="Explore" active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} />
          <NavItem icon={<Footprints className="w-6 h-6" />} label="Crossings" active={activeTab === 'crossings'} onClick={() => setActiveTab('crossings')} />
          <NavItem icon={<Bell className="w-6 h-6" />} label="Activity" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
          <NavItem icon={<Users className="w-6 h-6" />} label="Connections" active={activeTab === 'connections'} onClick={() => setActiveTab('connections')} />
          <NavItem icon={<MessageSquare className="w-6 h-6" />} label="Messages" active={activeTab === 'messages'} badge={unreadCount > 0 ? unreadCount : undefined} onClick={() => setActiveTab('messages')} />
          <NavItem icon={<User className="w-6 h-6" />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <NavItem icon={<ShieldAlert className="w-6 h-6" />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />

          <div className="pt-6">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full h-12 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded-lg font-bold text-sm transition-all"
            >
              <Plus className="w-5 h-5 md:mr-2" />
              <span className="hidden md:block">Post Story</span>
            </button>
          </div>
        </nav>

        <div className="mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center md:justify-start p-3 rounded-full hover:bg-white/10 transition-colors group text-gray-400 hover:text-white"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-white/20 flex items-center justify-center text-sm font-bold text-white">
              {user?.full_name.charAt(0)}
            </div>
            <div className="ml-3 hidden md:block text-left">
              <p className="font-bold text-sm leading-none">{user?.full_name}</p>
              <p className="text-gray-500 text-xs">@{user?.username}</p>
            </div>
            <LogOut className="ml-auto w-5 h-5 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col pb-[50px] md:pb-0 bg-black">
        {/* Mobile Header (Instagram Style) */}
        {activeTab === 'home' && (
          <div className="md:hidden absolute top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between pointer-events-none">
            <div className="text-xl font-bold tracking-tighter drop-shadow-md pb-1 pointer-events-auto">Locolive</div>
            <div className="flex space-x-4 pointer-events-auto">
              <button className="relative">
                <Bell className="w-6 h-6 drop-shadow-md filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              </button>
              <button 
                className="relative"
                onClick={() => setActiveTab('messages')}
              >
                <MessageSquare className="w-6 h-6 drop-shadow-md filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-black" />}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' ? (
          <ProfileView onLogout={logout} />
        ) : activeTab === 'notifications' ? (
          <NotificationsView />
        ) : activeTab === 'explore' ? (
          <MapView onStorySelect={(storyId: string) => {
            const index = stories.findIndex((s: any) => s.id === storyId);
            if (index !== -1) setViewingStoryIndex(index);
          }} />
        ) : activeTab === 'connections' ? (
          <ConnectionsView />
        ) : activeTab === 'settings' ? (
          <SettingsView onBack={() => setActiveTab('profile')} />
        ) : activeTab === 'search' ? (
          <SearchView />
        ) : activeTab === 'crossings' ? (
          <CrossingsView />
        ) : activeTab === 'messages' ? (
          <div className="flex h-full w-full overflow-hidden">
            <div className={`h-full w-full md:w-80 border-r border-white/10 ${selectedChatUser ? 'hidden md:block' : 'block'}`}>
              <ChatList
                onSelect={setSelectedChatUser}
                selectedId={selectedChatUser || undefined}
              />
            </div>
            {selectedChatUser ? (
              <div className="flex-1 h-full w-full flex flex-col bg-black relative">
                {/* Mobile back button to chat list */}
                <button 
                  onClick={() => setSelectedChatUser(null)}
                  className="md:hidden absolute top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <ChatWindow receiverId={selectedChatUser} />
              </div>
            ) : (
              <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-[#0a0a0c]">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Your Conversations</h3>
                <p className="text-gray-500 max-w-sm">Select a chat from the list on the left to start messaging. Your privacy is our priority.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* TikTok-style Vertical Feed */}
            <div className="h-full snap-y snap-mandatory overflow-y-auto no-scrollbar">
              {loadingStories ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                </div>
              ) : stories.length > 0 ? (
                stories.map((story) => (
                  <div key={story.id} className="h-full w-full snap-start relative bg-black flex items-center justify-center overflow-hidden">
                    {/* Dynamic Blurred Background */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center blur-3xl opacity-50 scale-110" 
                      style={{ backgroundImage: `url(http://localhost:8080${story.media_url})` }}
                    />
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/50 to-transparent z-10 pointer-events-none" />

                    <img 
                      src={`http://localhost:8080${story.media_url}`} 
                      alt="Content" 
                      className="h-full w-full object-cover md:w-auto md:max-h-full md:object-contain cursor-pointer relative z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
                      onClick={() => setViewingStoryIndex(stories.indexOf(story))}
                    />
                    
                    {/* Interaction Buttons (Instagram/Snapchat Style) */}
                    <div className="absolute right-3 bottom-24 md:bottom-20 flex flex-col items-center space-y-5 z-30">
                      
                      <div className="group cursor-pointer flex flex-col items-center">
                        <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-black/40 active:scale-95">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[10px] mt-1 font-semibold drop-shadow-md">42.1K</span>
                      </div>

                      <div className="group cursor-pointer flex flex-col items-center">
                        <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-black/40 active:scale-95">
                          <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[10px] mt-1 font-semibold drop-shadow-md">452</span>
                      </div>

                      <div className="group cursor-pointer flex flex-col items-center">
                        <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-black/40 active:scale-95">
                          <Share2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[10px] mt-1 font-semibold drop-shadow-md">Share</span>
                      </div>
                    </div>

                    {/* Content Info */}
                    <div className="absolute bottom-6 md:bottom-6 left-3 right-16 md:left-4 md:right-20 z-30">
                      <div className="flex items-center space-x-2 mb-2">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 flex items-center justify-center font-bold text-xs border border-white/50 text-white shadow-sm">
                           {story.username.charAt(0).toUpperCase()}
                         </div>
                         <div className="flex flex-col drop-shadow-md">
                           <p className="font-semibold text-sm leading-tight text-white">@{story.username}</p>
                         </div>
                      </div>
                      <p className="text-xs md:text-sm text-gray-100 line-clamp-2 drop-shadow-md mb-2">{story.caption}</p>
                      <div className="flex items-center space-x-1.5 text-white/90 text-[10px] font-medium bg-black/30 backdrop-blur-sm self-start inline-flex px-2 py-1 rounded-sm cursor-pointer hover:bg-black/50 transition-colors">
                         <MapIcon className="w-3 h-3 text-white" />
                         <span>Nearby</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-500">
                    <Home className="w-10 h-10" />
                  </div>
                  <p className="text-gray-400">Nothing here yet. Post your first story!</p>
                  <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>Post a Story</Button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation (Instagram Style) */}
      <nav className="md:hidden fixed bottom-0 w-full flex items-center justify-around bg-black border-t border-white/10 pb-safe pt-2 px-2 z-[60] h-[50px]">
        <MobileNavItem icon={<Home className="w-6 h-6" />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <MobileNavItem icon={<MapIcon className="w-6 h-6" />} active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} />
        
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-8 h-8 border border-white/40 rounded-lg flex items-center justify-center transition-transform active:scale-95"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
        
        <MobileNavItem icon={<Users className="w-6 h-6" />} active={activeTab === 'connections'} onClick={() => setActiveTab('connections')} />
        <MobileNavItem icon={<User className="w-6 h-6" />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </nav>

      <CreateStoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchStories}
      />

      {viewingStoryIndex !== null && (
        <StoryViewer 
          stories={stories} 
          initialIndex={viewingStoryIndex} 
          onClose={() => setViewingStoryIndex(null)} 
        />
      )}

      {showPanicConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-red-950/20 backdrop-blur-2xl p-6">
          <div className="bg-black border-2 border-red-600 p-8 rounded-[40px] max-w-md w-full text-center shadow-[0_0_100px_rgba(220,38,38,0.3)]">
            <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
              <ShieldAlert className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Panic Mode Detected</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              You typed the secret code. This will <span className="text-red-500 font-bold underline">permanently delete all your data</span> including messages, stories, and connections.
            </p>
            <div className="space-y-3">
              <button 
                onClick={handlePanic}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-wider transition-all transform active:scale-95"
              >
                Yes, Purge Everything
              </button>
              <button 
                onClick={() => setShowPanicConfirm(false)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-400 rounded-2xl font-bold transition-all"
              >
                Wait, Cancel!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}

const NavItem = ({ icon, label, active, badge, onClick }: NavItemProps) => (
  <div
    onClick={onClick}
    className={`
      flex items-center p-3 rounded-lg cursor-pointer transition-all group
      ${active ? 'text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
    `}
  >
    <div className="relative">
      <div className={`${active ? 'scale-105' : 'group-hover:scale-105 transition-transform'}`}>
        {icon}
      </div>
      {badge && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] text-white flex items-center justify-center rounded-full font-bold">
          {badge}
        </span>
      )}
    </div>
    <span className={`ml-4 text-sm hidden md:block ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
  </div>
);

const MobileNavItem = ({ icon, active, badge, onClick }: Omit<NavItemProps, 'label'>) => (
  <div onClick={onClick} className="relative p-2 flex flex-col items-center justify-center cursor-pointer">
    <div className={`transition-all duration-300 ${active ? 'text-white' : 'text-gray-500'}`}>
      {icon}
    </div>
    {badge && (
      <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 text-[8px] text-white flex items-center justify-center rounded-full font-bold">
        {badge}
      </span>
    )}
  </div>
);

export default Dashboard;
