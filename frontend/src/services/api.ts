import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token and handle FormData
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If the data is FormData, remove Content-Type so the browser 
    // sets it automatically with the correct multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Global 401 caught. Clearing session...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already on an auth page
      if (!window.location.pathname.includes('/auth') && window.location.pathname !== '/') {
        window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;
