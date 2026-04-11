import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { UserTable } from '../../components/admin/UserTable';
import { useAdminStore } from '../../stores/adminStore';
import type { AdminUser } from '../../types/admin';

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
    lastLocation: { lat: 19.076, lng: 72.8777 },
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
    status: 'offline',
    lastLocation: { lat: 28.6139, lng: 77.209 },
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
    lastLocation: { lat: 17.385, lng: 78.4867 },
    connectionsCount: 312,
    crossingsCount: 67,
    createdAt: '2024-04-05',
    isBanned: true,
  },
  {
    id: '5',
    username: 'mike_chen',
    displayName: 'Mike Chen',
    avatar: '',
    status: 'offline',
    lastLocation: null,
    connectionsCount: 78,
    crossingsCount: 12,
    createdAt: '2024-05-12',
    isBanned: false,
  },
];

export function Users() {
  const { users, setUsers } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'offline' | 'banned'>('all');

  useEffect(() => {
    setUsers(mockUsers);
  }, [setUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'online') return matchesSearch && user.status === 'online';
    if (filter === 'offline') return matchesSearch && user.status === 'offline';
    if (filter === 'banned') return matchesSearch && user.isBanned;
    return matchesSearch;
  });

  const handleBan = (user: AdminUser, ban: boolean) => {
    setUsers(users.map(u => u.id === user.id ? { ...u, isBanned: ban } : u));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <span className="text-sm text-gray-500">{filteredUsers.length} users</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF006E]/20 focus:border-[#FF006E]"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF006E]/20 focus:border-[#FF006E]"
          >
            <option value="all">All Users</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <UserTable
        users={filteredUsers}
        onBan={handleBan}
        onViewOnMap={(user) => console.log('View on map:', user.displayName)}
      />
    </div>
  );
}

export default Users;