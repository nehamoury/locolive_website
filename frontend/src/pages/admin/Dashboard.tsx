import { useEffect } from 'react';
import { StatsCard } from '../../components/admin/StatsCard';
import { AnalyticsChart } from '../../components/admin/AnalyticsChart';
import { LiveActivityPanel } from '../../components/admin/LiveActivity';
import { QuickActions } from '../../components/admin/QuickActions';
import { LocationRankings } from '../../components/admin/LocationRankings';
import { useAdminStore } from '../../stores/adminStore';

export function Dashboard() {
  const { stats, dailyStats, activities, locations, setStats, setDailyStats, setActivities, setLocations } = useAdminStore();

  useEffect(() => {
    setStats({
      totalUsers: 125430,
      totalUsersGrowth: 12.5,
      activeUsers: 8247,
      crossingsToday: 3892,
      newConnections: 1247,
      reelsUploaded: 892,
    });

    setDailyStats([
      { date: 'Mon', users: 5200 },
      { date: 'Tue', users: 6100 },
      { date: 'Wed', users: 5800 },
      { date: 'Thu', users: 7200 },
      { date: 'Fri', users: 6800 },
      { date: 'Sat', users: 7900 },
      { date: 'Sun', users: 8247 },
    ]);

    setActivities([
      { id: '1', type: 'user_joined', description: 'New user @priya_singh joined', timestamp: new Date().toISOString() },
      { id: '2', type: 'crossing_detected', description: 'Crossing detected near MG Road', timestamp: new Date(Date.now() - 30000).toISOString() },
      { id: '3', type: 'reel_uploaded', description: 'User @raj_kumar uploaded a reel', timestamp: new Date(Date.now() - 60000).toISOString() },
      { id: '4', type: 'user_online', description: 'User @alex_m went online', timestamp: new Date(Date.now() - 90000).toISOString() },
    ]);

    setLocations([
      { city: 'Bangalore', activeUsers: 12450, country: 'India' },
      { city: 'Mumbai', activeUsers: 8920, country: 'India' },
      { city: 'Delhi NCR', activeUsers: 6540, country: 'India' },
      { city: 'Hyderabad', activeUsers: 4230, country: 'India' },
      { city: 'Chennai', activeUsers: 3180, country: 'India' },
    ]);
  }, [setStats, setDailyStats, setActivities, setLocations]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500">Real-time stats</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          growth={stats?.totalUsersGrowth}
          color="pink"
        />
        <StatsCard
          title="Active Users (Live)"
          value={stats?.activeUsers || 0}
          isLive
          color="green"
        />
        <StatsCard
          title="Crossings Today"
          value={stats?.crossingsToday || 0}
          color="orange"
        />
        <StatsCard
          title="New Connections"
          value={stats?.newConnections || 0}
          color="purple"
        />
        <StatsCard
          title="Reels Uploaded"
          value={stats?.reelsUploaded || 0}
          color="blue"
        />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsChart data={dailyStats} title="Active Users - Last 7 Days" />
        </div>
        <div>
          <LiveActivityPanel activities={activities} />
        </div>
      </div>

      {/* Quick Actions & Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <div>
          <LocationRankings locations={locations} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;