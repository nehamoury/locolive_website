import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const playAlertSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

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
             // Handled by useChat usually, but we update unread badge here
             fetchUnreadCount();
             return;
          }

          if (data.type === 'crossing_detected' || data.type === 'nearby_story') {
            const notif = data.payload;
            
            // Show Toast
            toast(notif.message, {
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
      if (socketRef.current) {
        // Only close if it's not already closing or closed
        if (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) {
          socketRef.current.close();
        }
      }
    };
  }, [fetchUnreadCount, playAlertSound]);

  return {
    unreadCount,
    notifications,
    refreshUnread: fetchUnreadCount
  };
};
