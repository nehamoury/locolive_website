import React, { useState, useEffect, type FC } from 'react';
import { Heart, UserPlus, MapPin, Bell, Check, Eye, MessageCircle, ThumbsUp } from 'lucide-react';
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
  is_read: boolean;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}h ago`;
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
      className={`flex items-start gap-3.5 px-5 py-4 transition-all cursor-pointer group
        ${!notif.is_read
          ? 'bg-pink-50/60 border-l-4 border-pink-400 hover:bg-pink-50'
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
              alt={notif.actor_full_name}
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
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-600 leading-snug">
          {parseMessage(notif)}
        </p>
        <p className="text-[11px] text-gray-400 mt-1 font-medium">{timeAgo(notif.created_at)}</p>
      </div>

      {/* Unread dot */}
      {!notif.is_read && (
        <div className="shrink-0 w-2 h-2 rounded-full bg-pink-500 mt-1.5" />
      )}
    </div>
  );
};

// ─── Main View ────────────────────────────────────────────────────────────────

const NotificationsView: FC = () => {
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

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
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
          <h1 className="text-xl font-black text-gray-900 italic tracking-tight">Alerts</h1>
          {unreadCount > 0 && (
            <span className="min-w-[20px] h-5 bg-gradient-to-br from-pink-500 to-purple-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1.5">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            Mark all read
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
          <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-7 h-7 text-pink-400" />
          </div>
          <h3 className="text-base font-black text-gray-700 italic mb-1">All caught up!</h3>
          <p className="text-xs text-gray-400 max-w-[220px]">
            No notifications yet. Start exploring to see activity from people nearby.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {notifications.map(notif => (
            <NotifCard key={notif.id} notif={notif} onRead={markRead} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsView;
