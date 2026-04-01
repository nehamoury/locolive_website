import { useState, useEffect, type FC } from 'react';
import { Footprints, MapPin, Clock, UserPlus, MessageCircle, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

type RequestStatus = 'none' | 'sending' | 'requested' | 'connected';

interface CrossingsViewProps {
  onUserSelect?: (userId: string) => void;
}

const CrossingsView: FC<CrossingsViewProps> = ({ onUserSelect }) => {
  const [crossings, setCrossings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestStates, setRequestStates] = useState<Record<string, RequestStatus>>({});

  useEffect(() => {
    const fetchCrossings = async () => {
      try {
        const [crossingsRes, sentRes] = await Promise.all([
          api.get('/crossings').catch(() => ({ data: [] })),
          api.get('/connections/sent').catch(() => ({ data: [] })),
        ]);
        
        const fetchedCrossings = crossingsRes.data || [];
        setCrossings(fetchedCrossings);

        const sent = sentRes.data || [];
        const states: Record<string, RequestStatus> = {};
        sent.forEach((r: any) => {
          states[r.target_id || r.user_id] = 'requested';
        });
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

  const handleFollow = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setRequestStates(prev => ({ ...prev, [userId]: 'sending' }));
    try {
      await api.post('/connections/request', { target_user_id: userId });
      setRequestStates(prev => ({ ...prev, [userId]: 'requested' }));
    } catch (err: any) {
      console.error('Failed to send follow request:', err);
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
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          </div>
        );
      case 'requested':
        return (
          <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Clock className="w-5 h-5" />
          </div>
        );
      case 'connected':
        return (
          <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
             <MessageCircle className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <button
            onClick={(e) => handleFollow(e, userId)}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 transition-all hover:scale-110 active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        );
    }
  };

  const isToday = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  const sections = [
    { title: 'Today', items: crossings.filter(c => isToday(c.last_crossing_at || c.crossed_at)) },
    { title: 'Earlier', items: crossings.filter(c => !isToday(c.last_crossing_at || c.crossed_at)) },
  ];

  return (
    <div className="h-full bg-white text-black overflow-y-auto no-scrollbar pb-32">
      <div className="max-w-2xl mx-auto px-6 py-10">
        
        {/* Header Section */}
        <div className="flex items-end justify-between mb-12">
            <div>
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 mb-2"
                >
                    <div className="p-2 bg-pink-500 rounded-lg">
                        <Footprints className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[3px] text-pink-500">Real Discovery</span>
                </motion.div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Path Crossings</h1>
                <p className="text-xs font-bold text-black/30 mt-2">Discover who you've met in the real world.</p>
            </div>
        </div>

        {loading ? (
             <div className="space-y-4">
                {[1,2,3].map(i => (
                    <div key={i} className="h-24 bg-gray-50 rounded-[32px] animate-pulse" />
                ))}
             </div>
        ) : crossings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mb-6">
                <Footprints className="w-10 h-10 text-black/10" />
            </div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">No encounters yet</h3>
            <p className="text-xs font-bold text-black/30 max-w-[240px] leading-relaxed">
              New people will appear here when you naturally cross paths with them.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {sections.map(section => section.items.length > 0 && (
                <div key={section.title}>
                    <h2 className="text-[10px] font-black uppercase tracking-[5px] text-black/20 mb-6 px-2">{section.title}</h2>
                    <div className="space-y-3">
                        <AnimatePresence>
                            {section.items.map((crossing, idx) => (
                                <motion.div
                                    key={crossing.user_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => onUserSelect?.(crossing.user_id)}
                                    className="group relative flex items-center p-5 bg-white border border-gray-100 rounded-[32px] hover:shadow-2xl hover:shadow-black/5 hover:border-gray-200 transition-all cursor-pointer"
                                >
                                    <div className="relative shrink-0 mr-5">
                                        <div className="w-16 h-16 rounded-[24px] overflow-hidden bg-gray-50 border border-gray-100 group-hover:rotate-[-3deg] transition-transform duration-500">
                                            {crossing.avatar_url ? (
                                                <img src={crossing.avatar_url.startsWith('http') ? crossing.avatar_url : `http://localhost:8080${crossing.avatar_url}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-black text-black/20 text-xl italic">
                                                    {(crossing.full_name || crossing.username).charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-black text-lg text-black tracking-tight leading-none truncate">
                                                {crossing.full_name || crossing.username}
                                            </p>
                                            {crossing.crossing_count > 1 && (
                                                <span className="px-2 py-0.5 bg-pink-50 text-pink-500 text-[9px] font-black uppercase rounded-full">
                                                    {crossing.crossing_count}x Encounters
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-black/30">
                                            <span className="flex items-center gap-1.5 uppercase tracking-widest">
                                                <MapPin className="w-3 h-3" />
                                                Nearby Area
                                            </span>
                                            <span className="flex items-center gap-1.5 uppercase tracking-widest">
                                                <Clock className="w-3 h-3" />
                                                {new Date(crossing.last_crossing_at || crossing.crossed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="w-5 h-5 text-black/10" />
                                        </div>
                                        {getButtonContent(crossing.user_id)}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
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
