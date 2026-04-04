import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { calculateDistance } from '../utils/geo';

/**
 * Custom hook to track user location and securely send it to the backend.
 * Optimized with distance-based thresholding (50m) and time-based debouncing (60s).
 */
export const useGeolocation = (enabled: boolean = true) => {
  const [error, setError] = useState<string | null>(null);
  const [isGhostMode, setIsGhostMode] = useState<boolean>(false);
  
  // Track the last time and coordinates of the successful ping
  const lastPingTimeRef = useRef<number>(0);
  const lastSentCoordsRef = useRef<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    const handleSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const now = Date.now();
      
      // Calculate distance from last sent position
      let shouldPing = false;
      if (!lastSentCoordsRef.current) {
        shouldPing = true; // First ping always allowed
      } else {
        const distance = calculateDistance(
          lastSentCoordsRef.current.lat, 
          lastSentCoordsRef.current.lng, 
          latitude, 
          longitude
        );
        
        // Throttling logic: 
        // 1. If moved > 50 meters (significant movement)
        // 2. OR if > 60 seconds have passed (to keep "Active Now" alive)
        if (distance > 50 || (now - lastPingTimeRef.current > 60000)) {
          shouldPing = true;
        }
      }

      if (!shouldPing) return;

      try {
        const payload = { latitude, longitude };
        const response = await api.post('/location/ping', payload);
        
        // Handle Ghost Mode response silently
        if (response.data?.status === 'ghost') {
          setIsGhostMode(true);
        } else {
          setIsGhostMode(false);
          // Only update refs on successful update
          lastPingTimeRef.current = Date.now();
          lastSentCoordsRef.current = { lat: latitude, lng: longitude };
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
