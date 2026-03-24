import { type FC } from 'react';
import { Home, Map as MapIcon, MessageSquare, User, Bell, Plus, ShieldAlert, Sparkles, Footprints, Search, LogOut } from 'lucide-react';
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
    className={`w-full flex items-center justify-center md:justify-start px-4 py-3 rounded-xl transition-all duration-200 relative group
      ${active
        ? 'bg-white/10 text-white'
        : 'text-white/50 hover:bg-white/5 hover:text-white/80'
      }`}
  >
    <div className={`relative flex-shrink-0 ${active ? 'text-white' : ''}`}>
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
    <span className={`ml-4 hidden md:block font-semibold text-[14px] ${active ? 'text-white' : 'text-white/50'}`}>
      {label}
    </span>
    {active && (
      <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-pink-400 to-purple-500 rounded-l-full" />
    )}
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
    <aside className="w-20 md:w-64 bg-[#1a1a2e] hidden md:flex flex-col px-3 py-6 z-20 flex-shrink-0 h-full overflow-y-auto no-scrollbar">
      {/* Logo Area */}
      <div className="mb-8 px-3 flex flex-col items-center md:items-start cursor-default select-none">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          </div>
          <div className="hidden md:flex text-xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Loco</span>
            <span className="text-purple-300">live</span>
          </div>
        </div>
        <p className="hidden md:block text-[10px] font-semibold text-white/30 uppercase tracking-widest pl-10">
          Discover your area
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 mb-6">
        <NavItem icon={<Home className="w-5 h-5" />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavItem icon={<MapIcon className="w-5 h-5" />} label="Discover" active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} />
        <NavItem icon={<Sparkles className="w-5 h-5" />} label="Casting" active={activeTab === 'casting'} onClick={() => setActiveTab('casting')} />
        <NavItem icon={<MessageSquare className="w-5 h-5" />} label="Messages" active={activeTab === 'messages'} badge={unreadCount} onClick={() => setActiveTab('messages')} />
        <NavItem icon={<Bell className="w-5 h-5" />} label="Alerts" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
        <NavItem icon={<Footprints className="w-5 h-5" />} label="Crossings" active={activeTab === 'crossings'} onClick={() => setActiveTab('crossings')} />
        <NavItem icon={<Search className="w-5 h-5" />} label="Search" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
        <NavItem icon={<User className="w-5 h-5" />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        <NavItem icon={<ShieldAlert className="w-5 h-5" />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </nav>

      {/* Create Post Button */}
      <div className="mb-4 hidden md:block px-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreatePost}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center gap-2 font-bold text-white text-sm shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Post</span>
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
      <div className="mt-auto border-t border-white/5 pt-4">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center md:justify-start px-3 py-2 rounded-xl hover:bg-white/5 transition-all group"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            {user?.avatar_url ? (
              <img src={`http://localhost:8080${user.avatar_url}`} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-white">{user?.full_name?.charAt(0) || user?.username?.charAt(0) || '?'}</span>
            )}
          </div>
          <div className="ml-3 hidden md:flex flex-col text-left flex-1 min-w-0">
            <p className="font-semibold text-sm text-white truncate">{user?.full_name || user?.username}</p>
            <p className="text-white/40 text-xs truncate">@{user?.username}</p>
          </div>
          <LogOut className="ml-auto w-4 h-4 hidden md:block opacity-0 group-hover:opacity-60 transition-opacity text-red-400" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
