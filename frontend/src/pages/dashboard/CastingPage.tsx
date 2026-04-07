import { useState, useEffect, useMemo, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CastingGrid from '../../components/casting/CastingGrid';
import { Sparkles, RefreshCcw, Heart, X, CheckCircle2, Search, Zap, Users } from 'lucide-react';
import api from '../../services/api';
import UserProfileView from './UserProfileView';

// ─── Toast Component ───────────────────────────────────────────────────────────
interface ToastProps { message: string; type: 'match' | 'pass'; }

const Toast: FC<ToastProps> = ({ message, type }) => (
  <motion.div
    initial={{ opacity: 0, y: 60, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 60, scale: 0.8 }}
    className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border font-bold text-sm ${type === 'match'
        ? 'bg-green-600/90 border-green-400/30 text-white'
        : 'bg-black/90 border-primary/10 text-white'
      }`}
  >
    {type === 'match' ? <CheckCircle2 className="w-5 h-5 text-green-300" /> : <X className="w-5 h-5 text-black/40" />}
    {message}
  </motion.div>
);

// ─── It's a Match! Popup ───────────────────────────────────────────────────────
interface MatchPopupProps {
  user: any;
  onClose: () => void;
}

const MatchPopup: FC<MatchPopupProps> = ({ user, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[998] flex items-center justify-center bg-black/80 backdrop-blur-lg p-6"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.5, y: 60 }}
      animate={{ scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }}
      exit={{ scale: 0.5, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
      className="relative bg-white border border-pink-100 rounded-[40px] p-10 flex flex-col items-center gap-6 max-w-sm w-full shadow-2xl shadow-pink-200"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      >
        <Heart className="w-16 h-16 text-pink-500 fill-pink-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]" />
      </motion.div>

      <div className="text-center">
        <h2 className="text-4xl font-black italic text-gray-900 tracking-tight mb-1 uppercase">It's a Match!</h2>
        <p className="text-gray-500 text-sm">
          You and <span className="text-pink-500 font-bold">@{user.username}</span> liked each other
        </p>
      </div>

      <div className="w-24 h-24 rounded-full border-4 border-pink-500 overflow-hidden shadow-xl bg-gray-50">
        {user.avatar_url ? (
          <img src={`http://localhost:8080${user.avatar_url}`} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-black text-gray-200 italic">
            {user.full_name?.charAt(0) || '?'}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-white font-bold text-lg shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all active:scale-95"
        >
          Keep Exploring
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const CastingPage: FC = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'match' | 'pass' } | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  
  // Filtering states
  const [activeTab, setActiveTab] = useState<'popular' | 'new' | 'online' | 'all'>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>(['nearby']);

  const showToast = (message: string, type: 'match' | 'pass') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchCastingUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/connections/suggested');
      setAllUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch casting users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCastingUsers(); }, []);

  // Dynamic Filtering Logic
  const filteredUsers = useMemo(() => {
    let result = [...allUsers];

    // 1. Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u => 
        u.username.toLowerCase().includes(q) || 
        u.full_name.toLowerCase().includes(q)
      );
    }

    // 2. Chip filters
    if (selectedChips.includes('mutuals')) {
      result = result.filter(u => u.mutual_count > 0);
    }
    if (selectedChips.includes('verified')) {
      result = result.filter(u => u.is_verified);
    }
    if (selectedChips.includes('nearby')) {
      result = result.filter(u => (u.distance_km || 0) < 10);
    }

    // 3. Tab logic
    switch (activeTab) {
      case 'popular':
        result.sort((a, b) => (b.mutual_count || 0) - (a.mutual_count || 0));
        break;
      case 'new':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'online':
        result = result.filter(u => {
          if (!u.last_active_at) return false;
          const lastActive = new Date(u.last_active_at).getTime();
          const fiveMinsAgo = Date.now() - (5 * 60 * 1000);
          return lastActive > fiveMinsAgo;
        });
        break;
    }

    return result;
  }, [allUsers, activeTab, searchQuery, selectedChips]);

  const handleMatch = async (id: string) => {
    const user = allUsers.find((u) => u.id === id);
    try {
      const res = await api.post('/connections/request', { target_user_id: id });
      setAllUsers((prev) => prev.filter((u) => u.id !== id));
      
      if (res.data.is_match && user) {
        setMatchedUser(user);
      } else {
        showToast('Request Sent! 💌', 'match');
      }
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setAllUsers((prev) => prev.filter((u) => u.id !== id));
        showToast('Already requested!', 'pass');
      } else {
        showToast('Failed to connect. Try again!', 'pass');
      }
    }
  };

  const handlePass = (id: string) => {
    setAllUsers((prev) => {
      const user = prev.find(u => u.id === id);
      const rest = prev.filter(u => u.id !== id);
      return user ? [...rest, user] : rest; // Move to end as requested
    });
    showToast('Passed 👋', 'pass');
  };

  const toggleChip = (chip: string) => {
    setSelectedChips(prev => 
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  if (profileUserId) {
    return <UserProfileView userId={profileUserId} onBack={() => setProfileUserId(null)} onMessage={() => {}} />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto no-scrollbar relative">
      {/* Header Section */}
      <div className="px-8 pt-10 pb-6 flex flex-col gap-8 bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-50 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-pink-500" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 italic tracking-tighter uppercase leading-none">User Casting</h1>
            </div>
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mt-2 ml-1">
              {loading ? 'Discovering...' : `${filteredUsers.length} people nearby`}
            </p>
          </div>

          <button
            onClick={fetchCastingUsers}
            className="p-3.5 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-100 transition-all active:rotate-180 duration-500 shadow-sm"
          >
            <RefreshCcw className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Compact Search & Tabs Hub */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 bg-gray-50/50 p-4 rounded-[28px] border border-gray-100 shadow-sm">
          {/* Tabs on Left */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-gray-50 shadow-sm">
            {(['popular', 'new', 'online', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-100' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search in Middle */}
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search by name or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-50 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-gray-700 focus:ring-4 focus:ring-pink-500/5 focus:border-pink-500/20 transition-all outline-none placeholder:text-gray-300"
            />
          </div>

          {/* Filter Chips on Right */}
          <div className="flex items-center gap-2">
            <FilterChip 
              icon={<Zap className="w-3.5 h-3.5" />} 
              label="Nearby" 
              active={selectedChips.includes('nearby')} 
              onClick={() => toggleChip('nearby')} 
            />
            <FilterChip 
              icon={<Users className="w-3.5 h-3.5" />} 
              label="Mutuals" 
              active={selectedChips.includes('mutuals')} 
              onClick={() => toggleChip('mutuals')} 
            />
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 bg-[#FDFDFF]">
        <CastingGrid
          users={filteredUsers}
          loading={loading}
          onMatch={handleMatch}
          onPass={handlePass}
          onViewProfile={setProfileUserId}
        />
      </div>

      {/* Match Popup */}
      <AnimatePresence>
        {matchedUser && <MatchPopup user={matchedUser} onClose={() => setMatchedUser(null)} />}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key={toast.message} message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
};

// Helper Component: Filter Chip
const FilterChip = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
      active 
        ? 'bg-white border-pink-100 text-gray-900 shadow-md shadow-pink-50' 
        : 'bg-transparent border-gray-100 text-gray-400 hover:border-gray-200'
    }`}
  >
    <span className={active ? 'text-pink-500' : 'text-gray-300'}>{icon}</span>
    {label}
  </button>
);

export default CastingPage;
