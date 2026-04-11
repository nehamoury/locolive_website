import { Search, Activity, User, MapPin, Film, Shield, AlertTriangle, Info } from 'lucide-react';

const mockLogs = [
  { id: '1', type: 'user', action: 'user.login', description: 'User @priya_singh logged in', timestamp: new Date(Date.now() - 30000).toISOString() },
  { id: '2', type: 'location', action: 'location.update', description: 'Location updated for @raj_kumar', timestamp: new Date(Date.now() - 60000).toISOString() },
  { id: '3', type: 'crossing', action: 'crossing.detected', description: 'Crossing detected between @alex_m and @sarah_j', timestamp: new Date(Date.now() - 90000).toISOString() },
  { id: '4', type: 'content', action: 'reel.uploaded', description: 'New reel uploaded by @mike_chen', timestamp: new Date(Date.now() - 120000).toISOString() },
  { id: '5', type: 'admin', action: 'user.ban', description: 'User @fake_account banned', timestamp: new Date(Date.now() - 180000).toISOString() },
  { id: '6', type: 'system', action: 'cache.clear', description: 'Cache cleared successfully', timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: '7', type: 'safety', action: 'report.received', description: 'New report received', timestamp: new Date(Date.now() - 360000).toISOString() },
];

const iconMap = {
  user: User,
  location: MapPin,
  crossing: MapPin,
  content: Film,
  admin: Shield,
  system: Info,
  safety: AlertTriangle,
};

function formatTime(timestamp: string) {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = Math.floor((now.getTime() - time.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function ActivityPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Logs & Activity</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF006E]/20 focus:border-[#FF006E]"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-[#FF006E]" />
          <h2 className="font-semibold text-gray-900">System Logs</h2>
        </div>

        <div className="space-y-2">
          {mockLogs.map((log) => {
            const Icon = iconMap[log.type as keyof typeof iconMap] || Info;
            return (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-[#FF006E]/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#FF006E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{log.description}</p>
                  <p className="text-xs text-gray-500">{log.action}</p>
                </div>
                <span className="text-xs text-gray-500">{formatTime(log.timestamp)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ActivityPage;