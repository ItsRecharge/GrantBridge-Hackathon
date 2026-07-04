import axios from 'axios';

const resolveApiUrl = () => {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    const configuredApiUrl = import.meta.env.VITE_API_URL;

    if (configuredApiUrl) {
      const isRemoteHost = hostname && hostname !== 'localhost' && hostname !== '127.0.0.1';
      const pointsToLocalhost = configuredApiUrl.includes('localhost') || configuredApiUrl.includes('127.0.0.1');

      if (isRemoteHost && pointsToLocalhost) {
        return `${protocol}//${hostname}:5001/api`;
      }

      return configuredApiUrl;
    }

    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}:5001/api`;
    }
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  return '/api';
};

export const API_URL = resolveApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 if user is on a protected page
    // and the request was NOT a signup or login attempt
    if (error.response?.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/');
      if (!isAuthRoute) {
        // Token expired or invalid — clear and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    // Enhance error messages for network issues
    if (!error.response) {
      error.friendlyMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
    } else if (error.response.status === 500) {
      error.friendlyMessage = 'Something went wrong on our end. Please try again in a moment.';
    } else if (error.response.status === 403) {
      error.friendlyMessage = 'Your session has expired. Please log in again.';
    }

    return Promise.reject(error);
  },
);

export default api;
