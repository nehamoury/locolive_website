import { useState, useEffect, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CastingGrid from '../../components/casting/CastingGrid';
import { Sparkles, RefreshCcw, Heart, X, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import UserProfileView from './UserProfileView';

// ─── Toast Component ───────────────────────────────────────────────────────────
interface ToastProps { message: string; type: 'match' | 'pass'; }

const Toast: FC<ToastProps> = ({ message, type }) => (
  <motion.div
    initial={{ opacity: 0, y: 60, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 60, scale: 0.8 }}
    className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border font-bold text-white text-sm ${
      type === 'match'
        ? 'bg-gradient-to-r from-green-600/80 to-emerald-500/80 border-green-400/30'
        : 'bg-black/80 border-white/10'
    }`}
  >
    {type === 'match' ? <CheckCircle2 className="w-5 h-5 text-green-300" /> : <X className="w-5 h-5 text-gray-400" />}
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
      className="relative bg-gradient-to-b from-zinc-900 to-black border border-white/10 rounded-[40px] p-10 flex flex-col items-center gap-6 max-w-sm w-full shadow-2xl"
    >
      {/* Background glow */}
      <div className="absolute inset-0 rounded-[40px] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-600/20" />
        {/* Confetti dots */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b'][i % 4],
              left: `${10 + (i * 7.5) % 80}%`,
              top: `${5 + (i * 11) % 30}%`,
            }}
            animate={{ y: [0, -20, 0], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5 + i * 0.1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>

      {/* Hearts */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6, repeat: Infinity }}
        className="relative z-10"
      >
        <Heart className="w-16 h-16 text-pink-500 fill-pink-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]" />
      </motion.div>

      <div className="text-center z-10">
        <h2 className="text-4xl font-black italic text-white tracking-tight mb-1">It's a Match!</h2>
        <p className="text-gray-400 text-sm">
          You and <span className="text-white font-bold">@{user.username}</span> liked each other
        </p>
      </div>

      {/* Avatar */}
      <div className="w-24 h-24 rounded-full border-4 border-pink-500 overflow-hidden shadow-xl z-10 bg-zinc-800">
        {user.avatar_url ? (
          <img src={`http://localhost:8080${user.avatar_url}`} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white/30 italic">
            {user.full_name?.charAt(0) || '?'}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full z-10">
        <button
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-white font-black text-lg shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] transition-all active:scale-95"
        >
          🎉 Keep Exploring
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 font-bold hover:bg-white/10 transition-all"
        >
          Keep Swiping
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const CastingPage: FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'match' | 'pass' } | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  const showToast = (message: string, type: 'match' | 'pass') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchCastingUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/connections/suggested');
      const mapped = (res.data || []).map((u: any) => ({
        id: u.id,
        full_name: u.full_name || u.username,
        username: u.username,
        age: u.age,
        distance: u.distance || 'Nearby',
        is_premium: u.is_premium || false,
        avatar_url: u.avatar_url,
        bio: u.bio,
      }));
      setUsers(mapped);
    } catch (err) {
      console.error('Failed to fetch casting users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCastingUsers(); }, []);

  const handleMatch = async (id: string) => {
    const user = users.find((u) => u.id === id);
    try {
      // ✅ Fixed: backend expects "target_user_id", not "user_id"
      await api.post('/connections/request', { target_user_id: id });
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (user) setMatchedUser(user);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        // Already requested — still show match and remove card
        setUsers((prev) => prev.filter((u) => u.id !== id));
        if (user) setMatchedUser(user);
      } else {
        console.error('Failed to send connection request:', err);
        showToast('Could not send request. Try again!', 'pass');
      }
    }
  };

  const handlePass = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('Passed 👋', 'pass');
  };

  const handleViewProfile = (id: string) => {
    setProfileUserId(id);
  };

  // Profile view
  if (profileUserId) {
    return (
      <UserProfileView
        userId={profileUserId}
        onBack={() => setProfileUserId(null)}
        onMessage={(id) => console.log('Message clicked for user', id)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0c] overflow-y-auto no-scrollbar relative">
      {/* Header */}
      <div className="px-6 py-8 flex items-center justify-between sticky top-0 bg-[#0a0a0c]/80 backdrop-blur-xl z-30 border-b border-white/5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">User Casting</h1>
          </div>
          <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mt-1 opacity-60">
            {loading ? 'Loading...' : `${users.length} people nearby`}
          </p>
        </div>

        <button
          onClick={fetchCastingUsers}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all active:rotate-180 duration-500"
        >
          <RefreshCcw className="w-5 h-5 text-purple-400" />
        </button>
      </div>

      {/* Hint bar */}
      {!loading && users.length > 0 && (
        <div className="flex items-center justify-center gap-8 py-3 border-b border-white/5 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <X className="w-3 h-3 text-red-500" /> Drag left or tap X to pass
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="w-3 h-3 text-pink-500 fill-pink-500" /> Drag right or tap Match
          </span>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1">
        <CastingGrid
          users={users}
          loading={loading}
          onMatch={handleMatch}
          onPass={handlePass}
          onViewProfile={handleViewProfile}
        />
      </div>

      {/* "It's a Match!" Popup */}
      <AnimatePresence>
        {matchedUser && (
          <MatchPopup user={matchedUser} onClose={() => setMatchedUser(null)} />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key={toast.message} message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
};

export default CastingPage;
