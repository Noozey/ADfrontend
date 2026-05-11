import axios from 'axios';

const API_URL = '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface AuthResponse {
  success: boolean;
  message: string;
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  token: string;
  expiresAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
  address?: string;
  role: 'Customer' | 'Staff' | 'Admin';
}

export const authApi = {
  login: (email: string, password: string) => 
    api.post<AuthResponse>('/auth/login', { email, password }),
  register: (data: RegisterData) => 
    api.post<AuthResponse>('/auth/register', { ...data, role: data.role }),
};

export const partsApi = {
  getAll: () => api.get('/parts'),
  getById: (id: number) => api.get(`/parts/${id}`),
  create: (data: any) => api.post('/parts', data),
  update: (id: number, data: any) => api.put(`/parts/${id}`, data),
  delete: (id: number) => api.delete(`/parts/${id}`),
};

export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const customersApi = {
  getAll: () => api.get('/customers'),
  getById: (id: number) => api.get(`/customers/${id}`),
  search: (term: string) => api.get(`/customers/search?term=${encodeURIComponent(term)}`),
};

export const saleInvoicesApi = {
  create: (data: any) => api.post('/saleinvoices', data),
  getAll: () => api.get('/saleinvoices'),
  getById: (id: number) => api.get(`/saleinvoices/${id}`),
  getByCustomer: (customerId: number) => api.get(`/saleinvoices/customer/${customerId}`),
};

export default api;