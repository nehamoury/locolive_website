import React, { useState, useEffect, type FC } from 'react';
import { Heart, UserPlus, MapPin, Bell, Eye, MessageCircle, ThumbsUp } from 'lucide-react';
import api from '../../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  type: string;
  message: string;
  content?: string;
  actor_username?: string;
  actor_full_name?: string;
  actor_avatar_url?: string;
  related_user_id?: any;
  is_read: boolean;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const getTypeConfig = (type: string): { emoji: string; color: string; bg: string; icon: React.ReactNode } => {
  switch (type) {
    case 'like':
    case 'post_like':
      return { emoji: '👍', color: 'text-blue-500', bg: 'bg-blue-50', icon: <ThumbsUp className="w-4 h-4 text-blue-500" /> };
    case 'story_reaction':
    case 'reaction':
      return { emoji: '❤️', color: 'text-red-500', bg: 'bg-red-50', icon: <Heart className="w-4 h-4 text-red-500" /> };
    case 'follow':
    case 'connection_request':
      return { emoji: '👤', color: 'text-purple-500', bg: 'bg-purple-50', icon: <UserPlus className="w-4 h-4 text-purple-500" /> };
    case 'connection_accepted':
      return { emoji: '🤝', color: 'text-green-600', bg: 'bg-green-50', icon: <UserPlus className="w-4 h-4 text-green-600" /> };
    case 'crossing':
    case 'nearby':
      return { emoji: '📍', color: 'text-pink-500', bg: 'bg-pink-50', icon: <MapPin className="w-4 h-4 text-pink-500" /> };
    case 'story_view':
      return { emoji: '👁️', color: 'text-indigo-500', bg: 'bg-indigo-50', icon: <Eye className="w-4 h-4 text-indigo-500" /> };
    case 'comment':
      return { emoji: '💬', color: 'text-amber-600', bg: 'bg-amber-50', icon: <MessageCircle className="w-4 h-4 text-amber-600" /> };
    default:
      return { emoji: '🔔', color: 'text-gray-400', bg: 'bg-gray-50', icon: <Bell className="w-4 h-4 text-gray-400" /> };
  }
};

// Parse rich message: bold parts wrapped in ** or actor names
const parseMessage = (notif: Notification): React.ReactNode => {
  const raw = notif.message || notif.content || '';
  // Split on actor name if present to bold it
  const actor = notif.actor_full_name || notif.actor_username;
  if (actor && raw.includes(actor)) {
    const parts = raw.split(actor);
    return (
      <>
        <span className="font-black text-gray-900">{actor}</span>
        {parts.slice(1).join(actor)}
      </>
    );
  }
  return raw;
};

// ─── Notification Card ────────────────────────────────────────────────────────

const NotifCard = ({
  notif,
  onRead,
}: {
  notif: Notification;
  onRead: (id: string) => void;
}) => {
  const cfg = getTypeConfig(notif.type);
  const initial = (notif.actor_full_name || notif.actor_username || '?').charAt(0).toUpperCase();

  return (
    <div
      onClick={() => !notif.is_read && onRead(notif.id)}
      className={`flex items-start gap-3.5 px-5 py-4 transition-all group relative
        ${!notif.is_read
          ? 'bg-pink-50/60 border-l-4 border-pink-400 hover:bg-pink-50 cursor-pointer'
          : 'bg-white border-l-4 border-transparent hover:bg-gray-50'
        }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center font-black text-white text-base
          ${!notif.actor_avatar_url ? 'bg-gradient-to-br from-pink-400 to-purple-600' : ''}`}
        >
          {notif.actor_avatar_url ? (
            <img
              src={notif.actor_avatar_url.startsWith('http') ? notif.actor_avatar_url : `http://localhost:8080${notif.actor_avatar_url}`}
              alt={notif.actor_full_name || '?'}
              className="w-full h-full object-cover"
            />
          ) : initial}
        </div>
        {/* Type badge */}
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${cfg.bg} border-2 border-white flex items-center justify-center text-[10px]`}>
          {cfg.emoji}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <p className="text-sm text-gray-600 leading-snug">
          {parseMessage(notif)}
        </p>
        <p className="text-[11px] text-gray-400 mt-1 font-medium">{timeAgo(notif.created_at)}</p>
        
        {/* Inline Actions for Connection Requests */}
        {notif.type === 'connection_request' && notif.related_user_id && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const reqId = typeof notif.related_user_id === 'string' ? notif.related_user_id : notif.related_user_id?.UUID;
                if (!reqId) return;
                api.post('/connections/update', { requester_id: reqId, status: 'accepted' })
                  .then(() => onRead(notif.id)) // Mark as read or visually update
                  .catch(err => console.error('Failed to accept:', err));
              }}
              className="px-4 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-bold transition-all shadow-sm shadow-pink-200 active:scale-95"
            >
              Accept
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const reqId = typeof notif.related_user_id === 'string' ? notif.related_user_id : notif.related_user_id?.UUID;
                if (!reqId) return;
                api.post('/connections/update', { requester_id: reqId, status: 'blocked' })
                  .then(() => onRead(notif.id)) // Mark as read or visually update
                  .catch(err => console.error('Failed to decline:', err));
              }}
              className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-xs font-bold transition-all active:scale-95"
            >
              Decline
            </button>
          </div>
        )}
      </div>

      {/* Unread dot */}
      {!notif.is_read && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 shrink-0 w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
      )}
    </div>
  );
};

// ─── Main View ────────────────────────────────────────────────────────────────

interface NotificationsViewProps {
  onUserSelect?: (userId: string) => void;
}

const NotificationsView: FC<NotificationsViewProps> = ({ onUserSelect }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

  const markRead = async (id: string, relatedUserId?: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      
      // If it's a social notification, navigate to profile
      if (relatedUserId && onUserSelect) {
        onUserSelect(relatedUserId);
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="h-full bg-white overflow-y-auto no-scrollbar pb-24 md:pb-0">

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-black text-gray-900 italic tracking-tight uppercase leading-none">System Alerts</h1>
          {unreadCount > 0 && (
            <span className="min-w-[20px] h-5 bg-pink-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1.5">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-pink-500 transition-all"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex flex-col gap-0">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex items-start gap-3.5 px-5 py-4 animate-pulse border-b border-gray-50">
              <div className="w-11 h-11 rounded-full bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3.5 bg-gray-100 rounded-lg w-3/4" />
                <div className="h-3 bg-gray-100 rounded-lg w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center px-8">
          <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center mb-4">
            <Bell className="w-7 h-7 text-black/10" />
          </div>
          <h3 className="text-sm font-black text-gray-400 uppercase italic tracking-widest">No alerts found</h3>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {notifications.map(notif => (
            <NotifCard 
              key={notif.id} 
              notif={notif} 
              onRead={(id) => {
                const actorId = typeof notif.related_user_id === 'string' 
                    ? notif.related_user_id 
                    : notif.related_user_id?.UUID;
                markRead(id, actorId);
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsView;
