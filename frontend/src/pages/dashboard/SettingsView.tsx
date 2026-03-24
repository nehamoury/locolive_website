import { useState, useEffect, type FC } from 'react';
import { ArrowLeft, User, Lock, Trash2, EyeOff, MapPin } from 'lucide-react';
import api from '../../services/api';

interface SettingsViewProps {
  onBack: () => void;
}

const SettingsView: FC<SettingsViewProps> = ({ onBack }) => {
  const [privacy, setPrivacy] = useState({
    who_can_message: 'everyone',
    who_can_see_stories: 'everyone',
    show_location: true,
  });


  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/privacy');
        // Map backend naming to frontend state if different
        setPrivacy({
          who_can_message: res.data.who_can_message || 'everyone',
          who_can_see_stories: res.data.who_can_see_stories || 'everyone',
          show_location: res.data.show_location ?? true,
        });
      } catch (err) {
        console.error('Failed to fetch privacy settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const updateSetting = async (key: keyof typeof privacy, value: string | boolean) => {
    const updated = { ...privacy, [key]: value };
    const previous = { ...privacy };
    setPrivacy(updated);
    
    try {
      await api.put('/privacy', {
        who_can_message: updated.who_can_message,
        who_can_see_stories: updated.who_can_see_stories,
        show_location: updated.show_location
      });
    } catch (err) {
      console.error('Failed to update settings:', err);
      // Revert on failure
      setPrivacy(previous);
    }
  };

  const cycleEnum = (key: 'who_can_message' | 'who_can_see_stories') => {
    const options = ['everyone', 'connections', 'nobody'];
    const currentIndex = options.indexOf(privacy[key]);
    const nextIndex = (currentIndex + 1) % options.length;
    updateSetting(key, options[nextIndex]);
  };

  return (
    <div className="h-full bg-[#f9e8ff] text-black overflow-y-auto no-scrollbar pb-24 md:pb-0 animate-in slide-in-from-right duration-300">
      <div className="max-w-xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-primary/5 rounded-full transition-colors text-black">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-black">Settings</h1>
        </div>

        <div className="space-y-8">
          {/* Privacy Section */}
          <section>
            <h2 className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-4 ml-1">Privacy & Safety</h2>
            <div className="space-y-1 bg-primary/5 rounded-2xl overflow-hidden border border-primary/10">
              <SettingItem 
                icon={<MapPin className="w-4 h-4 text-green-400" />} 
                title="Show Location" 
                description="Allow others to see your location on the map"
                active={privacy.show_location}
                onToggle={() => updateSetting('show_location', !privacy.show_location)}
              />
              <EnumSettingItem 
                icon={<Lock className="w-4 h-4 text-purple-400" />}
                title="Who Can Message You"
                value={privacy.who_can_message}
                onCycle={() => cycleEnum('who_can_message')}
              />
              <EnumSettingItem 
                icon={<EyeOff className="w-4 h-4 text-blue-400" />}
                title="Who Can See Your Stories"
                value={privacy.who_can_see_stories}
                onCycle={() => cycleEnum('who_can_see_stories')}
              />
            </div>
          </section>

          {/* Account Section */}
          <section>
            <h2 className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-4 ml-1">Account</h2>
            <div className="space-y-1 bg-primary/5 rounded-2xl overflow-hidden border border-primary/10">
               <div className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors cursor-pointer group">
                  <div className="flex items-center space-x-3 text-black">
                    <div className="p-2 bg-primary/5 rounded-lg"><User className="w-4 h-4" /></div>
                    <span className="text-sm font-medium">Edit Profile</span>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-black/20 rotate-180" />
               </div>
               <div className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors cursor-pointer group">
                  <div className="flex items-center space-x-3 text-black">
                    <div className="p-2 bg-primary/5 rounded-lg"><Lock className="w-4 h-4" /></div>
                    <span className="text-sm font-medium">Change Password</span>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-black/20 rotate-180" />
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
            <p className="text-[10px] text-black/40 mt-3 text-center px-4">This action is permanent and will wipe all your stories, messages, and location history.</p>
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
  <div className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors border-b border-primary/5 last:border-0">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-primary/10 rounded-xl">{icon}</div>
      <div>
        <h4 className="text-sm font-bold text-black">{title}</h4>
        <p className="text-[10px] text-black/40">{description}</p>
      </div>
    </div>
    <button 
      onClick={onToggle}
      className={`w-10 h-5 rounded-full relative transition-all ${active ? 'bg-primary' : 'bg-black/10'}`}
    >
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
    </button>
  </div>
);

interface EnumSettingItemProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  onCycle: () => void;
}

const EnumSettingItem = ({ icon, title, value, onCycle }: EnumSettingItemProps) => (
  <div onClick={onCycle} className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors border-b border-primary/5 last:border-0 cursor-pointer group">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-primary/10 rounded-xl">{icon}</div>
      <div>
        <h4 className="text-sm font-bold text-black">{title}</h4>
        <p className="text-[10px] text-accent uppercase font-bold tracking-widest">{value}</p>
      </div>
    </div>
    <div className="text-[10px] text-black/40 group-hover:text-accent transition-colors uppercase font-bold tracking-tighter">Tap to change</div>
  </div>
);

export default SettingsView;
