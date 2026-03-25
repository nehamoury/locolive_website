import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

/**
 * Custom hook to track user location and securely send it to the backend every 10 seconds.
 */
export const useGeolocation = (enabled: boolean = true) => {
  const [error, setError] = useState<string | null>(null);
  const [isGhostMode, setIsGhostMode] = useState<boolean>(false);
  
  // Track the last time we successfully sent a ping to debounce API calls
  const lastPingTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    const handleSuccess = async (position: GeolocationPosition) => {
      const now = Date.now();
      // Throttle pings to exactly once every 10 seconds to save battery and network
      if (now - lastPingTimeRef.current < 10000) {
        return; 
      }

      try {
        const payload = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        const response = await api.post('/location/ping', payload);
        
        // Handle Ghost Mode response silently
        if (response.data?.status === 'ghost') {
          setIsGhostMode(true);
        } else {
          setIsGhostMode(false);
          lastPingTimeRef.current = Date.now();
        }
      } catch (err: any) {
        // Only log backend errors if they aren't standard 401 unauths
        if (err.response?.status !== 401) {
          console.error('[LocoLive Geolocation] Failed to ping server:', err);
        }
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      setError(error.message);
      console.error('[LocoLive Geolocation] GPS Error:', error);
    };

    // Configure watch options for best battery vs accuracy tradeoff
    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000 // Cache location for 5s
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [enabled]);

  return { error, isGhostMode };
};
