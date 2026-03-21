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
    className={`w-full flex items-center justify-center md:justify-start px-4 py-3.5 rounded-2xl transition-all duration-300 relative group
      ${active 
        ? 'bg-gradient-to-r from-[#EE2A7B]/20 to-[#6228D7]/20 border border-[#EE2A7B]/20' 
        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
      }`}
  >
    <div className={`relative transition-colors ${active ? 'text-[#EE2A7B]' : ''}`}>
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EE2A7B] rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg shadow-[#EE2A7B]/50">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
    <span className={`ml-4 hidden md:block font-bold text-[15px] ${active ? 'text-white' : ''}`}>
      {label}
    </span>
    {active && (
       <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#EE2A7B] to-[#6228D7] rounded-r-full" />
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
    <aside className="w-20 md:w-64 border-r border-white/5 bg-[#0B0E14] hidden md:flex flex-col px-4 py-8 z-20 flex-shrink-0 h-full overflow-y-auto no-scrollbar">
      {/* Logo Area */}
      <div className="mb-10 px-4 flex flex-col items-center md:items-start cursor-default select-none">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#EE2A7B] to-[#6228D7] flex items-center justify-center shadow-lg shadow-[#EE2A7B]/20">
            <div className="w-3 h-3 bg-white rounded-full 
animate-pulse" />
          </div>
          <div className="hidden md:flex text-2xl font-black italic tracking-tighter">
            <span className="bg-gradient-to-r from-[#EE2A7B] to-[#6228D7] bg-clip-text text-transparent">Loco</span>
            <span className="text-blue-400">live</span>
          </div>
        </div>
        <p className="hidden md:block text-[11px] font-bold text-[#6228D7] opacity-80 uppercase tracking-widest pl-10">
          Discover your area
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 mb-6">
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
      <div className="mb-6 hidden md:block px-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreatePost}
          className="w-full py-3.5 bg-gradient-to-r from-[#EE2A7B] to-[#6228D7] rounded-2xl flex items-center justify-center gap-2 font-bold text-white shadow-[0_0_20px_rgba(238,42,123,0.3)] hover:shadow-[0_0_30px_rgba(238,42,123,0.5)] transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Create Post</span>
        </motion.button>
      </div>
      
      {/* Mobile Create Post (Icon only) */}
      <div className="mb-6 md:hidden flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreatePost}
          className="w-12 h-12 bg-gradient-to-r from-[#EE2A7B] to-[#6228D7] rounded-full flex items-center justify-center text-white shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Profile Snippet at Bottom */}
      <div className="mt-auto">
        <div className="mb-4 hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
           <div className="text-xl">🌡️</div>
           <div className="flex flex-col">
             <span className="text-[10px] font-bold text-slate-400">Hot days ahead</span>
             <span className="text-xs font-black text-white">32°C</span>
           </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center md:justify-start p-3 rounded-2xl hover:bg-white/5 transition-all group text-slate-400 hover:text-white"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-zinc-800 flex items-center justify-center flex-shrink-0">
            {user?.avatar_url ? (
               <img src={`http://localhost:8080${user.avatar_url}`} alt="avatar" className="w-full h-full object-cover" />
            ) : (
               <span className="text-sm font-bold text-white">{user?.full_name?.charAt(0) || '?'}</span>
            )}
          </div>
          <div className="ml-3 hidden md:flex flex-col text-left flex-1 min-w-0">
            <p className="font-bold text-sm text-white truncate">{user?.full_name}</p>
            <p className="text-slate-500 text-xs truncate">@{user?.username}</p>
          </div>
          <LogOut className="ml-auto w-4 h-4 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity text-rose-500" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
