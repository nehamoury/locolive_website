import api from './api';
import type {
  AdminStats,
  AdminUser,
  AdminReport,
  AdminCrossing,
} from '../types/admin';

export interface MapUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  lat: number;
  lng: number;
  online: boolean;
}

export const adminApi = {
  // Stats
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get<AdminStats>('/admin/stats');
    return data;
  },

  // Users
  getUsers: async (page: number = 1, pageSize: number = 20): Promise<{ items: AdminUser[]; total: number }> => {
    const { data } = await api.get<{ items: AdminUser[]; total: number }>('/admin/users', {
      params: { page, page_size: pageSize },
    });
    return data;
  },

  // Search Users
  searchUsers: async (query: string, page: number = 1, pageSize: number = 20): Promise<{ items: AdminUser[]; total: number }> => {
    const { data } = await api.get<{ items: AdminUser[]; total: number }>('/admin/users/search', {
      params: { q: query, page, page_size: pageSize },
    });
    return data;
  },

  banUser: async (userId: string, ban: boolean): Promise<AdminUser> => {
    const { data } = await api.post<AdminUser>('/admin/users/ban', { user_id: userId, ban });
    return data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  // Map
  getMapActiveUsers: async (): Promise<{ users: MapUser[]; total: number }> => {
    const { data } = await api.get<{ users: MapUser[]; total: number }>('/admin/map/active');
    return data;
  },

  // Crossings
  getCrossings: async (page: number = 1, pageSize: number = 20): Promise<{ items: AdminCrossing[]; total: number }> => {
    const { data } = await api.get<{ items: AdminCrossing[]; total: number }>('/admin/crossings', {
      params: { page, page_size: pageSize },
    });
    return data;
  },

  // Stories/Reels (Admin perspective)
  getStories: async (page: number = 1, pageSize: number = 20): Promise<{ items: any[]; total: number }> => {
    const { data } = await api.get<{ items: any[]; total: number }>('/admin/stories', {
      params: { page, page_size: pageSize },
    });
    return data;
  },

  deleteStory: async (storyId: string): Promise<void> => {
    await api.delete(`/admin/stories/${storyId}`);
  },

  // Reports
  getReports: async (resolved?: boolean, page: number = 1, pageSize: number = 20): Promise<{ items: AdminReport[]; total: number }> => {
    const { data } = await api.get<{ items: AdminReport[]; total: number }>('/admin/reports', {
      params: { resolved, page, page_size: pageSize },
    });
    return data;
  },

  resolveReport: async (reportId: string): Promise<AdminReport> => {
    const { data } = await api.put<AdminReport>(`/admin/reports/${reportId}/resolve`);
    return data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/admin/logout');
  },
};

export default adminApi;