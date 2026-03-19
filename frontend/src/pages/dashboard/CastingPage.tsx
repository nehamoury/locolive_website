import { useState, useEffect, type FC } from 'react';
import CastingGrid from '../../components/casting/CastingGrid';
import { Sparkles, RefreshCcw } from 'lucide-react';
import api from '../../services/api';

const CastingPage: FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCastingUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/connections/suggested');
      // Map backend fields to the UI card format if necessary
      const mappedUsers = (res.data || []).map((u: any) => ({
        id: u.id,
        full_name: u.full_name || u.username,
        username: u.username,
        age: u.age || 25, // Fallback if age not in profile
        distance: u.distance || 'Nearby',
        is_premium: u.is_premium || false,
        avatar_url: u.avatar_url
      }));
      setUsers(mappedUsers);
    } catch (err) {
      console.error("Failed to fetch casting users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCastingUsers();
  }, []);

  const handleMatch = async (id: string) => {
    try {
      await api.post('/connections/request', { user_id: id });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error("Failed to match:", err);
    }
  };

  const handlePass = (id: string) => {
    console.log("Passed user:", id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0c] overflow-y-auto no-scrollbar">
      {/* Premium Header */}
      <div className="px-6 py-8 flex items-center justify-between sticky top-0 bg-[#0a0a0c]/80 backdrop-blur-xl z-30 border-b border-white/5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">User Casting</h1>
          </div>
          <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mt-1 opacity-60">Discover Premium Matches Nearby</p>
        </div>
        
        <button 
          onClick={fetchCastingUsers}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all active:rotate-180 duration-500"
        >
          <RefreshCcw className="w-5 h-5 text-purple-400" />
        </button>
      </div>

      {/* Discovery Area */}
      <div className="flex-1">
        <CastingGrid 
          users={users} 
          loading={loading} 
          onMatch={handleMatch} 
          onPass={handlePass} 
        />
      </div>
    </div>
  );
};

export default CastingPage;
