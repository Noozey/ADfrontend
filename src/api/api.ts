import axios from "axios";

const API_URL = "/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export interface DailyBreakdown {
  date: string;
  revenue: number;
  expense: number;
}

export interface FinancialReportResponse {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  dailyBreakdown: DailyBreakdown[];
}

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
  role: "Customer" | "Staff" | "Admin";
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
}

export interface UpdateNamePayload {
  fullName: string;
}
export interface UpdateEmailPayload {
  newEmail: string;
  currentPassword: string;
}
export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
export interface UpdatePhonePayload {
  phoneNumber: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),
  register: (data: RegisterData) =>
    api.post<AuthResponse>("/auth/register", { ...data, role: data.role }),
};

export const reportsApi = {
  getFinancialReport: (start: string, end: string) =>
    api.get<FinancialReportResponse>("/reports/financial", {
      params: { start, end },
    }),
};

export const partsApi = {
  getAll: () => api.get("/parts"),
  getPublic: () => api.get("/parts/public"),
  getById: (id: number) => api.get(`/parts/${id}`),
  create: (data: any) => api.post("/parts", data),
  update: (id: number, data: any) => api.put(`/parts/${id}`, data),
  delete: (id: number) => api.delete(`/parts/${id}`),
};

export const usersApi = {
  getAll: () => api.get("/users"),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post("/users", data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const customersApi = {
  getAll: () => api.get<CustomerDto[]>("/customers"),
  getById: (id: string | number) => api.get<CustomerDto>(`/customers/${id}`),
  getOverview: (id: string | number) => api.get(`/customers/${id}/overview`),
  getHistory: (id: string | number) => api.get(`/customers/${id}/history`),
  getMyHistory: () => api.get("/customers/me/history"),
  registerWithVehicle: (data: any) =>
    api.post("/customers/register-with-vehicle", data),
  search: (term: string) =>
    api.get<CustomerDto[]>(`/customers/search?term=${encodeURIComponent(term)}`),
};

export interface SaleInvoiceItemDto {
  itemId: number;
  partId: number;
  partName: string;
  quantity: number;
  unitPriceAtSale: number;
  lineTotal: number;
}

export interface SaleInvoiceDto {
  invoiceId: number;
  customerId: string;
  customerName: string;
  staffId: string;
  staffName: string;
  saleDate: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: string;
  items: SaleInvoiceItemDto[];
}

export interface CustomerDto {
  customerId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export const saleInvoicesApi = {
  create: (data: any) => api.post("/saleinvoices", data),
  createMine: (data: { paymentStatus?: string; dueDate?: string; items: { partId: number; quantity: number }[] }) =>
    api.post<SaleInvoiceDto>("/saleinvoices/me", data),
  getMine: () => api.get<SaleInvoiceDto[]>("/saleinvoices/me"),
  getAll: () => api.get<SaleInvoiceDto[]>("/saleinvoices"),
  getById: (id: number) => api.get<SaleInvoiceDto>(`/saleinvoices/${id}`),
  getByCustomer: (customerId: string) =>
    api.get<SaleInvoiceDto[]>(`/saleinvoices/customer/${customerId}`),
};

export interface HighSpenderReportDto {
  customerId: string;
  customerName: string;
  email: string | null;
  phone: string | null;
  totalSpent: number;
  lastPurchaseDate: string;
}

export interface RegularCustomerReportDto {
  customerId: string;
  customerName: string;
  email: string | null;
  phone: string | null;
  totalInvoices: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
}

export interface PendingCreditReportDto {
  customerId: string;
  customerName: string;
  email: string | null;
  phone: string | null;
  invoiceId: number;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paymentStatus: string;
  daysOverdue: number | null;
}

export const customerReportsApi = {
  getHighSpenders: (fromDate?: string, toDate?: string) =>
    api.get<HighSpenderReportDto[]>("/CustomerReports/high-spenders", {
      params: { fromDate, toDate },
    }),
  getRegularCustomers: (fromDate?: string, toDate?: string) =>
    api.get<RegularCustomerReportDto[]>("/CustomerReports/regular-customers", {
      params: { fromDate, toDate },
    }),
  getPendingCredits: (fromDate?: string, toDate?: string) =>
    api.get<PendingCreditReportDto[]>("/CustomerReports/pending-credits", {
      params: { fromDate, toDate },
    }),
};

export interface VehicleDto {
  vehicleId: number;
  vehicleNumber: string;
  make: string;
  model: string;
  mileage: number;
}

export interface AppointmentDto {
  appointmentId: number;
  customerId: string;
  customerName: string;
  vehicleId: number;
  vehicleNumber: string;
  appointmentDate: string;
  description: string | null;
  status: string;
  createdAt: string;
}

export interface ReviewDto {
  id: number;
  customerName: string;
  appointmentId: number;
  content: string;
  rating: number | null;
  createdAt: string;
}

export interface PartRequestDto {
  id: number;
  customerName: string;
  partName: string;
  description: string | null;
  status: string;
  createdAt: string;
}

export const vehiclesApi = {
  create: (data: { vehicleNumber: string; make: string; model: string; mileage: number }) =>
    api.post<VehicleDto>("/vehicles", data),
  getMine: () => api.get<VehicleDto[]>("/vehicles/me"),
  getByCustomer: (customerId: string | number) =>
    api.get(`/vehicles/customer/${customerId}`),
  createMine: (data: { vehicleNumber: string; make: string; model: string; mileage: number }) =>
    api.post<VehicleDto>("/vehicles/me", data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
};

export const vendorsApi = {
  getAll: () => api.get("/vendors"),
  getById: (id: number) => api.get(`/vendors/${id}`),
  create: (data: any) => api.post("/vendors", data),
  update: (id: number, data: any) => api.put(`/vendors/${id}`, data),
  delete: (id: number) => api.delete(`/vendors/${id}`),
};

export const appointmentsApi = {
  book: (data: { vehicleId: number; appointmentDate: string; description?: string }) =>
    api.post<AppointmentDto>("/appointments", data),
  getMine: () => api.get<AppointmentDto[]>("/appointments/mine"),
  cancel: (id: number) => api.put(`/appointments/${id}/cancel`, {}),
  getAll: () => api.get<AppointmentDto[]>("/appointments"),
  updateStatus: (id: number, status: string) =>
    api.put<AppointmentDto>(`/appointments/${id}/status`, { status }),
};

export const reviewsApi = {
  create: (data: { appointmentId: number; content: string; rating?: number }) =>
    api.post<ReviewDto>("/reviews", data),
  getMine: () => api.get<ReviewDto[]>("/reviews/mine"),
  getAll: () => api.get<ReviewDto[]>("/reviews"),
};

export const partRequestsApi = {
  submit: (data: { partName: string; description?: string }) =>
    api.post<PartRequestDto>("/partrequests", data),
  getMine: () => api.get<PartRequestDto[]>("/partrequests/mine"),
  getAll: () => api.get<PartRequestDto[]>("/partrequests"),
  updateStatus: (id: number, status: string) =>
    api.put<PartRequestDto>(`/partrequests/${id}/status`, { status }),
};

export const profileApi = {
  get: () => api.get<ProfileResponse>("/profile"),
  updateName: (data: UpdateNamePayload) =>
    api.patch<ProfileResponse>("/profile/name", data),
  updateEmail: (data: UpdateEmailPayload) =>
    api.patch<ProfileResponse>("/profile/email", data),
  updatePassword: (data: UpdatePasswordPayload) =>
    api.patch<ProfileResponse>("/profile/password", data),
  updatePhone: (data: UpdatePhonePayload) =>
    api.patch<ProfileResponse>("/profile/phone", data),
};

export default api;
