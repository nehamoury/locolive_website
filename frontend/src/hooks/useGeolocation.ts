import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { calculateDistance } from '../utils/geo';

const MIN_DISTANCE_METERS = 50; // Trigger update if moved >50m
const MIN_TIME_MS = 30000;       // Or if >30 seconds have passed
const FORCED_PING_INTERVAL = 60000; // Forced periodic ping every 60s

/**
 * Custom hook to track user location and send it to the backend.
 * Ensures user is always present in Redis GEO for nearby discovery.
 */
export const useGeolocation = (enabled: boolean = true) => {
  const [error, setError] = useState<string | null>(null);
  const [isGhostMode, setIsGhostMode] = useState<boolean>(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  const lastPingTimeRef = useRef<number>(0);
  const lastSentCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const latestCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  const sendPing = useCallback(async (latitude: number, longitude: number, reason: string) => {
    try {
      console.log(`[Geolocation] Sending ping — reason: ${reason}, lat: ${latitude.toFixed(6)}, lng: ${longitude.toFixed(6)}`);
      const response = await api.post('/location/ping', { latitude, longitude });

      if (response.data?.status === 'ghost') {
        setIsGhostMode(true);
        console.log('[Geolocation] Ghost mode active — location not broadcast');
      } else {
        setIsGhostMode(false);
        lastPingTimeRef.current = Date.now();
        lastSentCoordsRef.current = { lat: latitude, lng: longitude };
        console.log('[Geolocation] Ping successful');
      }
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error('[Geolocation] Ping failed:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    // ── Force an initial ping on mount to ensure user is in Redis GEO ──
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        latestCoordsRef.current = { lat: latitude, lng: longitude };
        sendPing(latitude, longitude, 'initial_sync');
      },
      (err) => console.error('[Geolocation] Initial position failed:', err),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    // ── Watch for position changes with distance/time gating ──
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const now = Date.now();
        setPosition({ lat: latitude, lng: longitude });
        latestCoordsRef.current = { lat: latitude, lng: longitude };

        let shouldPing = false;
        let reason = '';
        if (!lastSentCoordsRef.current) {
          shouldPing = true;
          reason = 'first_position';
        } else {
          const distance = calculateDistance(
            lastSentCoordsRef.current.lat,
            lastSentCoordsRef.current.lng,
            latitude,
            longitude
          );
          const elapsed = now - lastPingTimeRef.current;

          if (distance > MIN_DISTANCE_METERS) {
            shouldPing = true;
            reason = `moved_${Math.round(distance)}m`;
          } else if (elapsed > MIN_TIME_MS) {
            shouldPing = true;
            reason = `time_elapsed_${Math.round(elapsed / 1000)}s`;
          }
        }

        if (shouldPing) {
          sendPing(latitude, longitude, reason);
        }
      },
      (err) => {
        setError(err.message);
        console.error('[Geolocation] Watch error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    // ── Forced periodic ping to keep Redis fresh (every 15s) ──
    const intervalId = setInterval(() => {
      const coords = latestCoordsRef.current;
      if (coords) {
        const elapsed = Date.now() - lastPingTimeRef.current;
        if (elapsed >= FORCED_PING_INTERVAL) {
          sendPing(coords.lat, coords.lng, 'periodic_keepalive');
        }
      }
    }, FORCED_PING_INTERVAL);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(intervalId);
    };
  }, [enabled, sendPing]);

  return { error, isGhostMode, position };
};

