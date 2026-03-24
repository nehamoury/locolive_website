import { type FC } from 'react';
import { Home, Map as MapIcon, MessageSquare, User, Bell, Plus, ShieldAlert, Search, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

type TabType = 'home' | 'explore' | 'messages' | 'notifications' | 'profile' | 'connections' | 'settings' | 'search' | 'crossings' | 'casting';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick: () => void;
}

const NavItem = ({ icon, label, active, badge, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-center md:justify-start px-4 py-3 rounded-2xl transition-all duration-200 relative group
      ${active
        ? 'bg-pink-50 text-pink-600'
        : 'text-gray-500 hover:bg-gray-50'
      }`}
  >
    <div className={`relative flex-shrink-0 ${active ? 'text-pink-600' : 'text-gray-400'}`}>
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
    <span className={`ml-4 hidden md:block font-bold text-[15px] ${active ? 'text-pink-600' : 'text-gray-500'}`}>
      {label}
    </span>

  </button>
);

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  user: any;
  unreadCount: number;
  logout: () => void;
  onCreatePost: () => void;
}

const Sidebar: FC<SidebarProps> = ({ activeTab, setActiveTab, user, unreadCount, logout, onCreatePost }) => {
  return (
    <aside className="w-20 md:w-72 bg-white hidden md:flex flex-col px-4 py-8 z-20 flex-shrink-0 h-full border-r border-gray-100 shadow-sm overflow-y-auto no-scrollbar">
      {/* Logo Area */}
      <div className="mb-10 px-3 flex flex-col items-center md:items-start cursor-default select-none">
        <div className="flex items-center gap-3 mb-0.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
            <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
          </div>
          <div className="hidden md:flex text-2xl font-black tracking-tighter italic">
            <span className="text-pink-600">Loco</span>
            <span className="text-purple-600">live</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 mb-6">
        <NavItem icon={<Home className="w-6 h-6" />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavItem icon={<MapIcon className="w-6 h-6" />} label="Discover" active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} />
        <NavItem icon={<MessageSquare className="w-6 h-6" />} label="Messages" active={activeTab === 'messages'} badge={unreadCount} onClick={() => setActiveTab('messages')} />
        <NavItem icon={<Bell className="w-6 h-6" />} label="Alerts" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
        <NavItem icon={<Search className="w-6 h-6" />} label="Search" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
        <NavItem icon={<User className="w-6 h-6" />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        <NavItem icon={<ShieldAlert className="w-6 h-6" />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </nav>

      <div className="mb-6 hidden md:block">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreatePost}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center gap-2 font-black text-white text-lg shadow-[0_10px_20px_-5px_rgba(236,72,153,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(236,72,153,0.5)] transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Create Post</span>
        </motion.button>
      </div>

      {/* Mobile Create Post (Icon only) */}
      <div className="mb-4 md:hidden flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreatePost}
          className="w-11 h-11 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Profile Snippet at Bottom */}
      <div className="mt-auto border-t border-gray-100 pt-6">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center md:justify-start px-2 py-3 rounded-2xl hover:bg-gray-50 transition-all group"
        >
          <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {user?.avatar_url ? (
              <img src={`http://localhost:8080${user.avatar_url}`} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold italic">
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div className="ml-3 hidden md:flex flex-col text-left flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-900 truncate">{user?.full_name || user?.username}</p>
            <p className="text-gray-400 text-xs font-medium truncate">@{user?.username}</p>
          </div>
          <LogOut className="ml-auto w-4 h-4 hidden md:block opacity-0 group-hover:opacity-40 transition-opacity text-gray-900" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
