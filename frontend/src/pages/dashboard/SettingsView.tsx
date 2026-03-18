import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Bell, User, Lock, Trash2, Ghost, EyeOff, MapPin } from 'lucide-react';
import api from '../../lib/api';

interface SettingsViewProps {
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const [privacy, setPrivacy] = useState({
    ghost_mode: false,
    show_online_status: true,
    share_location_with_friends: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/privacy');
        // Map backend naming to frontend state if different
        setPrivacy({
          ghost_mode: res.data.ghost_mode || false,
          show_online_status: res.data.show_online_status ?? true,
          share_location_with_friends: res.data.share_location_with_friends ?? true,
        });
      } catch (err) {
        console.error('Failed to fetch privacy settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const toggleSetting = async (key: keyof typeof privacy) => {
    const newVal = !privacy[key];
    const updated = { ...privacy, [key]: newVal };
    setPrivacy(updated);
    
    try {
      await api.put('/privacy', {
        ghost_mode: updated.ghost_mode,
        show_online_status: updated.show_online_status,
        share_location_with_friends: updated.share_location_with_friends
      });
    } catch (err) {
      console.error('Failed to update settings:', err);
      // Revert on failure
      setPrivacy(privacy);
    }
  };

  return (
    <div className="h-full bg-black text-white overflow-y-auto no-scrollbar pb-24 md:pb-0 animate-in slide-in-from-right duration-300">
      <div className="max-w-xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        </div>

        <div className="space-y-8">
          {/* Privacy Section */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 ml-1">Privacy & Safety</h2>
            <div className="space-y-1 bg-white/5 rounded-2xl overflow-hidden border border-white/5">
              <SettingItem 
                icon={<Ghost className="w-4 h-4 text-purple-400" />} 
                title="Ghost Mode" 
                description="Hide your location from everyone on the map"
                active={privacy.ghost_mode}
                onToggle={() => toggleSetting('ghost_mode')}
              />
              <SettingItem 
                icon={<EyeOff className="w-4 h-4 text-blue-400" />} 
                title="Online Status" 
                description="Show when you're active in the app"
                active={privacy.show_online_status}
                onToggle={() => toggleSetting('show_online_status')}
              />
              <SettingItem 
                icon={<MapPin className="w-4 h-4 text-green-400" />} 
                title="Location Sharing" 
                description="Automatically share location with friends"
                active={privacy.share_location_with_friends}
                onToggle={() => toggleSetting('share_location_with_friends')}
              />
            </div>
          </section>

          {/* Account Section */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 ml-1">Account</h2>
            <div className="space-y-1 bg-white/5 rounded-2xl overflow-hidden border border-white/5">
               <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/5 rounded-lg"><User className="w-4 h-4" /></div>
                    <span className="text-sm font-medium">Edit Profile</span>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-gray-600 rotate-180" />
               </div>
               <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/5 rounded-lg"><Lock className="w-4 h-4" /></div>
                    <span className="text-sm font-medium">Change Password</span>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-gray-600 rotate-180" />
               </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <h2 className="text-xs font-semibold text-red-500/60 uppercase tracking-widest mb-4 ml-1">Danger Zone</h2>
            <button className="w-full flex items-center space-x-3 p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all">
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-bold">Delete Account</span>
            </button>
            <p className="text-[10px] text-gray-600 mt-3 text-center px-4">This action is permanent and will wipe all your stories, messages, and location history.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}

const SettingItem = ({ icon, title, description, active, onToggle }: SettingItemProps) => (
  <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/[0.03] last:border-0">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-black/40 rounded-xl">{icon}</div>
      <div>
        <h4 className="text-sm font-bold">{title}</h4>
        <p className="text-[10px] text-gray-500">{description}</p>
      </div>
    </div>
    <button 
      onClick={onToggle}
      className={`w-10 h-5 rounded-full relative transition-all ${active ? 'bg-purple-600' : 'bg-white/10'}`}
    >
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
    </button>
  </div>
);

export default SettingsView;
