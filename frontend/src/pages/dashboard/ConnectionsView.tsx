import { useState, useEffect, type FC } from 'react';
import { UserPlus, UserCheck, X, Search, Users, MessageSquare } from 'lucide-react';
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (activeTab === 'suggestions') await fetchSuggestions();
      else if (activeTab === 'requests') await fetchRequests();
      else if (activeTab === 'my-connections') await fetchConnections();
      setLoading(false);
    };
    loadData();
  }, [activeTab]);

  const handleRequest = async (userId: string, action: 'send' | 'accept' | 'decline') => {
    try {
      if (action === 'send') {
        await api.post('/connections/request', { target_user_id: userId });
        setSuggestions(prev => prev.filter(s => s.id !== userId));
      } else if (action === 'accept') {
        await api.post('/connections/update', { requester_id: userId, status: 'accepted' });
        setRequests(prev => prev.filter(r => (r.user_id || r.requester_id) !== userId));
      } else if (action === 'decline') {
        await api.post('/connections/update', { requester_id: userId, status: 'blocked' });
        setRequests(prev => prev.filter(r => (r.user_id || r.requester_id) !== userId));
      }
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
    }
  };

  return (
    <div className="h-full bg-[#f9e8ff] text-black overflow-y-auto no-scrollbar pb-24 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6 tracking-tight">Connections</h1>

        {/* Tabs */}
        <div className="flex border-b border-primary/10 mb-6 sticky top-0 bg-[#f9e8ff] z-10 pt-2">
          <TabItem label="Suggestions" active={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')} />
          <TabItem label="Requests" active={activeTab === 'requests'} badge={requests.length > 0 ? requests.length : undefined} onClick={() => setActiveTab('requests')} />
          <TabItem label="Following" active={activeTab === 'my-connections'} onClick={() => setActiveTab('my-connections')} />
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {activeTab === 'suggestions' && suggestions.length === 0 && (
              <EmptyState icon={<Search className="w-10 h-10" />} text="No suggestions yet. Explore the map to find people!" />
            )}
            {activeTab === 'requests' && requests.length === 0 && (
              <EmptyState icon={<UserPlus className="w-10 h-10" />} text="No pending requests. You're all caught up!" />
            )}
            {activeTab === 'my-connections' && connections.length === 0 && (
              <EmptyState icon={<Users className="w-10 h-10" />} text="You haven't followed anyone yet. Start discovering!" />
            )}

            {activeTab === 'suggestions' && suggestions.map(user => (
              <UserCard 
                key={user.id} 
                user={user} 
                actionLabel="Follow" 
                onAction={() => handleRequest(user.id, 'send')} 
                icon={<UserPlus className="w-4 h-4" />}
                onUserClick={() => onUserSelect?.(user.id)}
              />
            ))}

            {activeTab === 'requests' && requests.map(req => (
              <div key={req.user_id} className="flex items-center p-3 bg-primary/5 rounded-xl border border-primary/10 hover:bg-primary/10 transition-all">
                <div 
                  onClick={() => onUserSelect?.(req.user_id || req.requester_id)}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-sm mr-3 text-white cursor-pointer"
                >
                  {req.username?.charAt(0).toUpperCase()}
                </div>
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => onUserSelect?.(req.user_id || req.requester_id)}
                >
                  <p className="font-bold text-sm text-black">@{req.username}</p>
                  <p className="text-[10px] text-black/40 capitalize">{req.full_name}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleRequest(req.user_id || req.requester_id, 'accept')}
                    className="p-1.5 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleRequest(req.user_id || req.requester_id, 'decline')}
                    className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'my-connections' && connections.map(conn => (
              <UserCard 
                key={conn.id} 
                user={conn} 
                actionLabel="Message" 
                activeAction={false}
                onAction={() => onMessage?.(conn.id)} 
                icon={<MessageSquare className="w-4 h-4" />}
                onUserClick={() => onUserSelect?.(conn.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TabItem = ({ label, active, badge, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-3 text-sm font-semibold relative transition-all ${active ? 'text-black' : 'text-black/60 hover:text-black'}`}
  >
    {label}
    {badge && (
      <span className="ml-1 px-1.5 py-0.5 bg-accent text-[8px] text-white rounded-full align-top">
        {badge}
      </span>
    )}
    {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
  </button>
);

const UserCard = ({ user, actionLabel, onAction, icon, activeAction, onUserClick }: any) => (
  <div className="flex items-center p-3 bg-primary/5 rounded-xl border border-primary/10 hover:bg-primary/10 transition-all">
    <div 
      onClick={onUserClick}
      className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-sm mr-3 text-white cursor-pointer"
    >
      {user.username?.charAt(0).toUpperCase()}
    </div>
    <div className="flex-1 cursor-pointer" onClick={onUserClick}>
      <p className="font-bold text-sm text-black">@{user.username}</p>
      <p className="text-[10px] text-black/40">{user.full_name}</p>
    </div>
    <button 
      onClick={onAction}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${activeAction ? 'bg-primary/10 text-primary cursor-default' : 'bg-primary text-white hover:opacity-90'}`}
    >
      {icon}
      <span>{actionLabel}</span>
    </button>
  </div>
);

const EmptyState = ({ icon, text }: any) => (
  <div className="flex flex-col items-center justify-center p-12 text-center opacity-40">
    <div className="mb-4">{icon}</div>
    <p className="text-sm font-medium max-w-[200px]">{text}</p>
  </div>
);

export default ConnectionsView;
