import { useEffect, useRef, useState, useCallback } from 'react';
import { DiscoveryPanel } from '../../components/discovery/DiscoveryPanel';
import api from '../../services/api';
import { calculateDistance } from '../../utils/geo';

interface DiscoveryPageProps {
  onUserSelect?: (userId: string) => void;
  onConnect?: (userId: string) => void;
}

const DiscoveryPage = ({ onUserSelect, onConnect }: DiscoveryPageProps) => {
    const [userStack, setUserStack] = useState<any[]>([]);
    const [currentStackIndex, setCurrentStackIndex] = useState(0);
    const [clusters, setClusters] = useState<any[]>([]);
    const [crossings, setCrossings] = useState<any[]>([]);
    const [locationName, setLocationName] = useState('India');
    const [activeTab, setActiveTab] = useState<'stories' | 'heatmap' | 'both'>('both');
    
    // Throttling Refs
    const lastNearbyFetchRef = useRef<{time: number, coords: [number, number]} | null>(null);
    const lastCityFetchRef = useRef<{time: number, coords: [number, number]} | null>(null);

    const fetchNearbyUsers = useCallback(async (lat: number, lng: number) => {
        try {
            const res = await api.get('/users/nearby', { params: { lat, lng } });
            const users = res.data || [];
            setUserStack(users);
            setCurrentStackIndex(0);
        } catch (err) {
            console.error('Failed to fetch nearby users:', err);
        }
    }, []);

    const fetchCity = useCallback(async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.state_district || 'India';
            setLocationName(city);
        } catch (err) {
            console.error('Failed to fetch city:', err);
        }
    }, []);

    const fetchCrossings = useCallback(async () => {
        try {
            const res = await api.get('/crossings');
            setCrossings(res.data || []);
        } catch (err) {
            console.error('Failed to fetch crossings:', err);
        }
    }, []);

    const fetchMapStories = useCallback(async () => {
        try {
            // Get initial location for stories
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                const params = {
                    north: latitude + 0.1,
                    south: latitude - 0.1,
                    east: longitude + 0.1,
                    west: longitude - 0.1,
                };
                const res = await api.get('/stories/map', { params });
                setClusters(res.data.clusters || []);
            });
        } catch (err) {
            console.error('Failed to fetch stories:', err);
        }
    }, []);

    useEffect(() => {
        fetchCrossings();
        fetchMapStories();

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const now = Date.now();

                // 1. Optimize Nearby Users Fetch
                let shouldFetchNearby = false;
                if (!lastNearbyFetchRef.current) {
                    shouldFetchNearby = true;
                } else {
                    const dist = calculateDistance(lastNearbyFetchRef.current.coords[0], lastNearbyFetchRef.current.coords[1], latitude, longitude);
                    if (dist > 100 || (now - lastNearbyFetchRef.current.time > 30000)) {
                        shouldFetchNearby = true;
                    }
                }

                if (shouldFetchNearby) {
                    fetchNearbyUsers(latitude, longitude);
                    lastNearbyFetchRef.current = { time: now, coords: [latitude, longitude] };
                }

                // 2. Optimize City Fetch
                let shouldFetchCity = false;
                if (!lastCityFetchRef.current) {
                    shouldFetchCity = true;
                } else {
                    const dist = calculateDistance(lastCityFetchRef.current.coords[0], lastCityFetchRef.current.coords[1], latitude, longitude);
                    if (dist > 500 || (now - lastCityFetchRef.current.time > 600000)) {
                        shouldFetchCity = true;
                    }
                }

                if (shouldFetchCity) {
                    fetchCity(latitude, longitude);
                    lastCityFetchRef.current = { time: now, coords: [latitude, longitude] };
                }
            },
            (err) => console.error('Geo error:', err),
            { enableHighAccuracy: true }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [fetchNearbyUsers, fetchCity, fetchCrossings, fetchMapStories]);

    const handleSkip = () => setCurrentStackIndex(prev => prev + 1);

    const handleConnect = async (userId: string) => {
        try {
            await api.post('/connections/request', { target_user_id: userId });
            handleSkip();
        } catch (err) {
            console.error('Connection failed:', err);
        }
    };

    const nearbyStories = (clusters || []).flatMap(c => c.stories || []).slice(0, 9);
    const featuredUser = userStack[currentStackIndex];

    return (
        <div className="h-full w-full bg-bg-base overflow-hidden flex flex-col transition-colors duration-300">
            <DiscoveryPanel 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                locationName={locationName}
                nearbyUser={featuredUser}
                crossings={crossings}
                nearbyStories={nearbyStories}
                onUserSelect={onUserSelect}
                onConnect={onConnect || handleConnect}
                onSkip={handleSkip}
                onFavorite={onConnect || handleConnect}
            />
        </div>
    );
};

export default DiscoveryPage;
