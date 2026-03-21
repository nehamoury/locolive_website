import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Ghost, ShieldAlert, Navigation, X, MessageCircle, UserPlus, ExternalLink } from 'lucide-react';
import { StoryBar } from '../../components/story/StoryBar';
import CreateStoryModal from '../../components/story/CreateStoryModal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:white;font-style:italic;">${initial}</div>`;

    return new L.DivIcon({
        html: `
            <div class="story-marker">
                <div class="marker-glow"></div>
                <div class="marker-container">${imgHtml}</div>
                ${count > 1 ? `<div class="marker-badge">${count}</div>` : ''}
            </div>
        `,
        className: '',
        iconSize: [56, 56],
        iconAnchor: [28, 28],
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

const MapPage = () => {
    const { user } = useAuth();
    const [clusters, setClusters] = useState<any[]>([]);
    const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
    const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
    const [isGhostMode, setIsGhostMode] = useState(false);
    const [isPanicActive, setIsPanicActive] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const watchIdRef = useRef<number | null>(null);

    // Geolocation watch
    useEffect(() => {
        if (!navigator.geolocation) return;
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
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

    const userIcon = createPulsingUserIcon();

    const defaultCenter: [number, number] = userPosition || [28.6139, 77.209];

    return (
        <div className="relative w-full overflow-hidden bg-[#e8e0d5] text-white" style={{ height: 'calc(100vh - 0px)' }}>
            {/* Custom CSS for Leaflet markers */}
            <style>{`
                .leaflet-container { background: #e8e0d5 !important; }
                .leaflet-control-attribution { display: none !important; }
                .leaflet-control-zoom a {
                    background: rgba(255,255,255,0.9) !important;
                    color: #1a1a2e !important;
                    border-color: rgba(0,0,0,0.15) !important;
                    backdrop-filter: blur(12px) !important;
                }

                .user-marker-pulse {
                    width: 48px; height: 48px;
                    position: relative;
                    display: flex; align-items: center; justify-content: center;
                }
                .inner-circle {
                    width: 14px; height: 14px;
                    background: #06b6d4;
                    border: 3px solid white;
                    border-radius: 50%;
                    position: absolute;
                    z-index: 3;
                    box-shadow: 0 0 10px #06b6d4;
                }
                .pulse {
                    width: 48px; height: 48px;
                    background: rgba(6, 182, 212, 0.3);
                    border-radius: 50%;
                    position: absolute;
                    animation: pulseAnim 2s infinite ease-out;
                }
                .pulse-ring {
                    width: 64px; height: 64px;
                    border: 2px solid rgba(6, 182, 212, 0.2);
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
                    border: 2px solid #0B0F1A;
                    z-index: 5;
                }
            `}</style>

            {/* Top Stories Bar */}
            <div className="absolute top-0 left-0 right-0 z-[500]">
                <StoryBar
                    stories={[]}
                    user={user}
                    onCreateStory={() => {}}
                    onStoryClick={() => {}}
                />
            </div>

            {/* Map */}
            <MapContainer
                center={defaultCenter}
                zoom={14}
                zoomControl={false}
                className="absolute inset-0 w-full h-full z-0"
                style={{ background: '#e8e0d5' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution=""
                    maxZoom={19}
                />

                <MapEventHandler onBoundsChange={fetchStories} />
                <FlyToUser position={flyTo} />

                {/* User's location marker */}
                {userPosition && (
                    <>
                        <Marker position={userPosition} icon={userIcon} />
                        <Circle
                            center={userPosition}
                            radius={150}
                            pathOptions={{
                                color: '#06b6d4',
                                fillColor: '#06b6d4',
                                fillOpacity: 0.08,
                                weight: 2,
                                opacity: 0.5,
                            }}
                        />
                    </>
                )}

                {/* Story cluster markers */}
                {clusters.map((cluster) => {
                    const avatar = cluster.stories?.[0]?.avatar_url
                        ? `http://localhost:8080${cluster.stories[0].avatar_url}`
                        : '';
                    const username = cluster.stories?.[0]?.username || 'User';
                    const icon = createStoryMarkerIcon(avatar, username, cluster.count);
                    return (
                        <Marker
                            key={cluster.geohash}
                            position={[cluster.latitude, cluster.longitude]}
                            icon={icon}
                            eventHandlers={{ click: () => setSelectedUser(cluster) }}
                        />
                    );
                })}
            </MapContainer>

            {/* Floating Action Buttons */}
            <div className="absolute bottom-8 right-6 z-[600] flex flex-col gap-4">
                <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setIsPanicActive(!isPanicActive)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-xl border-2 transition-all shadow-2xl ${
                        isPanicActive
                            ? 'bg-red-500/80 border-red-400 shadow-red-500/40 text-white'
                            : 'bg-black/60 border-white/10 text-white hover:border-red-500/50'
                    }`}
                >
                    <ShieldAlert className={`w-6 h-6 ${isPanicActive ? 'animate-pulse' : ''}`} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setIsGhostMode(!isGhostMode)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-xl border-2 transition-all shadow-2xl ${
                        isGhostMode
                            ? 'bg-indigo-600/80 border-indigo-400 shadow-indigo-500/40 text-white'
                            : 'bg-black/60 border-white/10 text-white hover:border-indigo-500/50'
                    }`}
                >
                    <Ghost className="w-6 h-6" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => { if (userPosition) setFlyTo([...userPosition]); }}
                    className="w-14 h-14 bg-black/60 backdrop-blur-xl border-2 border-white/10 rounded-full flex items-center justify-center shadow-2xl hover:border-cyan-500/50 transition-all text-white"
                >
                    <Navigation className="w-6 h-6" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/20 text-white mt-2"
                >
                    <Plus className="w-8 h-8" strokeWidth={3} />
                </motion.button>
            </div>

            {/* Selected User Card */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0, y: 80 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 80 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[700] w-[90%] max-w-sm"
                    >
                        <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-5 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none" />

                            <button
                                onClick={() => setSelectedUser(null)}
                                className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>

                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow-xl">
                                    {selectedUser.stories?.[0]?.avatar_url ? (
                                        <img
                                            src={`http://localhost:8080${selectedUser.stories[0].avatar_url}`}
                                            className="w-full h-full rounded-full border-2 border-black object-cover"
                                            alt=""
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full border-2 border-black bg-indigo-700 flex items-center justify-center font-black text-white italic text-xl">
                                            {(selectedUser.stories?.[0]?.username || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black italic tracking-tight">
                                        @{selectedUser.stories?.[0]?.username || 'Nearby User'}
                                    </h3>
                                    <p className="text-gray-400 text-xs flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
                                        {selectedUser.count} {selectedUser.count === 1 ? 'story' : 'stories'} nearby
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex items-center justify-center gap-2 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95 text-sm">
                                    <UserPlus className="w-4 h-4" /> Connect
                                </button>
                                <button className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all active:scale-95 text-sm">
                                    <MessageCircle className="w-4 h-4 text-cyan-400" /> Message
                                </button>
                            </div>

                            <button className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                                <ExternalLink className="w-3 h-3" /> View Full Profile
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ghost Mode overlay */}
            {isGhostMode && (
                <div className="absolute inset-0 z-[400] pointer-events-none">
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-indigo-600/80 backdrop-blur-md px-5 py-2 rounded-full text-white text-sm font-bold flex items-center gap-2 border border-indigo-400/30 shadow-xl">
                        <Ghost className="w-4 h-4" /> Ghost Mode Active — You're invisible
                    </div>
                </div>
            )}

            {/* Create Story Modal */}
            <CreateStoryModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    // Optionally re-fetch map stories after posting
                }}
            />
        </div>
    );
};

export default MapPage;
