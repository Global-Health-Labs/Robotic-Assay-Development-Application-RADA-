import axios, { InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
  withCredentials: true,
});

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!config.url?.endsWith('/auth/login') && config.withCredentials !== false) {
    const token = localStorage.getItem('token');
    config.headers['Authorization'] = 'Bearer ' + token;
  }

  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  } else {
    delete config.headers['Content-Type'];
  }

  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && window.location.pathname !== '/login') {
      // Clear user data
      localStorage.removeItem('token');

      // Show error message
      toast.error(error.response.data.message || 'Session expired. Please log in again.');

      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
