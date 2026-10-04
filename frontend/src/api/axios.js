import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1', // Uses direct connection with CORS
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptors here if needed (e.g., to attach JWT tokens to requests)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
