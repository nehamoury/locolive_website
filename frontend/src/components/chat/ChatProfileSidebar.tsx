import { useState, useEffect, type FC } from 'react';
import { 
  Mail, 
  Calendar, 
  Phone, 
  ChevronDown,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import api from '../../services/api';

interface ChatProfileSidebarProps {
  userId: string;
}

const ChatProfileSidebar: FC<ChatProfileSidebarProps> = ({ userId }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['general']);

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
      <div className="p-8 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-gray-50 animate-pulse mb-4" />
        <div className="h-4 bg-gray-50 rounded-lg w-1/2 animate-pulse mb-2" />
        <div className="h-3 bg-gray-50 rounded-lg w-1/3 animate-pulse" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-100 p-6 space-y-8 font-poppins">
      {/* Top Profile Card */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-gray-100 to-gray-50 border border-gray-100 shadow-sm">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url.startsWith('http') ? profile.avatar_url : `http://localhost:8080${profile.avatar_url}`} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-3xl font-medium text-gray-300 uppercase leading-none">
                  {profile.username?.charAt(0)}
                </span>
              )}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 p-1.5 bg-white border border-gray-100 rounded-full shadow-sm">
             <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
          </div>
        </div>

        <h3 className="text-lg font-medium text-gray-900 leading-tight truncate px-2 w-full">
          {profile.full_name || `@${profile.username}`}
        </h3>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-medium">@{profile.username}</p>
        
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full">
           <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
           <span className="text-[10px] font-medium text-orange-600 uppercase">Responded</span>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center justify-center gap-3">
         <button className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-blue-500 transition-all">
            <Phone className="w-4 h-4" />
         </button>
         <button className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-blue-500 transition-all">
            <MoreHorizontal className="w-4 h-4" />
         </button>
      </div>

      <div className="space-y-6">
        {/* General Info */}
        <SidebarSection 
          title="General Info" 
          isOpen={expandedSections.includes('general')} 
          onToggle={() => toggleSection('general')}
        >
          <div className="space-y-4 pt-2">
            <InfoItem label="Email" value={profile.email || 'Not shared'} />
            <InfoItem label="Phone" value={profile.phone || '+1 000-000-000'} />
            <InfoItem label="Date Created" value={new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
          </div>
        </SidebarSection>

        {/* Tags */}
        <SidebarSection 
          title={`Tags ${profile.tags?.length || 0}`} 
          isOpen={expandedSections.includes('tags')} 
          onToggle={() => toggleSection('tags')}
        >
           <div className="flex flex-wrap gap-2 pt-2 pb-2">
             <div className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-medium text-gray-600 flex items-center gap-1">
                <span>😊 Great</span>
                <ChevronRight className="w-2.5 h-2.5" />
             </div>
             <div className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-medium text-gray-600 flex items-center gap-1">
                <span>🙌 Interested</span>
                <ChevronRight className="w-2.5 h-2.5" />
             </div>
           </div>
        </SidebarSection>

        {/* Notes */}
        <SidebarSection 
          title="Notes" 
          isOpen={expandedSections.includes('notes')} 
          onToggle={() => toggleSection('notes')}
        >
           <div className="bg-yellow-50/50 border border-yellow-100 p-4 rounded-xl mt-2 text-[11px] font-normal leading-relaxed text-gray-700">
              I have made an appointment for tomorrow's meeting at 10 AM.
              <div className="mt-2 text-[10px] text-yellow-600 font-medium">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
           </div>
           <button className="w-full mt-3 py-2 text-[10px] font-medium text-blue-500 hover:text-blue-600 transition-colors uppercase tracking-widest text-right">
              Add Note +
           </button>
        </SidebarSection>
      </div>
    </div>
  );
};

const SidebarSection = ({ title, isOpen, onToggle, children }: any) => (
  <div className="border-b border-gray-50 pb-4">
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between text-[11px] font-medium text-gray-400 uppercase tracking-widest group"
    >
      <span className="group-hover:text-gray-900 transition-colors shrink-0">{title}</span>
      {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
    </button>
    {isOpen && <div>{children}</div>}
  </div>
);

const InfoItem = ({ label, value }: any) => (
  <div className="flex flex-col space-y-1">
    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">{label}</span>
    <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
       {value}
    </div>
  </div>
);

export default ChatProfileSidebar;
