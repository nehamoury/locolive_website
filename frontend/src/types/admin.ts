export interface AdminStats {
  totalUsers: number;
  totalUsersGrowth: number;
  activeUsers: number;
  crossingsToday: number;
  newConnections: number;
  reelsUploaded: number;
}

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  status: 'online' | 'offline';
  lastLocation: {
    lat: number;
    lng: number;
  } | null;
  connectionsCount: number;
  crossingsCount: number;
  createdAt: string;
  isBanned: boolean;
}

export interface AdminCrossing {
  id: string;
  userA: AdminUser;
  userB: AdminUser;
  time: string;
  location: {
    lat: number;
    lng: number;
  };
  distance: number;
}

export interface AdminReel {
  id: string;
  videoUrl: string;
  thumbnail: string;
  user: AdminUser;
  likes: number;
  comments: number;
  isAI: boolean;
  isFlagged: boolean;
  createdAt: string;
}

export interface AdminReport {
  id: string;
  reporter: AdminUser;
  reported: AdminUser;
  type: 'user' | 'story' | 'reel' | 'post';
  contentId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'ignored';
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'broadcast' | 'targeted';
  targetGroup?: string;
  sentAt: string;
  deliveryCount: number;
}

export interface AppSettings {
  discoveryRadius: number;
  crossingDistance: number;
  locationUpdateInterval: number;
  reelsEnabled: boolean;
  crossingsEnabled: boolean;
}

export interface LocationStats {
  city: string;
  activeUsers: number;
  country: string;
}

export interface DailyStats {
  date: string;
  users: number;
}

export interface LiveActivity {
  id: string;
  type: 'user_joined' | 'crossing_detected' | 'reel_uploaded' | 'user_online';
  description: string;
  timestamp: string;
}