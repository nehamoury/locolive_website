import { UserPlus, MapPin, Film, Wifi } from 'lucide-react';
import type { LiveActivity } from '../../types/admin';

interface LiveActivityProps {
  activities: LiveActivity[];
}

const iconMap = {
  user_joined: UserPlus,
  crossing_detected: MapPin,
  reel_uploaded: Film,
  user_online: Wifi,
};

const colorMap = {
  user_joined: 'bg-green-500',
  crossing_detected: 'bg-orange-500',
  reel_uploaded: 'bg-purple-500',
  user_online: 'bg-blue-500',
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

export function LiveActivityPanel({ activities }: LiveActivityProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Live Activity</h3>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-600 font-medium">Live</span>
        </span>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
        ) : (
          activities.slice(0, 20).map((activity) => {
            const Icon = iconMap[activity.type];
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full ${colorMap[activity.type]} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{activity.description}</p>
                  <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default LiveActivityPanel;