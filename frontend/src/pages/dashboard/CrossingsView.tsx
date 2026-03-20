import { useState, useEffect, type FC } from 'react';
import { Footprints, MapPin, Clock, UserPlus, Check, Loader2 } from 'lucide-react';
import api from '../../services/api';

type RequestStatus = 'none' | 'sending' | 'requested' | 'connected';

const CrossingsView: FC = () => {
  const [crossings, setCrossings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestStates, setRequestStates] = useState<Record<string, RequestStatus>>({});

  useEffect(() => {
    const fetchCrossings = async () => {
      try {
        // Fetch crossings + sent requests in parallel
        const [crossingsRes, sentRes] = await Promise.all([
          api.get('/crossings'),
          api.get('/connections/sent-requests').catch(() => ({ data: [] })),
        ]);
        setCrossings(crossingsRes.data || []);

        // Mark already-requested users
        const sent = sentRes.data || [];
        const states: Record<string, RequestStatus> = {};
        sent.forEach((r: any) => {
          states[r.target_id || r.user_id] = 'requested';
        });
        // Mark already-connected
        (crossingsRes.data || []).forEach((c: any) => {
          if (c.connected) states[c.user_id] = 'connected';
        });
        setRequestStates(states);
      } catch (err) {
        console.error('Failed to fetch crossings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCrossings();
  }, []);

  const handleFollow = async (userId: string) => {
    setRequestStates(prev => ({ ...prev, [userId]: 'sending' }));
    try {
      await api.post('/connections/request', { target_user_id: userId });
      setRequestStates(prev => ({ ...prev, [userId]: 'requested' }));
    } catch (err: any) {
      console.error('Failed to send follow request:', err);
      // If already sent, treat as requested
      if (err.response?.data?.message?.includes('already')) {
        setRequestStates(prev => ({ ...prev, [userId]: 'requested' }));
      } else {
        setRequestStates(prev => ({ ...prev, [userId]: 'none' }));
      }
    }
  };

  const getButtonContent = (userId: string) => {
    const status = requestStates[userId] || 'none';
    switch (status) {
      case 'sending':
        return (
          <button disabled className="px-3 py-1.5 bg-white/10 text-white/50 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Sending…</span>
          </button>
        );
      case 'requested':
        return (
          <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Requested</span>
          </span>
        );
      case 'connected':
        return (
          <span className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 border border-green-500/20">
            <Check className="w-3.5 h-3.5" />
            <span>Following</span>
          </span>
        );
      default:
        return (
          <button
            onClick={() => handleFollow(userId)}
            className="px-3 py-1.5 bg-white text-black rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-gray-200 transition-colors shrink-0 active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Follow</span>
          </button>
        );
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
                {getButtonContent(crossing.user_id)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossingsView;
