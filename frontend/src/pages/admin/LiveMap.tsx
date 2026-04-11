import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Users, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { AdminUser } from '../../types/admin';

const pinkIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF006E" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface MapCenterProps {
  center: [number, number];
}

function MapCenter({ center }: MapCenterProps) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

const mockUsers: AdminUser[] = [
  {
    id: '1',
    username: 'priya_singh',
    displayName: 'Priya Singh',
    avatar: '',
    status: 'online',
    lastLocation: { lat: 12.9716, lng: 77.5946 },
    connectionsCount: 234,
    crossingsCount: 56,
    createdAt: '2024-01-15',
    isBanned: false,
  },
  {
    id: '2',
    username: 'raj_kumar',
    displayName: 'Raj Kumar',
    avatar: '',
    status: 'online',
    lastLocation: { lat: 12.9352, lng: 77.6245 },
    connectionsCount: 189,
    crossingsCount: 42,
    createdAt: '2024-02-20',
    isBanned: false,
  },
  {
    id: '3',
    username: 'alex_m',
    displayName: 'Alex Martinez',
    avatar: '',
    status: 'online',
    lastLocation: { lat: 12.9882, lng: 77.5711 },
    connectionsCount: 456,
    crossingsCount: 89,
    createdAt: '2024-03-10',
    isBanned: false,
  },
  {
    id: '4',
    username: 'sarah_j',
    displayName: 'Sarah Johnson',
    avatar: '',
    status: 'online',
    lastLocation: { lat: 13.0221, lng: 77.5678 },
    connectionsCount: 312,
    crossingsCount: 67,
    createdAt: '2024-04-05',
    isBanned: false,
  },
  {
    id: '5',
    username: 'mike_chen',
    displayName: 'Mike Chen',
    avatar: '',
    status: 'offline',
    lastLocation: { lat: 12.9012, lng: 77.6234 },
    connectionsCount: 78,
    crossingsCount: 12,
    createdAt: '2024-05-12',
    isBanned: false,
  },
];

export function LiveMap() {
  const [users] = useState<AdminUser[]>(mockUsers);
  const [view, setView] = useState<'users' | 'crossings' | 'heatmap'>('users');
  const [distance, setDistance] = useState<1 | 5 | 10>(5);
  const [center] = useState<[number, number]>([12.9716, 77.5946]);

  const onlineUsers = users.filter(u => u.status === 'online' && u.lastLocation);

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Live Map</h1>
        
        {/* Filters */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">View</label>
            <div className="flex gap-2">
              <button
                onClick={() => setView('users')}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'users' ? 'bg-[#FF006E] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users className="w-4 h-4" />
                Users
              </button>
              <button
                onClick={() => setView('crossings')}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'crossings' ? 'bg-[#FF006E] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Crossings
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Distance</label>
            <div className="flex gap-2">
              {[1, 5, 10].map(d => (
                <button
                  key={d}
                  onClick={() => setDistance(d as 1 | 5 | 10)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    distance === d ? 'bg-[#833AB4] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {d}km
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Live Now</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{onlineUsers.length}</p>
            <p className="text-xs text-gray-500">active users</p>
          </div>

          {/* User List */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Active Users</label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {onlineUsers.map(user => (
                <div key={user.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF006E] to-[#833AB4] flex items-center justify-center">
                    <span className="text-xs font-medium text-white">{user.displayName[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.displayName}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={13}
          className="h-full w-full"
          zoomControl={true}
        >
          <MapCenter center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {view === 'users' && (
            <MarkerClusterGroup chunkedLoading>
              {onlineUsers.map(user => user.lastLocation && (
                <Marker
                  key={user.id}
                  position={[user.lastLocation.lat, user.lastLocation.lng]}
                  icon={pinkIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold">{user.displayName}</p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          )}

          {view === 'crossings' && (
            <>
              {onlineUsers.map(user => user.lastLocation && (
                <Circle
                  key={user.id}
                  center={[user.lastLocation.lat, user.lastLocation.lng]}
                  radius={distance * 1000}
                  pathOptions={{
                    color: '#FF006E',
                    fillColor: '#FF006E',
                    fillOpacity: 0.1,
                  }}
                />
              ))}
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default LiveMap;