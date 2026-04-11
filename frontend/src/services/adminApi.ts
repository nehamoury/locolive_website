import api from './api';
import type {
  AdminStats,
  AdminUser,
  AdminReport,
} from '../types/admin';

export const adminApi = {
  // Stats
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get<AdminStats>('/admin/stats');
    return data;
  },

  // Users
  getUsers: async (page: number = 1, pageSize: number = 20): Promise<{ users: AdminUser[]; total: number }> => {
    const { data } = await api.get<{ users: AdminUser[]; total: number }>('/admin/users', {
      params: { page, page_size: pageSize },
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

  // Stories/Reels (Admin perspective)
  getStories: async (page: number = 1, pageSize: number = 20): Promise<any[]> => {
    const { data } = await api.get<any[]>('/admin/stories', {
      params: { page, page_size: pageSize },
    });
    return data;
  },

  deleteStory: async (storyId: string): Promise<void> => {
    await api.delete(`/admin/stories/${storyId}`);
  },

  // Reports
  getReports: async (resolved?: boolean, page: number = 1, pageSize: number = 20): Promise<AdminReport[]> => {
    const { data } = await api.get<AdminReport[]>('/admin/reports', {
      params: { resolved, page, page_size: pageSize },
    });
    return data;
  },

  resolveReport: async (reportId: string): Promise<AdminReport> => {
    const { data } = await api.put<AdminReport>(`/admin/reports/${reportId}/resolve`);
    return data;
  },
};

export default adminApi;