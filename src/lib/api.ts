import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('homenest_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('homenest_token');
      localStorage.removeItem('homenest_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);

export const register = (data: { name: string; email: string; password: string; role: string }) =>
  api.post('/auth/register', data);

export const getMe = () => api.get('/auth/me');

export const googleAuth = (idToken: string) =>
  api.post('/auth/google', { idToken });

// Properties
export const getProperties = (params?: Record<string, string>) =>
  api.get('/properties', { params });

export const getFeaturedProperties = () =>
  api.get('/properties/featured');

export const getPropertyById = (id: string) =>
  api.get(`/properties/${id}`);

export const createProperty = (data: FormData) =>
  api.post('/properties', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getMyProperties = () =>
  api.get('/properties/user/my');

export const deleteProperty = (id: string) =>
  api.delete(`/properties/${id}`);

// Reviews
export const getReviews = (propertyId: string) =>
  api.get(`/reviews/${propertyId}`);

export const addReview = (data: { propertyId: string; rating: number; comment: string }) =>
  api.post('/reviews', data);

// Contact
export const submitContact = (data: { name: string; email: string; subject: string; message: string }) =>
  api.post('/contact', data);

// Stats
export const getStats = () => api.get('/stats');

export default api;