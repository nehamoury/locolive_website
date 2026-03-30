import { useState, useEffect, type FC } from 'react';
import { 
  UserPlus, 
  UserCheck, 
  X, 
  Search, 
  Users, 
  MessageSquare, 
  MapPin, 
  Filter, 
  ChevronRight,
  ArrowRight,
  UserMinus,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface ConnectionsViewProps {
  initialTab?: 'suggestions' | 'requests' | 'my-connections';
  onUserSelect?: (userId: string) => void;
  onMessage?: (userId: string) => void;
}

const ConnectionsView: FC<ConnectionsViewProps> = ({ initialTab = 'suggestions', onUserSelect, onMessage }) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'requests' | 'my-connections'>(initialTab);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchSuggestions = async () => {
    try {
      const res = await api.get('/connections/suggested');
      setSuggestions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('/connections/requests');
      setRequests(res.data || []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  const fetchConnections = async () => {
    try {
      const res = await api.get('/connections');
      setConnections(res.data || []);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    }
  };

  const loadAllCounts = async () => {
    // Silently update counts in background
    api.get('/connections/requests').then(res => setRequests(res.data || []));
    api.get('/connections/suggested').then(res => setSuggestions(res.data || []));
    api.get('/connections').then(res => setConnections(res.data || []));
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (activeTab === 'suggestions') await fetchSuggestions();
      else if (activeTab === 'requests') await fetchRequests();
      else if (activeTab === 'my-connections') await fetchConnections();
      setLoading(false);
      loadAllCounts();
    };
    loadData();
  }, [activeTab]);

  const handleRequest = async (userId: string, action: 'send' | 'accept' | 'decline' | 'remove') => {
    try {
      if (action === 'send') {
        await api.post('/connections/request', { target_user_id: userId });
        setSuggestions(prev => prev.filter(s => s.id !== userId));
      } else if (action === 'accept') {
        await api.post('/connections/update', { requester_id: userId, status: 'accepted' });
        setRequests(prev => prev.filter(r => (r.user_id || r.requester_id) !== userId));
        fetchConnections(); // Refresh Following tab
      } else if (action === 'decline') {
        await api.post('/connections/update', { requester_id: userId, status: 'blocked' });
        setRequests(prev => prev.filter(r => (r.user_id || r.requester_id) !== userId));
      } else if (action === 'remove') {
        if (!window.confirm('Remove this person from your following?')) return;
        await api.delete(`/connections/${userId}`);
        setConnections(prev => prev.filter(c => c.id !== userId));
      }
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
    }
  };

  const filteredData = () => {
    let data = [];
    if (activeTab === 'suggestions') data = suggestions;
    else if (activeTab === 'requests') data = requests;
    else if (activeTab === 'my-connections') data = connections;

    if (!searchQuery) return data;
    return data.filter((item: any) => 
      (item.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="h-full bg-white text-black overflow-y-auto no-scrollbar pb-24 md:pb-0">
      <div className="max-w-3xl mx-auto px-6 py-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase italic">Connections</h1>
            <p className="text-sm font-bold text-gray-400 mt-1">Manage your network and discover new friends</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative group flex-1 md:flex-none md:min-w-[240px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Search network..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-pink-500/5 focus:border-pink-200 transition-all"
                />
             </div>
             <button className="p-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-all">
                <Filter className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="flex items-center gap-1 mb-8 bg-gray-50/50 p-1 rounded-[24px] border border-gray-100/50">
          <ModernTab 
            label="Suggestions" 
            count={suggestions.length}
            active={activeTab === 'suggestions'} 
            onClick={() => setActiveTab('suggestions')} 
          />
          <ModernTab 
            label="Requests" 
            count={requests.length}
            active={activeTab === 'requests'} 
            onClick={() => setActiveTab('requests')} 
          />
          <ModernTab 
            label="Following" 
            count={connections.length}
            active={activeTab === 'my-connections'} 
            onClick={() => setActiveTab('my-connections')} 
          />
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Updating Network...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {filteredData().length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState 
                      activeTab={activeTab} 
                      onAction={() => window.location.href = '/map'} 
                    />
                  </div>
                ) : (
                  filteredData().map((item: any, idx: number) => (
                    <div key={item.id || item.user_id || item.requester_id || `item-${idx}`} className="w-full">
                      {activeTab === 'suggestions' && (
                        <SuggestionCard 
                          user={item} 
                          onConnect={() => handleRequest(item.id, 'send')}
                          onView={() => onUserSelect?.(item.id)}
                        />
                      )}
                      {activeTab === 'requests' && (
                        <RequestCard 
                          user={item} 
                          onAccept={() => handleRequest(item.user_id || item.requester_id, 'accept')}
                          onReject={() => handleRequest(item.user_id || item.requester_id, 'decline')}
                          onView={() => onUserSelect?.(item.user_id || item.requester_id)}
                        />
                      )}
                      {activeTab === 'my-connections' && (
                        <FollowingCard 
                          user={item} 
                          onMessage={() => onMessage?.(item.id)}
                          onRemove={() => handleRequest(item.id, 'remove')}
                          onView={() => onUserSelect?.(item.id)}
                        />
                      )}
                    </div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

const ModernTab = ({ label, count, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden ${active ? 'bg-white shadow-sm border border-gray-100 shadow-gray-200/50' : 'hover:bg-white/50 text-gray-400 font-bold'}`}
  >
    <span className={`text-sm font-black uppercase tracking-tight ${active ? 'text-gray-900 italic' : 'text-gray-400'}`}>
        {label}
    </span>
    {count > 0 && (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${active ? 'bg-gradient-to-tr from-pink-500 to-purple-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
        {count}
      </span>
    )}
    {active && (
      <motion.div 
        layoutId="activeTabUnderline"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500"
      />
    )}
  </button>
);

const SuggestionCard = ({ user, onConnect, onView }: any) => {
  // Extract interests from bio (e.g., #sports #tech)
  const interests = (user.bio || '').match(/#[a-z0-9_]+/gi) || ['#Nearby', '#Newcomer'];
  const distance = user.distance_km ? `${user.distance_km.toFixed(1)} km away` : 'Nearby';

  return (
    <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start gap-4 mb-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-pink-100 to-purple-100 p-0.5">
            <div className="w-full h-full rounded-[20px] bg-white overflow-hidden flex items-center justify-center">
              {user.avatar_url && typeof user.avatar_url === 'string' ? (
                <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:8080${user.avatar_url}`} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-xl font-black text-pink-500 uppercase">{user.username?.charAt(0)}</span>
              )}
            </div>
          </div>
          {/* Online badge mockup */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-gray-900 leading-tight truncate">@{user.username}</h3>
          <p className="text-[11px] font-bold text-gray-400 mt-0.5 truncate">{user.full_name}</p>
          <div className="flex items-center gap-1.5 mt-2 bg-gray-50 inline-flex px-2 py-1 rounded-lg">
            <MapPin className="w-3 h-3 text-pink-500" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{distance}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6 min-h-[24px]">
        {interests.slice(0, 3).map((tag: string, i: number) => (
          <span key={i} className="text-[9px] font-black uppercase text-purple-500 bg-purple-50 px-2 py-1 rounded-full tracking-wide">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onConnect}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-pink-500/20 active:scale-95 transition-all"
        >
          Connect
        </button>
        <button 
          onClick={onView}
          className="p-2.5 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

const RequestCard = ({ user, onAccept, onReject, onView }: any) => (
  <div className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
    <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden shrink-0 cursor-pointer" onClick={onView}>
      {user.avatar_url && typeof user.avatar_url === 'string' ? (
          <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:8080${user.avatar_url}`} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-black text-gray-400 uppercase">{user.username?.charAt(0)}</div>
        )}
    </div>
    <div className="flex-1 min-w-0 cursor-pointer" onClick={onView}>
      <h4 className="font-bold text-gray-900 leading-tight">@{user.username}</h4>
      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 leading-none">Sent a request</p>
    </div>
    <div className="flex items-center gap-2">
      <button 
        onClick={onAccept}
        className="w-9 h-9 flex items-center justify-center bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/10 hover:bg-green-600 transition-all active:scale-90"
      >
        <UserCheck className="w-4 h-4" />
      </button>
      <button 
        onClick={onReject}
        className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const FollowingCard = ({ user, onMessage, onRemove, onView }: any) => (
  <div className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
    <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden shrink-0 cursor-pointer" onClick={onView}>
        {user.avatar_url && typeof user.avatar_url === 'string' ? (
          <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:8080${user.avatar_url}`} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-black text-gray-400 uppercase">{user.username?.charAt(0)}</div>
        )}
    </div>
    <div className="flex-1 min-w-0 cursor-pointer" onClick={onView}>
      <h4 className="font-bold text-gray-900 leading-tight">@{user.username}</h4>
      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 truncate">{user.full_name}</p>
    </div>
    <div className="flex items-center gap-2">
      <button 
        onClick={onMessage}
        className="p-2.5 bg-gray-50 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all"
      >
        <MessageSquare className="w-4 h-4" />
      </button>
      <button 
        onClick={onRemove}
        className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
      >
        <UserMinus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const EmptyState = ({ activeTab, onAction }: any) => {
  const configs: any = {
    suggestions: {
      title: "No people nearby",
      desc: "It seems like everyone is hiding! Why don't you explore the map and see where the crowd is?",
      cta: "Explore Map",
      icon: <MapPin className="w-12 h-12 text-pink-300" />
    },
    requests: {
      title: "Clean Slate",
      desc: "All requests handled. You're completely caught up for now!",
      cta: "Discover People",
      icon: <UserPlus className="w-12 h-12 text-purple-300" />
    },
    'my-connections': {
      title: "Lone Wolf?",
      desc: "You haven't followed any real accounts yet. Let's start building your community!",
      cta: "Find Friends",
      icon: <Users className="w-12 h-12 text-gray-300" />
    }
  };

  const config = configs[activeTab] || configs.suggestions;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-10 bg-gray-50/50 border border-dashed border-gray-200 rounded-[40px] text-center">
      <div className="mb-6 p-6 bg-white rounded-[32px] shadow-sm">
        {config.icon}
      </div>
      <h3 className="text-xl font-black text-gray-900 mb-2 italic">
        {config.title}
      </h3>
      <p className="text-sm font-bold text-gray-400 max-w-[280px] leading-relaxed mb-8">
        {config.desc}
      </p>
      <button 
        onClick={onAction}
        className="group flex items-center gap-3 px-8 py-3 bg-gray-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/20"
      >
        <span>{config.cta}</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default ConnectionsView;
