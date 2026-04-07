import { useState, useEffect, type FC } from 'react';
import { 
  ChevronDown,
  ChevronRight,
  User,
  BellOff,
  Slash
} from 'lucide-react';
import api from '../../services/api';

interface ChatProfileSidebarProps {
  userId: string;
  onViewFullProfile?: (userId: string) => void;
}

const ChatProfileSidebar: FC<ChatProfileSidebarProps> = ({ userId, onViewFullProfile }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['general', 'media']);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/${userId}`);
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch user profile for sidebar:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  if (loading) {
    return (
      <div className="w-full h-full p-8 flex flex-col items-center bg-white/80 backdrop-blur-3xl">
        <div className="w-24 h-24 rounded-full bg-gray-50 animate-pulse mb-6" />
        <div className="h-4 bg-gray-50 rounded-lg w-1/2 animate-pulse mb-3" />
        <div className="h-3 bg-gray-50 rounded-lg w-1/3 animate-pulse" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-3xl p-6 space-y-8 font-poppins min-w-[320px]">
      {/* Top Profile Card */}
      <div className="flex flex-col items-center text-center mt-4">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-pink-500 to-purple-500 shadow-xl shadow-pink-500/20">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url.startsWith('http') ? profile.avatar_url : `http://localhost:8080${profile.avatar_url}`} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-4xl font-black text-gray-200 uppercase leading-none">
                  {profile.username?.charAt(0)}
                </span>
              )}
            </div>
          </div>
          <div className="absolute bottom-1 right-1 p-1 bg-emerald-500 border-4 border-white rounded-full shadow-lg w-6 h-6" />
        </div>

        <h3 className="text-[18px] font-black text-gray-900 leading-tight tracking-tight uppercase italic px-2 w-full">
          {profile.full_name || `@${profile.username}`}
        </h3>
        <p className="text-[10px] text-pink-500 mt-1 uppercase tracking-[0.2em] font-black italic">Creative Director</p>
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center justify-center gap-4">
         <button 
           onClick={() => onViewFullProfile?.(userId)}
           className="p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-pink-500 hover:border-pink-200 shadow-sm transition-all"
           title="View Profile"
         >
            <User className="w-5 h-5" />
         </button>
         <button className="p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-pink-500 hover:border-pink-200 shadow-sm transition-all" title="Mute Notifications">
            <BellOff className="w-5 h-5" />
         </button>
         <button className="p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-red-500 hover:border-red-200 shadow-sm transition-all" title="Block User">
            <Slash className="w-5 h-5" />
         </button>
      </div>

      <div className="space-y-6 pt-2 overflow-y-auto no-scrollbar">
        {/* General Info */}
        <SidebarSection 
          title="General Info" 
          isOpen={expandedSections.includes('general')} 
          onToggle={() => toggleSection('general')}
        >
          <div className="space-y-4 pt-4 bg-gray-50/50 rounded-2xl p-4 mt-2 border border-gray-100/50">
            <InfoItem label="Email Address" value={profile.email || 'Not shared'} />
            <InfoItem label="Phone Number" value={profile.phone || '+1 (555) 012-3456'} />
            <InfoItem label="Account Created" value={new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
          </div>
        </SidebarSection>

        {/* Shared Media */}
        <SidebarSection 
          title="Shared Media" 
          isOpen={expandedSections.includes('media')} 
          onToggle={() => toggleSection('media')}
        >
           <div className="grid grid-cols-3 gap-2 pt-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="aspect-square rounded-xl bg-gray-100 overflow-hidden relative group cursor-pointer">
                 <img src={`https://picsum.photos/200/200?random=${i + 10}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                 {i === 3 && (
                   <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center text-[12px] font-black text-white">
                     +24
                   </div>
                 )}
               </div>
             ))}
           </div>
           <button className="w-full mt-4 py-2 text-[10px] font-black text-pink-500 hover:text-pink-600 transition-colors uppercase tracking-[0.2em] italic text-right">
              View All Media →
           </button>
        </SidebarSection>
      </div>
    </div>
  );
};

const SidebarSection = ({ title, isOpen, onToggle, children }: any) => (
  <div className="pb-4">
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] group"
    >
      <span className="group-hover:text-gray-900 transition-colors">{title}</span>
      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
    </button>
    {isOpen && <div>{children}</div>}
  </div>
);

const InfoItem = ({ label, value }: any) => (
  <div className="flex flex-col space-y-1">
    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">{label}</span>
    <div className="flex items-center gap-2 text-[12px] text-gray-800 font-bold">
       {value}
    </div>
  </div>
);

export default ChatProfileSidebar;
