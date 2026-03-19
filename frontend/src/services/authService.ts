import api from './api';

export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  signup: (userData: any) => api.post('/auth/signup', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

export default authService;
