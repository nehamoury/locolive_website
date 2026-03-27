import { type FC } from 'react';
import { Home, Map as MapIcon, MessageSquare, User, Bell, Plus, Sparkles, Footprints, Users, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

type TabType = 'home' | 'explore' | 'messages' | 'notifications' | 'profile' | 'connections' | 'settings' | 'search' | 'crossings' | 'casting';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick: () => void;
}

const NavItem = ({ icon, label, active, badge, onClick, color }: NavItemProps & { color?: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-center md:justify-start px-4 py-3 rounded-2xl transition-all duration-300 relative group
      ${active
        ? 'bg-[#FFF0F6] text-[#FF3B8E]'
        : 'text-gray-500 hover:bg-gray-50'
      }`}
  >
    <div className={`relative flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-[#FF3B8E]' : color || 'text-gray-400 group-hover:text-gray-600'}`}>
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-[#FF3B8E] rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
    <span className={`ml-3.5 hidden md:block font-bold text-[14px] tracking-tight ${active ? 'text-[#FF3B8E]' : 'text-gray-500 group-hover:text-gray-700'}`}>
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
    <aside className="w-20 md:w-72 bg-white hidden md:flex flex-col px-4 py-8 z-20 flex-shrink-0 h-full border-r border-gray-100 shadow-sm overflow-y-auto no-scrollbar font-poppins">
      {/* Logo Area */}
      <div className="mb-10 px-3 flex flex-col items-center md:items-start cursor-default select-none">
        <div className="flex items-center gap-3 mb-0.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF3B8E] to-[#A436EE] flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform duration-300">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21C16 17 20 13.4183 20 9C20 4.58172 16.4183 1 12 1C7.58172 1 4 4.58172 4 9C4 13.4183 8 17 12 21Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="9" r="2.5" fill="white" />
            </svg>
          </div>
          <div className="hidden md:flex text-2xl font-black tracking-tighter">
            <span className="text-[#FF3B8E]">Locolive</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 mb-6">
        <NavItem
          icon={<Home className="w-5 h-5" />}
          label="Home"
          active={activeTab === 'home'}
          onClick={() => setActiveTab('home')}
          color="text-[#FF4D97]"
        />
        <NavItem
          icon={<MapIcon className="w-5 h-5" />}
          label="Map / Explore"
          active={activeTab === 'explore'}
          onClick={() => setActiveTab('explore')}
          color="text-[#FFA94D]"
        />
        <NavItem
          icon={<MessageSquare className="w-5 h-5" />}
          label="Messages"
          active={activeTab === 'messages'}
          badge={unreadCount}
          onClick={() => setActiveTab('messages')}
          color="text-[#9D7BFF]"
        />
        <NavItem
          icon={<Bell className="w-5 h-5" />}
          label="Notifications"
          active={activeTab === 'notifications'}
          onClick={() => setActiveTab('notifications')}
          color="text-[#FF9F1A]"
        />
        <NavItem
          icon={<Users className="w-5 h-5" />}
          label="Connections"
          active={activeTab === 'connections'}
          onClick={() => setActiveTab('connections')}
          color="text-[#4DABF7]"
        />
        <NavItem
          icon={<Footprints className="w-5 h-5" />}
          label="Crossings"
          active={activeTab === 'crossings'}
          onClick={() => setActiveTab('crossings')}
          color="text-[#20C997]"
        />
        <NavItem
          icon={<Sparkles className="w-5 h-5" />}
          label="Casting"
          active={activeTab === 'casting'}
          onClick={() => setActiveTab('casting')}
          color="text-[#FCC419]"
        />
        <NavItem
          icon={<User className="w-5 h-5" />}
          label="Profile"
          active={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
          color="text-[#495057]"
        />
      </nav>

      <div className="mb-6 hidden md:block">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreatePost}
          className="w-full py-3 bg-gradient-to-r from-[#FF3B8E] to-[#A436EE] rounded-full flex items-center justify-center gap-2 font-bold text-white text-[15px] shadow-[0_10px_20px_-5px_rgba(255,59,142,0.3)] transition-all"
        >
          <Plus className="w-5 h-5 stroke-[4]" />
          <span>Create Post</span>
        </motion.button>
      </div>

      {/* Mobile Create Post (Icon only) */}
      <div className="mb-4 md:hidden flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreatePost}
          className="w-11 h-11 bg-gradient-to-r from-[#FF3B8E] to-[#A436EE] rounded-full flex items-center justify-center text-white shadow-lg"
        >
          <Plus className="w-5 h-5 stroke-[4]" />
        </motion.button>
      </div>

      {/* Profile Snippet at Bottom */}
      <div className="mt-auto border-t border-gray-100 pt-6">
        <div className="w-full flex items-center justify-center md:justify-start px-2 py-3 rounded-2xl group select-none">
          <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-br from-[#FF3B8E] to-[#A436EE] flex-shrink-0 cursor-pointer" onClick={() => setActiveTab('profile')}>
            <div className="w-full h-full rounded-full bg-white overflow-hidden p-[1px]">
              {user?.avatar_url ? (
                <img src={`http://localhost:8080${user.avatar_url}`} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[#FF3B8E] font-bold text-sm">
                  {user?.username?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="ml-3 hidden md:flex flex-col text-left flex-1 min-w-0 cursor-pointer" onClick={() => setActiveTab('profile')}>
            <p className="font-bold text-sm text-gray-900 truncate">{user?.full_name || user?.username}</p>
            <p className="text-gray-400 text-xs font-medium truncate">@{user?.username}</p>
          </div>
          <button onClick={logout} className="ml-auto p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
