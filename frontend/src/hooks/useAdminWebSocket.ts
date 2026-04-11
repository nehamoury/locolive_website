import { useEffect, useRef } from 'react';
import { useAdminStore } from '../stores/adminStore';
import type { LiveActivity } from '../types/admin';

export const useAdminWebSocket = () => {
  const { addActivity } = useAdminStore();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname === 'localhost' ? 'localhost:8080' : `${window.location.hostname}:8080`;
    const socket = new WebSocket(`${protocol}//${host}/ws/activity`);

    socket.onopen = () => {
      console.log('Admin Activity WebSocket Connected');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'activity') {
          addActivity(data.payload as LiveActivity);
        }
      } catch (err) {
        console.error('Failed to parse admin activity:', err);
      }
    };

    socket.onclose = () => {
      console.log('Admin Activity WebSocket Disconnected');
    };

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [addActivity]);

  return socketRef.current;
};
