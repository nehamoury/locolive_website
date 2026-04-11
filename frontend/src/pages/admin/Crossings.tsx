import { useState } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import type { AdminCrossing } from '../../types/admin';

const mockCrossings: AdminCrossing[] = [
  {
    id: '1',
    userA: { id: '1', username: 'priya_singh', displayName: 'Priya Singh', avatar: '', status: 'online', lastLocation: { lat: 12.9716, lng: 77.5946 }, connectionsCount: 234, crossingsCount: 56, createdAt: '', isBanned: false },
    userB: { id: '2', username: 'raj_kumar', displayName: 'Raj Kumar', avatar: '', status: 'online', lastLocation: { lat: 12.9716, lng: 77.5946 }, connectionsCount: 189, crossingsCount: 42, createdAt: '', isBanned: false },
    time: new Date(Date.now() - 300000).toISOString(),
    location: { lat: 12.9716, lng: 77.5946 },
    distance: 25,
  },
  {
    id: '2',
    userA: { id: '3', username: 'alex_m', displayName: 'Alex Martinez', avatar: '', status: 'offline', lastLocation: { lat: 19.076, lng: 72.8777 }, connectionsCount: 456, crossingsCount: 89, createdAt: '', isBanned: false },
    userB: { id: '4', username: 'sarah_j', displayName: 'Sarah Johnson', avatar: '', status: 'online', lastLocation: { lat: 19.076, lng: 72.8777 }, connectionsCount: 312, crossingsCount: 67, createdAt: '', isBanned: false },
    time: new Date(Date.now() - 600000).toISOString(),
    location: { lat: 19.076, lng: 72.8777 },
    distance: 45,
  },
  {
    id: '3',
    userA: { id: '5', username: 'mike_chen', displayName: 'Mike Chen', avatar: '', status: 'offline', lastLocation: { lat: 17.385, lng: 78.4867 }, connectionsCount: 78, crossingsCount: 12, createdAt: '', isBanned: false },
    userB: { id: '1', username: 'priya_singh', displayName: 'Priya Singh', avatar: '', status: 'online', lastLocation: { lat: 17.385, lng: 78.4867 }, connectionsCount: 234, crossingsCount: 56, createdAt: '', isBanned: false },
    time: new Date(Date.now() - 900000).toISOString(),
    location: { lat: 17.385, lng: 78.4867 },
    distance: 15,
  },
];

function formatTime(timestamp: string) {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = Math.floor((now.getTime() - time.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function Crossings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [distanceFilter, setDistanceFilter] = useState<string>('all');

  const filteredCrossings = mockCrossings.filter(crossing => {
    const matchesSearch = 
      crossing.userA.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crossing.userB.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistance = distanceFilter === 'all' || 
      (distanceFilter === 'short' && crossing.distance < 30) ||
      (distanceFilter === 'medium' && crossing.distance >= 30 && crossing.distance < 50) ||
      (distanceFilter === 'long' && crossing.distance >= 50);
    return matchesSearch && matchesDistance;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Crossings Management</h1>
        <span className="text-sm text-gray-500">{filteredCrossings.length} crossings</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF006E]/20 focus:border-[#FF006E]"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={distanceFilter}
            onChange={(e) => setDistanceFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF006E]/20 focus:border-[#FF006E]"
          >
            <option value="all">All Distances</option>
            <option value="short">&lt; 30m</option>
            <option value="medium">30-50m</option>
            <option value="long">&gt; 50m</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User A</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User B</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Distance</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCrossings.map((crossing) => (
              <tr key={crossing.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF006E] to-[#833AB4] flex items-center justify-center">
                      <span className="text-xs font-medium text-white">{crossing.userA.displayName[0]}</span>
                    </div>
                    <span className="font-medium text-gray-900">{crossing.userA.displayName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#833AB4] to-[#FF006E] flex items-center justify-center">
                      <span className="text-xs font-medium text-white">{crossing.userB.displayName[0]}</span>
                    </div>
                    <span className="font-medium text-gray-900">{crossing.userB.displayName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatTime(crossing.time)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{crossing.location.lat.toFixed(4)}, {crossing.location.lng.toFixed(4)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {crossing.distance}m
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="px-3 py-1.5 bg-[#FF006E] text-white rounded-lg text-sm font-medium hover:bg-[#FF006E]/90 transition-colors">
                    View on Map
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Crossings;