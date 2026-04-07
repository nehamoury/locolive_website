import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useSound } from '../context/SoundContext';

const CROSSING_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
const WS_RECONNECT_BASE_MS = 3000;
const WS_RECONNECT_MAX_MS = 30000;
const UNREAD_POLL_INTERVAL = 30000; // Poll unread counts every 30s as fallback

interface Notification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const socketRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const seenNotifIds = useRef<Set<string>>(new Set());
  const reconnectAttemptRef = useRef(0);
  const { alertsEnabled, toggleAlerts } = useSound();

  useEffect(() => {
    audioRef.current = new Audio(CROSSING_SOUND_URL);
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error('[Notifications] Failed to fetch unread count:', err);
    }
  }, []);

  const fetchUnreadMessagesCount = useCallback(async () => {
    try {
      const res = await api.get('/messages/unread-count');
      setUnreadMessagesCount(res.data.unread_count || 0);
    } catch (err) {
      console.error('[Notifications] Failed to fetch unread messages count:', err);
    }
  }, []);

  const playAlertSound = useCallback(() => {
    if (alertsEnabled && audioRef.current) {
      audioRef.current.play().catch(e => {
        console.log('[Notifications] Audio play failed:', e);
        if (e.name === 'NotAllowedError') {
          toast.error('Enable sound in settings', { id: 'audio-blocked' });
        }
      });
    }
  }, [alertsEnabled]);

  const toggleAudio = useCallback(() => {
    toggleAlerts();
    if (!alertsEnabled) {
      toast.success('Audio alerts enabled!', { id: 'audio-toggle' });
    } else {
      toast.success('Audio alerts disabled', { id: 'audio-toggle' });
    }
  }, [alertsEnabled, toggleAlerts]);

  // Initial fetch
  useEffect(() => {
    fetchUnreadCount();
    fetchUnreadMessagesCount();
  }, [fetchUnreadCount, fetchUnreadMessagesCount]);

  // Periodic polling fallback for unread counts
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchUnreadCount();
      fetchUnreadMessagesCount();
    }, UNREAD_POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchUnreadCount, fetchUnreadMessagesCount]);

  // WebSocket connection with exponential backoff
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const wsBaseUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    const wsUrl = `${wsBaseUrl}/ws/chat?token=${encodeURIComponent(token)}`;

    let isSubscribed = true;
    let reconnectTimeout: any = null;

    const connect = () => {
      if (!isSubscribed) return;

      setWsStatus('connecting');
      console.log('[WS] Connecting...');
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
        reconnectAttemptRef.current = 0; // Reset backoff on success
        console.log('[WS] Connected successfully');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WS] Event received:', data.type, data);

          // ── Handle new_message ──────────────────────────────────
          if (data.type === 'new_message') {
            fetchUnreadMessagesCount();

            let isMe = false;
            try {
              if (token) {
                const payloadStr = atob(token.split('.')[1]);
                const jwtPayload = JSON.parse(payloadStr);
                if (jwtPayload.user_id === data.sender_id) {
                  isMe = true;
                }
              }
            } catch (e) {
              console.error('[WS] Failed to decode token for sender check', e);
            }

            if (isMe) return;

            playAlertSound();
            toast(`New message received! 💬`, {
              duration: 3000,
              style: {
                borderRadius: '20px',
                background: '#FFF',
                color: '#333',
                fontWeight: 'bold',
                border: '1px solid #E5E7EB',
              },
            });
            return;
          }

          // ── Handle nearby_user_update ───────────────────────────
          if (data.type === 'nearby_user_update') {
            const payload = data.payload;
            console.log('[WS] Nearby user update:', payload?.username, `${payload?.distance?.toFixed(2)}km`);

            // Dispatch custom event for MapPage to react
            window.dispatchEvent(new CustomEvent('nearby_user_update', { detail: payload }));
            return;
          }

          // ── Handle user_left_radius ────────────────────────────
          if (data.type === 'user_left_radius') {
            const payload = data.payload;
            console.log('[WS] User left radius:', payload?.user_id);

            window.dispatchEvent(new CustomEvent('user_left_radius', { detail: payload }));
            return;
          }

          // ── Handle crossing_detected ───────────────────────────
          if (data.type === 'crossing_detected') {
            const notif = data.payload;
            console.log('[WS] Crossing detected:', notif?.message);

            const notifId = notif?.id || notif?.message;
            if (notifId && seenNotifIds.current.has(notifId)) return;
            if (notifId) seenNotifIds.current.add(notifId);
            if (seenNotifIds.current.size > 50) seenNotifIds.current.clear();

            toast(notif.message, {
              id: notifId,
              icon: '📍',
              duration: 5000,
              style: {
                borderRadius: '20px',
                background: '#FFF',
                color: '#333',
                fontWeight: 'bold',
                border: '1px solid #FBCFE8',
              },
            });

            playAlertSound();
            setUnreadCount(prev => prev + 1);
            setNotifications(prev => [notif, ...prev]);

            // Dispatch for MapPage
            window.dispatchEvent(new CustomEvent('crossing_detected', { detail: notif }));
            return;
          }

          // ── Handle nearby_story ────────────────────────────────
          if (data.type === 'nearby_story') {
            const notif = data.payload;
            const notifId = notif?.id || notif?.message;
            if (notifId && seenNotifIds.current.has(notifId)) return;
            if (notifId) seenNotifIds.current.add(notifId);
            if (seenNotifIds.current.size > 50) seenNotifIds.current.clear();

            toast(notif.message, {
              id: notifId,
              icon: '✨',
              duration: 5000,
              style: {
                borderRadius: '20px',
                background: '#FFF',
                color: '#333',
                fontWeight: 'bold',
                border: '1px solid #FBCFE8',
              },
            });

            setUnreadCount(prev => prev + 1);
            setNotifications(prev => [notif, ...prev]);
            return;
          }

          // ── Handle connection_accepted ─────────────────────────
          if (data.type === 'connection_accepted') {
            const payload = data.payload;
            const notifId = `conn-acc-${payload.id || Date.now()}`;
            
            if (seenNotifIds.current.has(notifId)) return;
            seenNotifIds.current.add(notifId);

            toast.success(`You are now connected! 🤝`, {
              id: notifId,
              duration: 5000,
              style: {
                borderRadius: '20px',
                background: '#FFF',
                color: '#333',
                fontWeight: 'bold',
                border: '1px solid #FBCFE8',
              },
            });
            window.dispatchEvent(new CustomEvent('connection_accepted', { detail: payload }));
            return;
          }
        } catch (err) {
          console.error('[WS] Failed to parse message:', err);
        }
      };

      ws.onclose = () => {
        setWsStatus('disconnected');
        if (!isSubscribed) return;

        const attempt = reconnectAttemptRef.current;
        const delay = Math.min(WS_RECONNECT_BASE_MS * Math.pow(2, attempt), WS_RECONNECT_MAX_MS);
        reconnectAttemptRef.current = attempt + 1;

        console.log(`[WS] Disconnected. Reconnecting in ${delay}ms (attempt ${attempt + 1})...`);
        reconnectTimeout = setTimeout(connect, delay);
      };

      ws.onerror = (err) => {
        console.error('[WS] Error:', err);
        ws.close();
      };
    };

    connect();

    return () => {
      isSubscribed = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);

      const socket = socketRef.current;
      if (socket) {
        try {
          if (socket.readyState === WebSocket.OPEN) {
            socket.close();
          }
        } catch (err) {
          console.warn('[WS] Silent cleanup error:', err);
        }
        socketRef.current = null;
      }
    };
  }, [fetchUnreadCount, fetchUnreadMessagesCount, playAlertSound]);

  return {
    unreadCount,
    unreadMessagesCount,
    notifications,
    wsStatus,
    audioEnabled: alertsEnabled,
    toggleAudio,
    refreshUnread: () => {
      fetchUnreadCount();
      fetchUnreadMessagesCount();
    }
  };
};