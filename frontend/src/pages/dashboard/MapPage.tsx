import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, ShieldAlert, Navigation, X, MessageCircle, UserPlus, Star, Heart } from 'lucide-react';
import { DiscoveryPanel } from '../../components/discovery/DiscoveryPanel';
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

    return new L.DivIcon({
        html: `
            <div class="story-marker-refined" style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                <div class="story-marker" style="width:72px;height:72px;">
                    <div class="marker-glow"></div>
                    <div class="marker-container" style="width:64px;height:64px;border-width:4px;">${imgHtml}</div>
                    ${count > 1 ? `<div class="marker-badge" style="width:24px;height:24px;font-size:12px;top:-6px;right:-6px;">${count}</div>` : ''}
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
    const [activeTab, setActiveTab] = useState<'stories' | 'heatmap' | 'both'>('stories');
    const [crossings, setCrossings] = useState<any[]>([]);
    const [locationName] = useState('Raipur, CG');
    const [toast, setToast] = useState<{ message: string; type: 'like' | 'superlike' } | null>(null);
    const watchIdRef = useRef<number | null>(null);

    const showDiscoveryToast = (message: string, type: 'like' | 'superlike') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2500);
    };

    const handleConnect = async (userId: string) => {
        const user = userStack.find(u => u.id === userId) || (selectedUser?.stories?.[0]?.user_id === userId ? selectedUser.stories[0] : null);
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
        const user = userStack.find(u => u.id === userId) || (selectedUser?.stories?.[0]?.user_id === userId ? selectedUser.stories[0] : null);
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
            // Initialize/Update stack with new users
            setUserStack(users);
            setCurrentStackIndex(0);
        } catch (err) {
            console.error('Failed to fetch nearby users:', err);
        }
    };

    // Geolocation watch
    useEffect(() => {
        if (!navigator.geolocation) return;
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                setUserPosition([pos.coords.latitude, pos.coords.longitude]);
                fetchNearbyUsers(pos.coords.latitude, pos.coords.longitude);
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
    }, []);

    const userIcon = createPulsingUserIcon();
    const defaultCenter: [number, number] = userPosition || [21.2514, 81.6296]; // Default to Raipur center

    // Derive data for DiscoveryPanel
    const nearbyStories = (clusters || []).flatMap(c => c.stories || []).slice(0, 9);
    const featuredUser = userStack[currentStackIndex];

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white">
            {/* Custom CSS for Leaflet markers */}
            <style>{`
                .leaflet-container { background: #ffffff !important; }
                .leaflet-control-attribution { display: none !important; }
                .leaflet-control-zoom a {
                    background: rgba(255,255,255,0.95) !important;
                    color: #000000 !important;
                    border-color: rgba(0,0,0,0.05) !important;
                    backdrop-filter: blur(20px) !important;
                }

                .user-marker-pulse {
                    width: 48px; height: 48px;
                    position: relative;
                    display: flex; align-items: center; justify-content: center;
                }
                .inner-circle {
                    width: 16px; height: 16px;
                    background: #ec4899;
                    border: 4px solid white;
                    border-radius: 50%;
                    position: absolute;
                    z-index: 3;
                    box-shadow: 0 0 15px rgba(236, 72, 153, 0.4);
                }
                .pulse {
                    width: 48px; height: 48px;
                    background: rgba(236, 72, 153, 0.2);
                    border-radius: 50%;
                    position: absolute;
                    animation: pulseAnim 2s infinite ease-out;
                }
                .pulse-ring {
                    width: 64px; height: 64px;
                    border: 2px solid rgba(236, 72, 153, 0.15);
                    border-radius: 50%;
                    position: absolute;
                    animation: pulseRing 3s 0.5s infinite ease-out;
                }
                @keyframes pulseAnim {
                    0% { transform: scale(0.5); opacity: 1; }
                    100% { transform: scale(1.8); opacity: 0; }
                }
                @keyframes pulseRing {
                    0% { transform: scale(0.8); opacity: 0.6; }
                    100% { transform: scale(1.6); opacity: 0; }
                }

                .story-marker { cursor: pointer; position: relative; width: 56px; height: 56px; }
                .marker-container {
                    width: 52px; height: 52px;
                    border-radius: 50%;
                    border: 3px solid #ec4899;
                    background: #1a1a2e;
                    overflow: hidden;
                    position: absolute;
                    top: 2px; left: 2px;
                    z-index: 2;
                    transition: transform 0.2s;
                }
                .story-marker:hover .marker-container { transform: scale(1.15); }
                .marker-glow {
                    position: absolute; inset: -8px;
                    background: radial-gradient(circle, rgba(236,72,153,0.5) 0%, transparent 70%);
                    filter: blur(8px);
                    animation: spinGlow 4s linear infinite;
                    z-index: 1;
                }
                @keyframes spinGlow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .marker-badge {
                    position: absolute; top: -4px; right: -4px;
                    background: #ec4899; color: white;
                    font-size: 10px; font-weight: 900;
                    width: 20px; height: 20px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    border: 2px solid white;
                    z-index: 5;
                }
            `}</style>

            {/* Left Column: Map (65%) */}
            <div className="flex-[2.5] relative h-full bg-white overflow-hidden border-r border-gray-100">
                <MapContainer
                    center={defaultCenter}
                    zoom={14}
                    zoomControl={false}
                    className="absolute inset-0 w-full h-full z-0"
                    style={{ background: '#ffffff' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution=""
                        maxZoom={19}
                    />

                    <MapEventHandler onBoundsChange={fetchStories} />
                    <FlyToUser position={flyTo} />

                    {/* User's location marker */}
                    {userPosition && (activeTab === 'heatmap' || activeTab === 'both') && (
                        <>
                            <Marker position={userPosition} icon={userIcon} />
                            <Circle
                                center={userPosition}
                                radius={150}
                                pathOptions={{
                                    color: '#6b21a8',
                                    fillColor: '#6b21a8',
                                    fillOpacity: 0.08,
                                    weight: 2,
                                    opacity: 0.5,
                                }}
                            />
                        </>
                    )}

                    {/* Nearby Real-time Users */}
                    {(activeTab === 'heatmap' || activeTab === 'both') && nearbyUsers.map((u) => (
                        <Marker
                            key={`user-${u.id}`}
                            position={[u.latitude, u.longitude]}
                            icon={createOtherUserIcon(u.avatar_url ? (u.avatar_url.startsWith('http') ? u.avatar_url : `http://localhost:8080${u.avatar_url}`) : '', u.username)}
                            eventHandlers={{ click: () => setSelectedUser({ count: 0, stories: [u], isUserOnly: true }) }}
                        />
                    ))}

                    {/* Story cluster markers */}
                    {(activeTab === 'stories' || activeTab === 'both') && clusters.map((cluster) => {
                        const avatar = cluster.stories?.[0]?.avatar_url
                            ? (cluster.stories[0].avatar_url.startsWith('http') ? cluster.stories[0].avatar_url : `http://localhost:8080${cluster.stories[0].avatar_url}`)
                            : '';
                        const username = cluster.stories?.[0]?.username || 'User';
                        const icon = createStoryMarkerIcon(avatar, username, cluster.count);
                        return (
                            <Marker
                                key={`story-${cluster.geohash}`}
                                position={[cluster.latitude, cluster.longitude]}
                                icon={icon}
                                eventHandlers={{ click: () => setSelectedUser(cluster) }}
                            />
                        );
                    })}
                </MapContainer>

                {/* Map Floating Actions */}
                <div className="absolute top-6 left-6 z-[600]">
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-full shadow-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none mt-0.5">Live Discovery Active</span>
                    </div>
                </div>

                <div className="absolute bottom-10 left-10 z-[600] flex flex-col gap-5">
                    <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setIsPanicActive(!isPanicActive)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-xl border-4 border-white transition-all shadow-[0_15px_30px_-5px_rgba(239,68,68,0.3)] ${
                            isPanicActive ? 'bg-red-500 text-white' : 'bg-white/95 text-red-500 hover:bg-white'
                        }`}
                    >
                        <ShieldAlert className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setIsGhostMode(!isGhostMode)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-xl border-4 border-white transition-all shadow-[0_15px_30px_-5px_rgba(168,85,247,0.3)] ${
                            isGhostMode ? 'bg-purple-500 text-white' : 'bg-white/95 text-purple-500 hover:bg-white'
                        }`}
                    >
                        <Ghost className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => { if (userPosition) setFlyTo([...userPosition]); }}
                        className="w-14 h-14 bg-white/95 backdrop-blur-xl border-4 border-white rounded-full flex items-center justify-center shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1)] hover:bg-white transition-all text-black"
                    >
                        <Navigation className="w-6 h-6" />
                    </motion.button>
                </div>
            </div>

            {/* Right Column: Discovery Panel (35%) */}
            <div className="flex-1 min-w-[380px] max-w-[450px] flex flex-col h-full bg-white relative">
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

            {/* Selection Overlays */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] w-full max-w-sm pointer-events-auto"
                    >
                         <div className="bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-[32px] p-6 shadow-2xl relative">
                            <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-pink-500 to-purple-600 mb-4 shadow-xl">
                                    <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center border-4 border-white">
                                        {selectedUser.stories?.[0]?.avatar_url ? (
                                            <img src={`http://localhost:8080${selectedUser.stories[0].avatar_url}`} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <span className="text-3xl font-black text-pink-500 italic">{(selectedUser.stories?.[0]?.username || 'U').charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 italic tracking-tight mb-1">@{selectedUser.stories?.[0]?.username}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                                    {selectedUser.isUserOnly ? 'Nearby User' : `Nearby Raipur · ${selectedUser.count} stories`}
                                </p>
                                
                                <div className="flex gap-3 w-full">
                                    <button 
                                        onClick={() => handleConnect(selectedUser.stories?.[0]?.user_id || selectedUser.stories?.[0]?.id)}
                                        className="flex-1 py-3 bg-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <UserPlus className="w-4 h-4" /> Follow
                                    </button>
                                    <button 
                                        onClick={() => onUserSelect?.(selectedUser.stories?.[0]?.user_id || selectedUser.stories?.[0]?.id)}
                                        className="flex-1 py-3 bg-gray-50 border border-gray-100 text-gray-900 font-bold rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" /> Profile
                                    </button>
                                </div>
                            </div>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Story Modal */}
            <CreateStoryModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => setIsCreateModalOpen(false)}
            />

            {/* Ghost Mode UI */}
            {isGhostMode && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[700]">
                    <div className="px-6 py-2 bg-gray-900/90 backdrop-blur-md rounded-full text-white text-[11px] font-black uppercase tracking-[2px] border border-white/10 shadow-2xl flex items-center gap-2">
                        <Ghost className="w-4 h-4 text-pink-400" /> Ghost Mode Active
                    </div>
                </div>
            )}

            {/* Discovery Toast */}
            <AnimatePresence mode="wait">
                {toast && <DiscoveryToast key={toast.message + toast.type} message={toast.message} type={toast.type} />}
            </AnimatePresence>
        </div>
    );
};

export default MapPage;
