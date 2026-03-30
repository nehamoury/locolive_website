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
          api.get('/crossings').catch(() => ({ data: [] })),
          api.get('/connections/sent').catch(() => ({ data: [] })),
        ]);
        
        // Use real data (no demo fallback)
        const fetchedCrossings = crossingsRes.data || [];
        setCrossings(fetchedCrossings);

        // Mark already-requested users
        const sent = sentRes.data || [];
        const states: Record<string, RequestStatus> = {};
        sent.forEach((r: any) => {
          states[r.target_id || r.user_id] = 'requested';
        });
        // Mark already-connected
        fetchedCrossings.forEach((c: any) => {
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
          <button disabled className="px-3 py-1.5 bg-primary/10 text-primary/50 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Sending…</span>
          </button>
        );
      case 'requested':
        return (
          <span className="px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 border border-accent/20">
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
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-xs font-black tracking-wide flex items-center gap-1.5 hover:shadow-lg hover:shadow-pink-500/20 hover:-translate-y-0.5 transition-all shrink-0 active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Follow</span>
          </button>
        );
    }
  };

  return (
    <div className="h-full bg-white text-black overflow-y-auto no-scrollbar pb-24 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-gradient-to-tr from-pink-500/20 to-purple-500/20 rounded-2xl">
            <Footprints className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">Path Crossings</h1>
            <p className="text-sm font-bold text-gray-500 mt-0.5">People you've bumped into recently</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : crossings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-tr from-gray-50 to-gray-100 rounded-[2.5rem] flex items-center justify-center border border-gray-200/50 shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Footprints className="w-10 h-10 text-gray-300 relative z-10" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center scale-90 group-hover:scale-100 transition-transform">
                <MapPin className="w-4 h-4 text-pink-500" />
              </div>
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-2">No path crossings yet</h3>
            <p className="text-sm font-bold text-gray-400 max-w-[280px] leading-relaxed">
              Walk around your area and discover people nearby! Real magic happens when you bump into others.
            </p>
            
            <button 
              onClick={() => window.location.reload()}
              className="mt-8 px-6 py-2.5 bg-gray-900 text-white rounded-2xl text-[11px] font-black tracking-widest uppercase hover:bg-gray-800 transition-colors active:scale-95 shadow-lg shadow-black/10"
            >
              Refresh View
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {crossings.map((crossing, idx) => (
              <div key={idx} className="flex items-center p-4 bg-white rounded-3xl border border-gray-100 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center font-bold text-lg mr-4 shrink-0 text-white shadow-md shadow-pink-500/20">
                  {crossing.avatar_url ? (
                    <img src={crossing.avatar_url.startsWith('http') ? crossing.avatar_url : `http://localhost:8080${crossing.avatar_url}`} alt="avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    crossing.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-extrabold text-base text-gray-900 truncate">@{crossing.username}</p>
                  <div className="flex items-center space-x-3 mt-1.5">
                    <span className="flex items-center space-x-1.5 text-[11px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{crossing.location_name || 'Nearby'}</span>
                    </span>
                    <span className="flex items-center space-x-1.5 text-[11px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{crossing.crossed_at ? new Date(crossing.crossed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}</span>
                    </span>
                  </div>
                </div>
                <div className="pl-2">
                  {getButtonContent(crossing.user_id)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossingsView;
