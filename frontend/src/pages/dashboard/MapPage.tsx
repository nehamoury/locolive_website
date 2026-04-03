import { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import './MapPage.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, ShieldAlert, Navigation, Star, Heart, ChevronRight, Menu, MapPin } from 'lucide-react';
import { DiscoveryPanel } from '../../components/discovery/DiscoveryPanel';
import { MapFilters } from '../../components/map/MapFilters';
import { UserPreviewCard } from '../../components/map/UserPreviewCard';
import CreateStoryModal from '../../components/story/CreateStoryModal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ─── Toast Component ───────────────────────────────────────────────────────────
interface DiscoveryToastProps { message: string; type: 'like' | 'superlike'; }

const DiscoveryToast: React.FC<DiscoveryToastProps> = ({ message, type }) => (
    <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.9 }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1001] flex items-center gap-3 px-8 py-4 bg-[#1a1a1a]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10"
    >
        {type === 'like' ? (
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
        ) : (
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
        )}
        <span className="text-white font-bold tracking-tight text-sm flex items-center gap-2">
            {message}
        </span>
    </motion.div>
);

// ─── Custom Icons ─────────────────────────────────────────────────────────────

const createPulsingUserIcon = () =>
    new L.DivIcon({
        html: `
            <div class="user-marker-pulse">
                <div class="inner-circle"></div>
                <div class="pulse"></div>
                <div class="pulse-ring"></div>
            </div>
        `,
        className: '',
        iconSize: [48, 48],
        iconAnchor: [24, 24],
    });

const createStoryMarkerIcon = (avatarUrl: string, username: string, count: number) => {
    const initial = username ? username.charAt(0).toUpperCase() : '?';
    const imgHtml = avatarUrl
        ? `<img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;" />`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:white;font-style:italic;">${initial}</div>`;
    const badgeHtml = count > 1 
        ? `<div class="marker-badge" style="width:24px;height:24px;font-size:12px;top:-6px;right:-6px;">${count}</div>` 
        : '';

    return new L.DivIcon({
        html: `
            <div class="story-marker-refined" style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                <div class="story-marker" style="width:72px;height:72px;">
                    <div class="marker-glow"></div>
                    <div class="marker-container" style="width:64px;height:64px;border-width:4px;">${imgHtml}</div>
                    ${badgeHtml}
                </div>
                <div style="background:rgba(255,255,255,0.95);backdrop-filter:blur(8px);padding:4px 12px;border-radius:12px;border:2px solid #ec4899;box-shadow:0 10px 20px -5px rgba(236,72,153,0.3);transform:translateY(-8px);">
                    <span style="font-size:11px;font-weight:900;color:black;text-transform:uppercase;font-style:italic;letter-spacing:-0.5px;white-space:nowrap;">@${username}</span>
                </div>
            </div>
        `,
        className: '',
        iconSize: [80, 110],
        iconAnchor: [40, 72],
    });
};

const createOtherUserIcon = (avatarUrl: string, username: string) => {
    const initial = username ? username.charAt(0).toUpperCase() : '?';
    const imgHtml = avatarUrl
        ? `<img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;" />`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:white;font-style:italic;background:linear-gradient(45deg, #10b981, #3b82f6);">${initial}</div>`;

    return new L.DivIcon({
        html: `
            <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                <div style="position:relative;width:56px;height:56px;">
                    <div style="width:56px;height:56px;border-radius:50%;border:4px solid #10b981;overflow:hidden;box-shadow:0 0 20px rgba(16,185,129,0.4);background:white;">
                        ${imgHtml}
                    </div>
                    <div style="position:absolute;bottom:0px;right:0px;width:18px;height:18px;background:#10b981;border-radius:50%;border:4px solid white;"></div>
                </div>
                <div style="background:rgba(255,255,255,0.95);backdrop-filter:blur(8px);padding:3px 10px;border-radius:10px;border:2px solid #10b981;box-shadow:0 10px 15px -3px rgba(16,185,129,0.3);transform:translateY(-4px);">
                    <span style="font-size:10px;font-weight:900;color:black;text-transform:uppercase;font-style:italic;letter-spacing:-0.5px;white-space:nowrap;">${username}</span>
                </div>
            </div>
        `,
        className: '',
        iconSize: [70, 90],
        iconAnchor: [35, 56],
    });
};

const createHeatIcon = (intensity: number) => {
    const size = Math.min(200, 80 + intensity * 12);
    return new L.DivIcon({
        html: `<div style="
            width:${size}px;height:${size}px;border-radius:50%;
            background:radial-gradient(circle,rgba(236,72,153,0.45) 0%,rgba(168,85,247,0.2) 50%,transparent 70%);
            filter:blur(18px);
            animation:heatPulse 3s ease-in-out infinite;
        "></div>`,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};

// ─── Inner component: fetches stories on map move ─────────────────────────────

const MapEventHandler = ({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) => {
    const map = useMapEvents({
        moveend: () => onBoundsChange(map.getBounds()),
        load: () => onBoundsChange(map.getBounds()),
    });
    useEffect(() => {
        onBoundsChange(map.getBounds());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
};

const FlyToUser = ({ position }: { position: [number, number] | null }) => {
    const map = useMap();
    useEffect(() => {
        if (position) map.flyTo(position, 15, { duration: 2 });
    }, [position, map]);
    return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface MapPageProps {
  onUserSelect?: (userId: string) => void;
  onConnect?: (userId: string) => void;
}

const MapPage = ({ onUserSelect, onConnect }: MapPageProps) => {
    const { } = useAuth();
    const [clusters, setClusters] = useState<any[]>([]);
    const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
    const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
    const [userStack, setUserStack] = useState<any[]>([]);
    const [currentStackIndex, setCurrentStackIndex] = useState(0);
    const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
    const [isGhostMode, setIsGhostMode] = useState(false);
    const [isPanicActive, setIsPanicActive] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'stories' | 'heatmap' | 'both'>('both');
    const [crossings, setCrossings] = useState<any[]>([]);
    const [heatmap, setHeatmap] = useState<any[]>([]);
    const [locationName, setLocationName] = useState('India');
    const [toast, setToast] = useState<{ message: string; type: 'like' | 'superlike' } | null>(null);
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState({ distance: null, isOnline: false, hasStories: false });
    const [connectionIds, setConnectionIds] = useState<Set<string>>(new Set());
    const watchIdRef = useRef<number | null>(null);

    const showDiscoveryToast = (message: string, type: 'like' | 'superlike') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2500);
    };

    const handleConnect = async (userId: string) => {
        if (!userId) return;
        const userInStack = userStack.find(u => (u.userId || u.id) === userId);
        const userInSelected = selectedUser?.stories?.find((s: any) => (s.user_id || s.id || s.userId) === userId);
        const user = userInStack || userInSelected;
        const name = user?.full_name || user?.username || 'User';

        try {
            showDiscoveryToast(`Liked ${name}!`, 'like');
            
            if (onConnect) {
                await onConnect(userId);
            } else {
                await api.post('/connections/request', { target_user_id: userId });
            }
            
            if (selectedUser) setSelectedUser(null);
            else handleSkip();
        } catch (err) {
            console.error('Failed to send connection request:', err);
        }
    };

    const handleSkip = () => {
        setCurrentStackIndex(prev => prev + 1);
    };

    const handleFavorite = async (userId: string) => {
        if (!userId) return;
        const userInStack = userStack.find(u => (u.userId || u.id) === userId);
        const userInSelected = selectedUser?.stories?.find((s: any) => (s.user_id || s.id || s.userId) === userId);
        const user = userInStack || userInSelected;
        const name = user?.full_name || user?.username || 'User';

        try {
            showDiscoveryToast(`Super-liked ${name}!`, 'superlike');
            await handleConnect(userId);
        } catch (err) {
            console.error('Failed to favorite user:', err);
        }
    };

    const fetchNearbyUsers = async (lat: number, lng: number) => {
        try {
            const res = await api.get('/users/nearby', { params: { lat, lng } });
            const users = res.data || [];
            setNearbyUsers(users);
            setUserStack(users);
            setCurrentStackIndex(0);
        } catch (err) {
            console.error('Failed to fetch nearby users:', err);
        }
    };

    const fetchCity = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.state_district || 'India';
            setLocationName(city);
        } catch (err) {
            console.error('Failed to fetch city:', err);
        }
    };

    useEffect(() => {
        if (!navigator.geolocation) return;
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setUserPosition([latitude, longitude]);
                fetchNearbyUsers(latitude, longitude);
                fetchCity(latitude, longitude);
            },
            (err) => console.error('Geolocation error:', err),
            { enableHighAccuracy: true }
        );
        return () => {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    const fetchStories = async (bounds: L.LatLngBounds) => {
        try {
            const params = {
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest(),
            };
            const res = await api.get('/stories/map', { params });
            setClusters(res.data.clusters || []);
        } catch (err) {
            console.error('Failed to fetch map stories:', err);
        }
    };

    const fetchHeatmap = async () => {
        try {
            const res = await api.get('/location/heatmap');
            setHeatmap(res.data || []);
        } catch (err) {
            console.error('Failed to fetch heatmap:', err);
        }
    };

    const fetchCrossings = async () => {
        try {
            const res = await api.get('/crossings');
            setCrossings(res.data || []);
        } catch (err) {
            console.error('Failed to fetch crossings:', err);
        }
    };

    useEffect(() => {
        fetchCrossings();
        fetchHeatmap();
        
        api.get('/connections').then(res => {
            const ids = new Set((res.data || []).map((c: any) => c.status === 'accepted' ? c.id : c.id).filter(Boolean));
            setConnectionIds(ids as Set<string>);
        }).catch(() => {});
    }, []);

    const userIcon = createPulsingUserIcon();
    const defaultCenter: [number, number] = userPosition || [21.2514, 81.6296];

    const nearbyStories = (clusters || []).flatMap(c => c.stories || []).slice(0, 9);
    const featuredUser = userStack[currentStackIndex];

    const getCoords = (item: any): [number, number] | null => {
        const lat = item.latitude !== undefined ? item.latitude : item.lat;
        const lng = item.longitude !== undefined ? item.longitude : item.lng;
        if (lat == null || lng == null) return null;
        return [Number(lat), Number(lng)];
    };

    const filteredNearbyUsers = useMemo(() => {
        return nearbyUsers.filter(u => {
            if (activeFilters.isOnline && !u.online) return false;
            return true;
        });
    }, [nearbyUsers, activeFilters]);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-white">
            {/* LEFT SIDEBAR: Discovery Features */}
            <div className="hidden md:flex w-[450px] h-full border-r border-gray-100 flex-col bg-white shadow-2xl z-10">
                <DiscoveryPanel 
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    locationName={locationName}
                    nearbyUser={featuredUser}
                    crossings={crossings}
                    nearbyStories={nearbyStories}
                    onUserSelect={onUserSelect}
                    onConnect={handleConnect}
                    onSkip={handleSkip}
                    onFavorite={handleFavorite}
                />
            </div>

            <div className="relative flex-1 h-full overflow-hidden group/map">

                <MapContainer
                    center={defaultCenter}
                    zoom={14}
                    zoomControl={false}
                    className="absolute inset-0 w-full h-full z-0"
                    style={{ background: '#f8fafc' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution=""
                        maxZoom={19}
                    />

                    <MapEventHandler onBoundsChange={fetchStories} />
                    <FlyToUser position={flyTo} />

                    <MarkerClusterGroup
                        chunkedLoading
                        maxClusterRadius={40}
                        iconCreateFunction={(cluster: any) => {
                            return L.divIcon({
                                html: `<span>${cluster.getChildCount()}</span>`,
                                className: 'custom-cluster-icon',
                                iconSize: L.point(40, 40, true),
                            });
                        }}
                    >
                        {(activeTab === 'heatmap' || activeTab === 'both') && filteredNearbyUsers
                            .map((u) => ({ ...u, coords: getCoords(u) }))
                            .filter(u => u.id && u.coords)
                            .map((u) => (
                            <Marker
                                key={`user-${u.id}`}
                                position={u.coords!}
                                icon={createOtherUserIcon(u.avatar_url ? (u.avatar_url.startsWith('http') ? u.avatar_url : `http://localhost:8080${u.avatar_url}`) : '', u.username)}
                                eventHandlers={{ click: () => setSelectedUser({ count: 0, stories: [u], isUserOnly: true }) }}
                            >
                                <Popup className="custom-popup">
                                    <div className="font-bold text-gray-900 leading-tight">@{u.username}</div>
                                    <div className="text-[10px] text-gray-500 uppercase">{u.distance ? `${Number(u.distance).toFixed(1)} km` : 'Nearby'}</div>
                                    {connectionIds.has(u.id) && <div className="text-[10px] text-pink-500 font-bold mt-1 uppercase">Connection</div>}
                                </Popup>
                            </Marker>
                        ))}

                        {(activeTab === 'stories' || activeTab === 'both') && clusters
                            .map((c) => ({ ...c, coords: getCoords(c) }))
                            .filter(cluster => cluster.geohash && cluster.coords)
                            .map((cluster) => {
                            const avatar = cluster.stories?.[0]?.avatar_url
                                ? (cluster.stories[0].avatar_url.startsWith('http') ? cluster.stories[0].avatar_url : `http://localhost:8080${cluster.stories[0].avatar_url}`)
                                : '';
                            const username = cluster.stories?.[0]?.username || 'User';
                            const icon = createStoryMarkerIcon(avatar, username, cluster.count);
                            return (
                                <Marker
                                    key={`story-${cluster.geohash}`}
                                    position={cluster.coords!}
                                    icon={icon}
                                    eventHandlers={{ click: () => setSelectedUser(cluster) }}
                                />
                            );
                        })}
                    </MarkerClusterGroup>

                    {userPosition && (
                        <>
                            <Marker position={userPosition} icon={userIcon} />
                            <Circle
                                center={userPosition}
                                radius={150}
                                pathOptions={{
                                    color: '#ff3b8e',
                                    fillColor: '#ff3b8e',
                                    fillOpacity: 0.1,
                                    weight: 2,
                                    opacity: 0.5,
                                }}
                            />
                        </>
                    )}

                    {(activeTab === 'heatmap' || activeTab === 'both') && heatmap
                        .filter(pt => (pt.lat || pt.latitude) && (pt.lng || pt.longitude))
                        .map((pt, idx) => (
                            <Marker 
                                key={`heat-${idx}`}
                                position={[pt.lat || pt.latitude, pt.lng || pt.longitude]}
                                icon={createHeatIcon(pt.intensity || pt.count || 5)}
                                interactive={false}
                            />
                        ))
                    }
                </MapContainer>

                <div className="absolute top-6 left-6 right-6 z-[600] flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-3 pointer-events-auto">
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-2xl shadow-xl">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] leading-none mt-0.5">Live Live</span>
                        </div>
                        
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-2xl shadow-xl">
                            <MapPin size={14} className="text-pink-500" />
                            <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">{locationName}</span>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsPanelVisible(true)}
                            className="p-3 bg-white/90 backdrop-blur-2xl border border-gray-100 rounded-2xl shadow-xl flex md:hidden pointer-events-auto"
                        >
                            <Menu className="w-5 h-5 text-gray-900" />
                        </motion.button>
                    </div>
                </div>

                <MapFilters onFilterChange={setActiveFilters} activeFilters={activeFilters} />

                <div className="absolute bottom-10 left-10 z-[600] flex flex-col gap-4">
                    <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setIsPanicActive(!isPanicActive)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-2xl border border-white/20 transition-all shadow-2xl ${
                            isPanicActive ? 'bg-red-500 text-white' : 'bg-white/90 text-red-500 hover:bg-white'
                        }`}
                    >
                        <ShieldAlert className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setIsGhostMode(!isGhostMode)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-2xl border border-white/20 transition-all shadow-2xl ${
                            isGhostMode ? 'bg-purple-500 text-white' : 'bg-white/90 text-purple-500 hover:bg-white'
                        }`}
                    >
                        <Ghost className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => { if (userPosition) setFlyTo([...userPosition]); }}
                        className="w-14 h-14 bg-white/90 backdrop-blur-2xl border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl hover:bg-white transition-all text-black"
                    >
                        <Navigation className="w-6 h-6" />
                    </motion.button>
                </div>

                <AnimatePresence>
                    {isPanelVisible && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsPanelVisible(false)}
                                className="absolute inset-0 bg-black/10 backdrop-blur-sm z-[800]"
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="absolute top-0 right-0 h-full w-full max-w-[450px] bg-white z-[900] shadow-[-20px_0_60px_rgba(0,0,0,0.1)] border-l border-gray-100 overflow-hidden"
                            >
                                <button 
                                    onClick={() => setIsPanelVisible(false)}
                                    className="absolute top-6 left-6 z-[1000] p-2 h-10 w-10 flex items-center justify-center bg-gray-50/80 hover:bg-gray-100 rounded-full text-gray-600 transition-all shadow-md group"
                                >
                                    <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                                <div className="h-full w-full">
                                    <DiscoveryPanel 
                                        activeTab={activeTab}
                                        setActiveTab={setActiveTab}
                                        locationName={locationName}
                                        nearbyUser={featuredUser}
                                        crossings={crossings}
                                        nearbyStories={nearbyStories}
                                        onUserSelect={onUserSelect}
                                        onConnect={handleConnect}
                                        onSkip={handleSkip}
                                        onFavorite={handleFavorite}
                                    />
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <div className="md:hidden">
                    {!isPanelVisible && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ x: -10 }}
                            onClick={() => setIsPanelVisible(true)}
                            className="absolute top-1/2 right-0 -translate-y-1/2 z-[500] h-32 w-8 bg-white/90 backdrop-blur-xl border border-r-0 border-gray-100 rounded-l-[24px] cursor-pointer flex items-center justify-center shadow-[-10px_0_30px_rgba(0,0,0,0.05)] transition-all overflow-hidden"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-400 rotate-180" />
                        </motion.div>
                    )}
                </div>

                <AnimatePresence>
                    {selectedUser && (
                        <UserPreviewCard 
                            user={selectedUser} 
                            isConnection={connectionIds.has(selectedUser?.stories?.[0]?.user_id || selectedUser?.stories?.[0]?.id || selectedUser?.id)}
                            onClose={() => setSelectedUser(null)}
                            onConnect={handleConnect}
                            onProfileOpen={onUserSelect!}
                        />
                    )}
                </AnimatePresence>

                <CreateStoryModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => setIsCreateModalOpen(false)}
                />

                {isGhostMode && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[700]">
                        <div className="px-6 py-2 bg-gray-900/95 backdrop-blur-md rounded-full text-white text-[11px] font-black uppercase tracking-[2px] border border-white/10 shadow-2xl flex items-center gap-2">
                            <Ghost className="w-4 h-4 text-pink-400" /> Ghost Mode Active
                         </div>
                     </div>
                )}

                <AnimatePresence mode="wait">
                    {toast && <DiscoveryToast key={toast.message + toast.type} message={toast.message} type={toast.type} />}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MapPage;
