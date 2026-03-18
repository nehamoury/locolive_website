import React, { useState, useEffect } from 'react';
import { LogOut, Home, Map as MapIcon, MessageSquare, User, Bell, Settings, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import MapView from '../map/MapView';
import CreateStoryModal from '../../components/stories/CreateStoryModal';
import api from '../../lib/api';
import ChatList from '../../components/chat/ChatList';
import ChatWindow from '../../components/chat/ChatWindow';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'messages' | 'notifications' | 'profile'>('home');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchStories = async () => {
    if (loadingStories) return;
    setLoadingStories(true);
    try {
      console.log('Fetching stories... Token present:', !!localStorage.getItem('token'));
      // Get current location for feed
      const position: any = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      }).catch(() => null);

      // Default to Delhi if geolocation fails
      const defaultCoords = { latitude: 28.6139, longitude: 77.2090 };
      const params = position ? { latitude: position.coords.latitude, longitude: position.coords.longitude } : defaultCoords;
      console.log('Feed Params:', params);
      
      const response = await api.get('/feed', { params });
      setStories(response.data.stories || []);
    } catch (err: any) {
      const backendError = err.response?.data?.error || err.response?.data?.message || 'Unknown error';
      console.error('Failed to fetch stories:', backendError, err.response?.data);
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
      console.error('Failed to fetch unread count:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'home') {
      fetchStories();
    }
    fetchUnreadCount();
    
    // Refresh unread count periodically
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 border-r border-white/10 bg-white/5 backdrop-blur-xl flex flex-col p-4 z-20">
        <div className="mb-10 flex items-center justify-center md:justify-start px-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20" />
          <span className="ml-3 font-bold text-xl hidden md:block">Locolive</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem 
            icon={<Home />} 
            label="Home" 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')}
          />
          <NavItem 
            icon={<MapIcon />} 
            label="Explore" 
            active={activeTab === 'explore'} 
            onClick={() => setActiveTab('explore')}
          />
          
          <NavItem 
            icon={<MessageSquare />} 
            label="Messages" 
            active={activeTab === 'messages'} 
            badge={unreadCount > 0 ? unreadCount : undefined}
            onClick={() => setActiveTab('messages')} 
          />
          <NavItem 
            icon={<Bell />} 
            label="Notifications" 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')} 
          />
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full flex items-center justify-center md:justify-start p-3 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20 hover:bg-purple-600/20 transition-all group"
          >
            <Plus className="w-6 h-6 group-hover:scale-110 group-hover:rotate-90 transition-transform" />
            <span className="ml-3 font-bold hidden md:block">Create Story</span>
          </button>

          <NavItem 
            icon={<User />} 
            label="Profile" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
        </nav>

        <div className="space-y-2 pt-4 border-t border-white/10">
          <NavItem icon={<Settings />} label="Settings" />
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center md:justify-start p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors group"
          >
            <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="ml-3 font-medium hidden md:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        {activeTab === 'explore' ? (
          <MapView />
        ) : activeTab === 'messages' ? (
          <div className="flex h-full overflow-hidden">
             <ChatList 
               onSelect={setSelectedChatUser} 
               selectedId={selectedChatUser || undefined} 
             />
             {selectedChatUser ? (
               <ChatWindow receiverId={selectedChatUser} />
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a0a0c]">
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
            {/* Background Glows */}
            <div className="absolute top-[-20%] left-[10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

            {/* Header */}
            <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 backdrop-blur-md sticky top-0 z-10 bg-[#0a0a0c]/50">
              <h2 className="text-xl font-semibold">Feed</h2>
              <div className="flex items-center space-y-0 space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">@{user?.username}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-white/20 overflow-hidden">
                   <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                     {user?.full_name.charAt(0)}
                   </div>
                </div>
              </div>
            </header>

            {/* Content Area */}
            <div className="p-8 max-w-5xl mx-auto space-y-8">
              <section>
                 <h3 className="text-lg font-medium mb-4 text-gray-400">Nearby Stories</h3>
                 {loadingStories ? (
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="aspect-[9/16] rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
                      ))}
                   </div>
                 ) : stories.length > 0 ? (
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {stories.map((story) => (
                        <div key={story.id} className="aspect-[9/16] rounded-2xl bg-white/5 border border-white/10 flex items-end p-4 relative overflow-hidden group cursor-pointer hover:border-purple-500/50 transition-colors">
                          <img src={`http://localhost:8080${story.media_url}`} alt="Story" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                          <div className="w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0" />
                          <div className="relative z-10 w-full space-y-1">
                             <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-purple-600 border border-white/20 flex items-center justify-center text-[10px] font-bold">
                                   {story.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[10px] font-bold">@{story.username}</span>
                             </div>
                             <p className="text-[10px] text-gray-300 line-clamp-1">{story.caption}</p>
                          </div>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center space-y-4">
                      <p className="text-gray-400">No stories nearby yet. Be the first to share!</p>
                      <Button variant="secondary" onClick={() => setIsCreateModalOpen(true)}>Post a Story</Button>
                   </div>
                 )}
              </section>

              <section className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                 <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <MapIcon className="w-10 h-10 text-purple-400" />
                 </div>
                 <h4 className="text-2xl font-bold">Welcome to Locolive, {user?.full_name}!</h4>
                 <p className="text-gray-400 max-w-md">
                    You're successfully logged in. Start exploring the world around you.
                 </p>
                 <Button variant="primary" className="px-10" onClick={() => setActiveTab('explore')}>Start Exploring</Button>
              </section>
            </div>
          </>
        )}
      </main>

      <CreateStoryModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchStories}
      />
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
      flex items-center justify-center md:justify-start p-3 rounded-xl cursor-pointer transition-all group
      ${active ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
    `}
  >
    <div className="relative">
      {React.cloneElement(icon as any, { 
        className: `w-6 h-6 ${active ? '' : 'group-hover:scale-110 transition-transform'}` 
      })}
      {badge && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-[10px] text-white flex items-center justify-center rounded-full font-bold">
          {badge}
        </span>
      )}
    </div>
    <span className="ml-3 font-medium hidden md:block">{label}</span>
  </div>
);

export default Dashboard;
