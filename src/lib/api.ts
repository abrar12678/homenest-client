import axios from 'axios';
import { toast } from 'react-toastify';

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

// Response interceptor — handle errors with toast
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === 'undefined') return Promise.reject(error);

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error;
      const url = error.config?.url || '';

      // Don't auto-redirect for auth endpoints
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/google');

      if (status === 401 && !isAuthEndpoint) {
        localStorage.removeItem('homenest_token');
        localStorage.removeItem('homenest_user');
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } else if (status === 403 && !isAuthEndpoint) {
        toast.error('You do not have permission for this action.');
      } else if (status === 404) {
        toast.error('Requested resource not found.');
      } else if (status === 429) {
        toast.warning('Too many requests. Please wait a moment.');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (message && isAuthEndpoint) {
        // Auth endpoint errors shown by the page itself
      } else if (message) {
        toast.error(message);
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
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

export const updateProfile = (data: { name?: string; phone?: string; avatar?: string }) =>
  api.put('/auth/profile', data);

export const googleAuth = (idToken: string) =>
  api.post('/auth/google', { idToken });

// Properties
export const getProperties = (params?: Record<string, string>) =>
  api.get('/properties', { params });

export const getFeaturedProperties = () =>
  api.get('/properties/featured');

export const getPropertyById = (id: string) =>
  api.get(`/properties/${id}`);

export const createProperty = (data: Record<string, unknown>) =>
  api.post('/properties', data);

export const getMyProperties = () =>
  api.get('/properties/user/my');

export const updateProperty = (id: string, data: Record<string, unknown>) =>
  api.put(`/properties/${id}`, data);

export const deleteProperty = (id: string) =>
  api.delete(`/properties/${id}`);

// Reviews
export const getReviews = (propertyId: string) =>
  api.get(`/reviews/${propertyId}`);

export const addReview = (data: { propertyId: string; rating: number; comment: string }) =>
  api.post('/reviews', data);

export const getMyReviewCount = () => api.get('/reviews/my/count');

// Contact
export const submitContact = (data: { name: string; email: string; subject: string; message: string }) =>
  api.post('/contact', data);

// Stats
export const getStats = () => api.get('/stats');

// Upload
export const uploadImage = (base64Image: string) =>
  api.post('/upload/image', { image: base64Image });

// Payments
export const createPaymentIntent = (propertyId: string, amount: number) =>
  api.post('/payments/create-intent', { propertyId, amount });

export const confirmPayment = (propertyId: string, paymentIntentId: string) =>
  api.post('/payments/confirm', { propertyId, paymentIntentId });

// Favorites
export const getFavorites = () => api.get('/favorites');
export const toggleFavorite = (propertyId: string) => api.post(`/favorites/${propertyId}`);
export const checkFavorite = (propertyId: string) => api.get(`/favorites/check/${propertyId}`);

// Inquiries
export const createInquiry = (data: { propertyId: string; message: string }) =>
  api.post('/inquiries', data);

export const getSentInquiries = (params?: Record<string, string>) =>
  api.get('/inquiries/sent', { params });

export const getReceivedInquiries = (params?: Record<string, string>) =>
  api.get('/inquiries/received', { params });

export const replyToInquiry = (id: string, reply: string) =>
  api.put(`/inquiries/${id}/reply`, { reply });

// Visits
export const scheduleVisit = (data: {
  propertyId: string;
  preferredDate: string;
  preferredTime: string;
  name: string;
  phone: string;
  message?: string;
}) => api.post('/visits', data);

export const getMyVisits = (params?: Record<string, string>) =>
  api.get('/visits/my', { params });

export const getReceivedVisits = (params?: Record<string, string>) =>
  api.get('/visits/received', { params });

export const updateVisitStatus = (visitId: string, status: string) =>
  api.patch(`/visits/${visitId}/status`, { status });

export const cancelMyVisit = (visitId: string) =>
  api.delete(`/visits/${visitId}`);

// Admin
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = (params?: Record<string, string>) =>
  api.get('/admin/users', { params });

export const updateAdminUserRole = (userId: string, role: string) =>
  api.put(`/admin/users/${userId}/role`, { role });

export const toggleAdminBan = (userId: string) =>
  api.put(`/admin/users/${userId}/ban`);

export const deleteAdminUser = (userId: string) =>
  api.delete(`/admin/users/${userId}`);

export const getAdminProperties = (params?: Record<string, string>) =>
  api.get('/admin/properties', { params });

export const updatePropertyStatus = (propertyId: string, status: string) =>
  api.put(`/admin/properties/${propertyId}/status`, { status });

export const deleteAdminProperty = (propertyId: string) =>
  api.delete(`/admin/properties/${propertyId}`);

export const getAdminReviews = (params?: Record<string, string>) =>
  api.get('/admin/reviews', { params });

export const deleteAdminReview = (reviewId: string) =>
  api.delete(`/admin/reviews/${reviewId}`);

export const getAdminMessages = (params?: Record<string, string>) =>
  api.get('/admin/messages', { params });

export const deleteAdminMessage = (messageId: string) =>
  api.delete(`/admin/messages/${messageId}`);

export const getAdminPayments = (params?: Record<string, string>) =>
  api.get('/admin/payments', { params });

export const getAdminInquiries = (params?: Record<string, string>) =>
  api.get('/admin/inquiries', { params });

export const deleteAdminInquiry = (inquiryId: string) =>
  api.delete(`/admin/inquiries/${inquiryId}`);

// Deals / Buying
export const createDeal = (data: {
  propertyId: string;
  offerAmount: number;
  message: string;
  financingMethod: string;
  phone: string;
}) => api.post('/deals', data);

export const getBuyerDeals = (params?: Record<string, string>) =>
  api.get('/deals/buyer', { params });

export const getSellerDeals = (params?: Record<string, string>) =>
  api.get('/deals/seller', { params });

export const counterOffer = (dealId: string, data: { amount: number; message: string }) =>
  api.put(`/deals/${dealId}/counter`, data);

export const acceptDeal = (dealId: string) =>
  api.put(`/deals/${dealId}/accept`);

export const rejectDeal = (dealId: string, data?: { reason?: string }) =>
  api.put(`/deals/${dealId}/reject`, data || {});

export const completeDeal = (dealId: string) =>
  api.put(`/deals/${dealId}/complete`);

export const withdrawDeal = (dealId: string) =>
  api.delete(`/deals/${dealId}`);

// Admin Deals
export const getAdminDeals = (params?: Record<string, string>) =>
  api.get('/admin/deals', { params });

export const deleteAdminDeal = (dealId: string) =>
  api.delete(`/admin/deals/${dealId}`);

// Stripe Deal Payment
export const createDealPaymentIntent = (dealId: string, customAmount?: number) =>
  api.post(`/deals/${dealId}/create-payment-intent`, { customAmount });

export const confirmDealPayment = (dealId: string, paymentIntentId: string) =>
  api.post(`/deals/${dealId}/confirm-payment`, { paymentIntentId });

export const getDealPaymentStatus = (dealId: string) =>
  api.get(`/deals/${dealId}/payment-status`);

export default api;