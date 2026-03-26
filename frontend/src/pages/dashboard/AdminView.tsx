import { useState, useEffect, type FC } from 'react';
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Shield, 
  Trash2, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Activity,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface AdminStats {
  users: {
    total_users: number;
    new_users_24h: number;
    active_users_1h: number;
  };
  stories: {
    total_stories: number;
    active_stories: number;
  };
  analytics: {
    retention_rate_3d: number;
    retained_users_count: number;
    weekly_stories_per_user: number;
    crossing_conversion_rate: number;
  };
}

interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  is_verified: boolean;
  is_shadow_banned: boolean;
  created_at: string;
  last_active_at: string;
  avatar_url?: string;
}

const AdminView: FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 10;

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [currentPage]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', {
        params: { page: currentPage, page_size: pageSize }
      });
      setUsers(data.users || []);
      setTotalUsers(data.total || 0);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async (userId: string, currentBanStatus: boolean) => {
    try {
      await api.post('/admin/users/ban', {
        user_id: userId,
        ban: !currentBanStatus
      });
      toast.success(currentBanStatus ? 'User unbanned' : 'User banned');
      setUsers(users.map(u => u.id === userId ? { ...u, is_shadow_banned: !currentBanStatus } : u));
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, {
        user_id: userId,
        role: newRole
      });
      toast.success(`Role updated to ${newRole}`);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 h-full bg-[#F8F9FA] overflow-y-auto no-scrollbar pb-20 font-poppins">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 font-medium">Manage users and monitor system performance</p>
          </div>
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 px-4 py-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">System Health</p>
              <p className="text-sm font-black text-green-500 flex items-center gap-1.5 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Optimal
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            icon={<Users className="w-6 h-6" />}
            label="Total Users"
            value={stats?.users.total_users || 0}
            trend="+12%"
            color="bg-blue-500"
          />
          <StatCard 
            icon={<UserPlus className="w-6 h-6" />}
            label="New (24h)"
            value={stats?.users.new_users_24h || 0}
            trend="+5%"
            color="bg-[#FF3B8E]"
          />
          <StatCard 
            icon={<Activity className="w-6 h-6" />}
            label="Active Now"
            value={stats?.users.active_users_1h || 0}
            trend="Live"
            color="bg-green-500"
          />
          <StatCard 
            icon={<TrendingUp className="w-6 h-6" />}
            label="Stories Active"
            value={stats?.stories.active_stories || 0}
            trend="Healthy"
            color="bg-orange-500"
          />
        </div>

        {/* User Management Section */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-gray-900">User Management</h2>
            <div className="relative group max-w-sm w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#FF3B8E] transition-colors" />
              <input 
                type="text" 
                placeholder="Search by username, name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#FF3B8E]/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-4 border-gray-100 border-t-[#FF3B8E] rounded-full animate-spin" />
                          <p className="text-sm font-bold text-gray-400">Loading system data...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-bold">
                        No users found matching your criteria
                      </td>
                    </tr>
                  ) : filteredUsers.map((user) => (
                    <motion.tr 
                      key={user.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF3B8E] to-[#A436EE] p-[2px]">
                            <div className="w-full h-full rounded-full bg-white overflow-hidden p-[1px]">
                              {user.avatar_url ? (
                                <img src={`http://localhost:8080${user.avatar_url}`} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-[#FF3B8E] font-bold text-xs uppercase">
                                  {user.username.charAt(0)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                            <p className="text-xs font-semibold text-gray-400">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <select 
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-gray-50 border-none rounded-xl text-xs font-bold px-3 py-1.5 outline-none focus:ring-1 focus:ring-purple-200 transition-all cursor-pointer hover:bg-gray-100"
                        >
                          <option value="user">User</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            user.is_shadow_banned 
                              ? 'bg-red-50 text-red-500' 
                              : 'bg-green-50 text-green-500'
                          }`}>
                            {user.is_shadow_banned ? 'Banned' : 'Active'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 outline-none">
                          <button 
                            onClick={() => handleBanToggle(user.id, user.is_shadow_banned)}
                            title={user.is_shadow_banned ? 'Unban User' : 'Ban User'}
                            className={`p-2 rounded-xl transition-all ${
                              user.is_shadow_banned 
                                ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                                : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                            }`}
                          >
                            {user.is_shadow_banned ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete User"
                            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-8 py-4 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400">
              Showing {Math.min((currentPage - 1) * pageSize + 1, totalUsers)} to {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-xl hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all border border-transparent hover:border-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-gray-900 px-3">{currentPage}</span>
              <button 
                disabled={currentPage * pageSize >= totalUsers}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-xl hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all border border-transparent hover:border-gray-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend, color }: { icon: any, label: string, value: any, trend: string, color: string }) => (
  <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50 hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-[0.03] rounded-bl-[100px] transition-all group-hover:scale-110`} />
    <div className="flex items-center gap-4 mb-4">
      <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shadow-lg shadow-gray-100`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-gray-900 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${trend === 'Live' ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`} />
      <span className="text-[11px] font-bold text-green-600">{trend}</span>
    </div>
  </div>
);

export default AdminView;
