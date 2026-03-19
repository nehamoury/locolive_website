import { useState, useEffect, type FC } from 'react';
import { Footprints, MapPin, Clock, UserPlus } from 'lucide-react';
import api from '../../services/api';

const CrossingsView: FC = () => {
  const [crossings, setCrossings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrossings = async () => {
      try {
        const res = await api.get('/crossings');
        setCrossings(res.data || []);
      } catch (err) {
        console.error('Failed to fetch crossings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCrossings();
  }, []);

  const handleConnect = async (userId: string) => {
    try {
      await api.post('/connections/request', { user_id: userId });
      setCrossings(prev => prev.map(c => c.user_id === userId ? { ...c, connected: true } : c));
    } catch (err) {
      console.error('Failed to send connection:', err);
    }
  };

  return (
    <div className="h-full bg-black text-white overflow-y-auto no-scrollbar pb-24 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-600/20 rounded-xl">
            <Footprints className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Path Crossings</h1>
            <p className="text-xs text-gray-500">People whose paths crossed yours recently</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : crossings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center opacity-40">
            <Footprints className="w-14 h-14 mb-4" />
            <p className="text-sm font-medium max-w-[250px]">No path crossings yet. Walk around your area and discover people nearby!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {crossings.map((crossing, idx) => (
              <div key={idx} className="flex items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 flex items-center justify-center font-bold text-sm mr-4 shrink-0">
                  {crossing.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">@{crossing.username}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="flex items-center space-x-1 text-[10px] text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{crossing.location_name || 'Nearby'}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-[10px] text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{crossing.crossed_at ? new Date(crossing.crossed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}</span>
                    </span>
                  </div>
                </div>
                {!crossing.connected ? (
                  <button
                    onClick={() => handleConnect(crossing.user_id)}
                    className="px-3 py-1.5 bg-white text-black rounded-lg text-xs font-bold flex items-center space-x-1 hover:bg-gray-200 transition-colors shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Follow</span>
                  </button>
                ) : (
                  <span className="text-xs text-green-500 font-bold shrink-0">Following</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossingsView;
