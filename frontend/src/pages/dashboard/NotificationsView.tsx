import { useState, useEffect, type FC } from 'react';
import { Heart, UserPlus, Star, MapPin, Bell, Check } from 'lucide-react';
import api from '../../services/api';

const getIcon = (type: string) => {
  switch(type) {
    case 'like': case 'story_reaction': return <Heart className="w-4 h-4 text-red-400" />;
    case 'follow': case 'connection_request': case 'connection_accepted': return <UserPlus className="w-4 h-4 text-blue-400" />;
    case 'mention': case 'story_share': return <Star className="w-4 h-4 text-yellow-400" />;
    case 'nearby': case 'crossing': return <MapPin className="w-4 h-4 text-green-400" />;
    default: return <Bell className="w-4 h-4 text-purple-400" />;
  }
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationsView: FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data || []);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const unread = notifications.filter(n => !n.is_read);
  const read = notifications.filter(n => n.is_read);

  return (
    <div className="h-full bg-black text-white overflow-y-auto no-scrollbar pb-24 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-8">
        
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold tracking-tight">Notifications</h1>
          {unread.length > 0 && (
            <button 
              onClick={markAllRead}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center opacity-40">
            <Bell className="w-14 h-14 mb-4" />
            <p className="text-sm font-medium max-w-[200px]">No notifications yet. Start exploring to get activity!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {unread.length > 0 && (
              <>
                <h2 className="text-xs font-semibold text-gray-500/80 uppercase tracking-widest mb-3">New</h2>
                {unread.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => markRead(notif.id)}
                    className="flex items-center p-3.5 bg-purple-500/5 rounded-2xl border border-purple-500/10 hover:bg-purple-500/10 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-3 shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs leading-tight">{notif.message || notif.content}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{timeAgo(notif.created_at)}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0 ml-2" />
                  </div>
                ))}
              </>
            )}

            {read.length > 0 && (
              <>
                <h2 className="text-xs font-semibold text-gray-500/80 uppercase tracking-widest mt-6 mb-3">Earlier</h2>
                {read.map((notif) => (
                  <div 
                    key={notif.id} 
                    className="flex items-center p-3.5 bg-white/[0.02] rounded-2xl hover:bg-white/5 transition-colors cursor-pointer opacity-60"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mr-3 shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs leading-tight">{notif.message || notif.content}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{timeAgo(notif.created_at)}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
