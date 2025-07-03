import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse } from '../types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken,
          });
          
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Generic API methods
export const apiClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.get(url, config).then(response => response.data),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.post(url, data, config).then(response => response.data),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.put(url, data, config).then(response => response.data),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.patch(url, data, config).then(response => response.data),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.delete(url, config).then(response => response.data),
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
    
  register: (userData: any) =>
    apiClient.post('/auth/register', userData),
    
  logout: () =>
    apiClient.post('/auth/logout'),
    
  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),
    
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
    
  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),
};

// User API
export const userAPI = {
  getProfile: () =>
    apiClient.get('/users/profile'),
    
  updateProfile: (data: any) =>
    apiClient.put('/users/profile', data),
    
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.put('/users/change-password', { currentPassword, newPassword }),
    
  deleteAccount: () =>
    apiClient.delete('/users/account'),
};

// Professional API
export const professionalAPI = {
  getAll: (params?: any) =>
    apiClient.get<PaginatedResponse<any>>('/professionals', { params }),
    
  getById: (id: string) =>
    apiClient.get(`/professionals/${id}`),
    
  create: (data: any) =>
    apiClient.post('/professionals', data),
    
  update: (id: string, data: any) =>
    apiClient.put(`/professionals/${id}`, data),
    
  delete: (id: string) =>
    apiClient.delete(`/professionals/${id}`),
};

// Listing API
export const listingAPI = {
  getAll: (params?: any) =>
    apiClient.get<PaginatedResponse<any>>('/listings', { params }),
    
  getById: (id: string) =>
    apiClient.get(`/listings/${id}`),
    
  create: (data: any) =>
    apiClient.post('/listings', data),
    
  update: (id: string, data: any) =>
    apiClient.put(`/listings/${id}`, data),
    
  delete: (id: string) =>
    apiClient.delete(`/listings/${id}`),
};

// Appointment API
export const appointmentAPI = {
  getAll: (params?: any) =>
    apiClient.get<PaginatedResponse<any>>('/appointments', { params }),
    
  getById: (id: string) =>
    apiClient.get(`/appointments/${id}`),
    
  create: (data: any) =>
    apiClient.post('/appointments', data),
    
  update: (id: string, data: any) =>
    apiClient.put(`/appointments/${id}`, data),
    
  cancel: (id: string) =>
    apiClient.delete(`/appointments/${id}`),
};

// Payment API
export const paymentAPI = {
  getWallet: () =>
    apiClient.get('/payments/wallet'),
    
  getTransactions: (params?: any) =>
    apiClient.get<PaginatedResponse<any>>('/payments/transactions', { params }),
    
  topUp: (amount: number, paymentMethodId: string) =>
    apiClient.post('/payments/topup', { amount, paymentMethodId }),
    
  withdraw: (amount: number) =>
    apiClient.post('/payments/withdraw', { amount }),
    
  processPayment: (data: any) =>
    apiClient.post('/payments/process', data),
};

// Message API
export const messageAPI = {
  getConversations: () =>
    apiClient.get('/messages'),
    
  getConversation: (userId: string) =>
    apiClient.get(`/messages/conversation/${userId}`),
    
  sendMessage: (data: any) =>
    apiClient.post('/messages', data),
    
  markAsRead: (messageIds: string[]) =>
    apiClient.put('/messages/read', { messageIds }),
};

// Admin API
export const adminAPI = {
  getDashboard: () =>
    apiClient.get('/admin/dashboard'),
    
  getUsers: (params?: any) =>
    apiClient.get<PaginatedResponse<any>>('/admin/users', { params }),
    
  updateUserStatus: (userId: string, status: string) =>
    apiClient.put(`/admin/users/${userId}/status`, { status }),
    
  getTransactions: (params?: any) =>
    apiClient.get<PaginatedResponse<any>>('/admin/transactions', { params }),
    
  getSettings: () =>
    apiClient.get('/admin/settings'),
    
  updateSettings: (data: any) =>
    apiClient.put('/admin/settings', data),
};

export default api;
