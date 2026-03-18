import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Users } from 'lucide-react';
import api from '../../lib/api';

// Fix for default marker icons in React-Leaflet
import 'leaflet/dist/leaflet.css';

// Custom Marker Icon for Stories
const storyIcon = new L.DivIcon({
  html: `<div class="w-8 h-8 bg-purple-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
          <div class="w-2 h-2 bg-white rounded-full"></div>
         </div>`,
  className: 'custom-div-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
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

const MapView = () => {
  const [stories, setStories] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [center, setCenter] = useState<[number, number]>([28.6139, 77.2090]); // Default to Delhi
  const [loading, setLoading] = useState(true);

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
      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl max-w-xs">
          <div className="flex items-center space-x-2 text-purple-400 mb-2">
            <Navigation className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">Live Discovery</span>
          </div>
          <p className="text-xs text-gray-300">Discover active stories and hotspots around you in real-time.</p>
        </div>
        
        <div className="flex bg-white/10 backdrop-blur-md border border-white/20 p-1 rounded-xl shadow-lg w-fit">
          <button className="px-3 py-1.5 rounded-lg bg-purple-600 text-[10px] font-bold uppercase transition-all">Stories</button>
          <button className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase text-gray-400 hover:text-white transition-all">Heatmap</button>
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
            icon={storyIcon}
          >
            <Popup className="custom-popup">
              <div className="bg-[#1a1a1c] text-white p-2 rounded-lg border border-white/10 min-w-[150px]">
                <div className="aspect-square rounded-md overflow-hidden mb-2 bg-white/5">
                   <img src={`http://localhost:8080${story.media_url}`} alt="Story" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-medium">@{story.username}</p>
                <p className="text-[10px] text-gray-400">{new Date(story.created_at).toLocaleTimeString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {heatmap.filter(p => (p.latitude !== undefined || p.lat !== undefined) && (p.longitude !== undefined || p.lng !== undefined)).map((point: any, idx: number) => (
          <Marker 
            key={`heat-${idx}`}
            position={[point.latitude || point.lat, point.longitude || point.lng]}
            icon={new L.DivIcon({
              html: `<div class="w-12 h-12 bg-indigo-500/20 rounded-full blur-xl border border-indigo-500/30"></div>`,
              className: 'heatmap-icon',
              iconSize: [48, 48],
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
