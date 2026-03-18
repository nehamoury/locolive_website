import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Users } from 'lucide-react';
import api from '../../lib/api';

// Fix for default marker icons in React-Leaflet
import 'leaflet/dist/leaflet.css';

// Custom Avatar Marker for Snap Map Style
const createAvatarIcon = (username: string, avatarUrl?: string) => new L.DivIcon({
  html: `<div class="group relative flex items-center justify-center">
          <div class="absolute -inset-1 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-full blur opacity-40 group-hover:opacity-100 transition-opacity animate-pulse"></div>
          <div class="relative w-12 h-12 rounded-2xl bg-white border-2 border-white shadow-xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-300">
            ${avatarUrl 
              ? `<img src="${avatarUrl}" class="w-full h-full object-cover" />`
              : `<div class="w-full h-full bg-purple-600 flex items-center justify-center text-white font-black text-lg">${username.charAt(0).toUpperCase()}</div>`
            }
          </div>
          <div class="absolute -bottom-6 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 whitespace-nowrap hidden group-hover:block">
            <span class="text-[10px] font-bold text-white">@${username}</span>
          </div>
         </div>`,
  className: 'custom-div-icon',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

// Component to handle map events like moves/zooms
function MapEvents({ onBoundsChange }: { onBoundsChange: (bounds: any) => void }) {
  const map = useMap();
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Changed type to be more specific
  useEffect(() => {
    const handleEvents = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        const b = map.getBounds();
        onBoundsChange({
          north: b.getNorth(),
          south: b.getSouth(),
          east: b.getEast(),
          west: b.getWest()
        });
      }, 300); // 300ms debounce
    };

    map.on('moveend', handleEvents);
    map.on('zoomend', handleEvents);
    
    // Initial load
    const initialBounds = map.getBounds();
    onBoundsChange({
      north: initialBounds.getNorth(),
      south: initialBounds.getSouth(),
      east: initialBounds.getEast(),
      west: initialBounds.getWest()
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      map.off('moveend', handleEvents);
      map.off('zoomend', handleEvents);
    };
  }, [map, onBoundsChange]);

  return null;
}

interface MapViewProps {
  onStorySelect?: (id: string) => void;
}

const MapView = ({ onStorySelect }: MapViewProps) => {
  const [stories, setStories] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [center, setCenter] = useState<[number, number]>([28.6139, 77.2090]); // Default to Delhi
  const [loading, setLoading] = useState(true);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const fetchMapData = useCallback(async (bounds: any) => {
    try {
      const [storiesRes, heatmapRes] = await Promise.all([
        api.get('/stories/map', { params: bounds }),
        api.get('/location/heatmap')
      ]);
      
      const clusters = storiesRes.data.clusters || [];
      const allStories: any[] = [];
      clusters.forEach((cluster: any) => {
         if (cluster.stories) {
           const normalizedStories = cluster.stories.map((s: any) => ({
             ...s,
             latitude: s.lat,
             longitude: s.lng
           }));
           allStories.push(...normalizedStories);
         } else {
            allStories.push({
              id: cluster.geohash,
              latitude: cluster.latitude,
              longitude: cluster.longitude,
              isCluster: true,
              count: cluster.count
            });
          }
       });

      setStories(allStories);
      setHeatmap(heatmapRes.data || []);
    } catch (err: any) {
      console.error("Failed to fetch map data:", err);
      if (err.response?.status === 401) {
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCenter([position.coords.latitude, position.coords.longitude]);
      });
    }
  }, []);

  return (
    <div className="h-[calc(100vh-80px)] w-full relative bg-[#0a0a0c]">
      {/* Map Controls Overlay - Snap Style */}
      <div className="absolute top-6 left-6 z-[1000] space-y-4 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-2xl max-w-xs pointer-events-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-yellow-400">
              <Navigation className="w-5 h-5 fill-current" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Snap Map</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300">Ghost Mode</span>
              <button 
                onClick={async () => {
                  try {
                    const newStatus = !isGhostMode;
                    await api.put('/location/ghost-mode', { enabled: newStatus, duration: 0 });
                    setIsGhostMode(newStatus);
                  } catch (err) {
                    console.error("Failed to toggle ghost mode:", err);
                  }
                }}
                className={`w-10 h-6 rounded-full transition-colors relative ${isGhostMode ? 'bg-purple-600' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isGhostMode ? 'left-5' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300">Heatmap</span>
              <button 
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`w-10 h-6 rounded-full transition-colors relative ${showHeatmap ? 'bg-yellow-500' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showHeatmap ? 'left-5' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 z-[2000] bg-[#0a0a0c]/80 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-400 font-medium">Calibrating Map...</span>
          </div>
        </div>
      )}

      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%', background: '#0a0a0c' }} 
        zoomControl={false}
      >
        <MapEvents onBoundsChange={fetchMapData} />
        {/* Dark Mode Map Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {stories.filter(s => s.latitude !== undefined && s.longitude !== undefined).map((story: any) => (
          <Marker 
            key={story.id} 
            position={[story.latitude, story.longitude]} 
            icon={createAvatarIcon(story.username, story.avatar_url ? `http://localhost:8080${story.avatar_url}` : undefined)}
          >
            <Popup className="custom-popup">
              <div className="bg-[#1a1a1c] text-white p-2 rounded-lg border border-white/10 min-w-[200px]">
                <div className="aspect-[9/16] rounded-xl overflow-hidden mb-2 bg-white/5 relative shadow-2xl">
                   <img src={`http://localhost:8080${story.media_url}`} alt="Story" className="w-full h-full object-cover" />
                   <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-[10px] font-black uppercase text-yellow-400">Live Story</p>
                   </div>
                </div>
                <div className="flex items-center justify-between px-1">
                  <div>
                    <p className="text-xs font-bold">@{story.username}</p>
                    <p className="text-[10px] text-gray-400">{new Date(story.created_at).toLocaleTimeString()}</p>
                  </div>
                  <div 
                    onClick={() => onStorySelect?.(story.id)}
                    className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform"
                  >
                    <Navigation className="w-4 h-4 fill-current text-white" />
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {showHeatmap && heatmap.filter(p => (p.latitude !== undefined || p.lat !== undefined) && (p.longitude !== undefined || p.lng !== undefined)).map((point: any, idx: number) => (
          <Marker 
            key={`heat-${idx}`}
            position={[point.latitude || point.lat, point.longitude || point.lng]}
            icon={new L.DivIcon({
              html: `<div class="w-24 h-24 bg-gradient-to-tr from-yellow-400/30 to-orange-500/30 rounded-full blur-2xl animate-pulse"></div>`,
              className: 'heatmap-icon',
              iconSize: [96, 96],
            })}
          />
        ))}
      </MapContainer>

      {/* Stats Floating Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex items-center space-x-6 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full shadow-2xl">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{stories.length} Stories</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{heatmap.length} Active Hotspots</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-3 h-3 text-purple-400" />
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest px-1">Global Discovery</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
