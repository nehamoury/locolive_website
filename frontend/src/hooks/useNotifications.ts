import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useSound } from '../context/SoundContext';

// Sound URL - Simplified approach using a public ping sound
const CROSSING_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

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
  const socketRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const seenNotifIds = useRef<Set<string>>(new Set()); // Dedup guard
  const { alertsEnabled, toggleAlerts } = useSound();

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(CROSSING_SOUND_URL);
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  const fetchUnreadMessagesCount = useCallback(async () => {
    try {
      const res = await api.get('/messages/unread-count');
      setUnreadMessagesCount(res.data.unread_count || 0);
    } catch (err) {
      console.error('Failed to fetch unread messages count:', err);
    }
  }, []);

  const playAlertSound = useCallback(() => {
    if (alertsEnabled && audioRef.current) {
      audioRef.current.play().catch(e => {
        console.log('Audio play failed:', e);
        if (e.name === 'NotAllowedError') {
           // If blocked, we might need a user gesture to retry
           toast.error('Enable sound in settings', { id: 'audio-blocked' });
        }
      });
    }
  }, [alertsEnabled]);

  const toggleAudio = useCallback(() => {
    toggleAlerts();
    if (!alertsEnabled) {
      // About to enable
       toast.success('Audio alerts enabled!', { id: 'audio-toggle' });
    } else {
       toast.success('Audio alerts disabled', { id: 'audio-toggle' });
    }
  }, [alertsEnabled, toggleAlerts]);

  useEffect(() => {
    fetchUnreadCount();
    fetchUnreadMessagesCount();
  }, [fetchUnreadCount, fetchUnreadMessagesCount]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const wsBaseUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    const wsUrl = `${wsBaseUrl}/ws/chat?token=${encodeURIComponent(token)}`; // Reusing the global hub endpoint
    
    let isSubscribed = true;
    let reconnectTimeout: any = null;

    const connect = () => {
      if (!isSubscribed) return;

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Real-time Alert:', data);

          if (data.type === 'new_message') {
             fetchUnreadMessagesCount();

             // Extract user ID from token to check if we are the sender
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
                console.error("Failed to decode token for sender check", e);
             }

             if (isMe) {
               return; // Do not play sound or show toast for our own messages
             }

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

          if (data.type === 'crossing_detected' || data.type === 'nearby_story') {
            const notif = data.payload;

            // --- Dedup Guard: skip if we've shown this notification before ---
            const notifId = notif?.id || notif?.message;
            if (notifId && seenNotifIds.current.has(notifId)) return;
            if (notifId) seenNotifIds.current.add(notifId);
            // Keep set size bounded
            if (seenNotifIds.current.size > 50) seenNotifIds.current.clear();
            // -------------------------------------------------------------------

            // Show Toast
            toast(notif.message, {
              id: notifId, // react-hot-toast also deduplicates by id
              icon: data.type === 'crossing_detected' ? '📍' : '✨',
              duration: 5000,
              style: {
                borderRadius: '20px',
                background: '#FFF',
                color: '#333',
                fontWeight: 'bold',
                border: '1px solid #FBCFE8',
              },
            });

            // Play sound for crossings
            if (data.type === 'crossing_detected') {
              playAlertSound();
            }

            // Update state
            setUnreadCount(prev => prev + 1);
            setNotifications(prev => [notif, ...prev]);
          }

          if (data.type === 'connection_accepted') {
            const payload = data.payload;
            toast.success(`You are now connected! 🤝`, {
              duration: 5000,
              style: {
                borderRadius: '20px',
                background: '#FFF',
                color: '#333',
                fontWeight: 'bold',
                border: '1px solid #FBCFE8',
              },
            });
            // Trigger a refresh event for components to listen to
            window.dispatchEvent(new CustomEvent('connection_accepted', { detail: payload }));
          }
        } catch (err) {
          console.error('Failed to parse WS message:', err);
        }
      };

      ws.onclose = () => {
        if (!isSubscribed) return;
        console.log('Alert WS closed, reconnecting in 5s...');
        reconnectTimeout = setTimeout(connect, 5000);
      };

      ws.onerror = (err) => {
        console.error('Alert WS error:', err);
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
          // Check if we can safely close
          if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
            // Nullify handlers before closing to prevent unwanted reconnects during unmount
            socket.onclose = null;
            socket.onerror = null;
            socket.onmessage = null;
            socket.close();
          }
        } catch (err) {
          console.warn('Silent WS cleanup error:', err);
        }
        socketRef.current = null;
      }
    };
  }, [fetchUnreadCount, playAlertSound]);

  return {
    unreadCount,
    unreadMessagesCount,
    notifications,
    audioEnabled: alertsEnabled,
    toggleAudio,
    refreshUnread: () => {
      fetchUnreadCount();
      fetchUnreadMessagesCount();
    }
  };
};
