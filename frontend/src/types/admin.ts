export interface AdminStats {
  totalUsers: number;
  newUsers24h: number;
  activeUsers: number;
  totalConnections: number;
  reelsToday: number;
  crossingsToday: number;
  totalUsersGrowth: number;
}


export interface AdminUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  email: string;
  role: string;
  status: 'online' | 'offline';
  is_banned: boolean;
  created_at: string;
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
  type: 'user_created' | 'crossing_detected' | 'reel_uploaded' | 'user_online';
  payload: any;
  timestamp: string;
}