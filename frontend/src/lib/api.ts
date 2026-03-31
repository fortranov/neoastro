import axios, { AxiosInstance, AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  is_admin: boolean;
}

export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_blocked: boolean;
  is_admin: boolean;
  plan_type: "trial" | "basic" | "pro";
  email_verified: boolean;
  created_at: string;
}

export interface PublicSettings {
  google_oauth_enabled: boolean;
  email_confirmation_enabled: boolean;
}

export const authApi = {
  register: async (data: RegisterData) => {
    const res = await api.post("/api/auth/register", data);
    return res.data;
  },
  login: async (data: LoginData): Promise<{ data: AuthResponse; message: string }> => {
    const res = await api.post("/api/auth/login", data);
    return res.data;
  },
  getMe: async (): Promise<{ data: User }> => {
    const res = await api.get("/api/auth/me");
    return res.data;
  },
  getPublicSettings: async (): Promise<{ data: PublicSettings }> => {
    const res = await api.get("/api/auth/settings-public");
    return res.data;
  },
  verifyEmail: async (token: string) => {
    const res = await api.post(`/api/auth/verify-email?token=${token}`);
    return res.data;
  },
};

// --- Admin ---
export interface AdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UserUpdate {
  plan_type?: "trial" | "basic" | "pro";
  is_blocked?: boolean;
  is_admin?: boolean;
}

export const adminApi = {
  getUsers: async (params: AdminUsersParams = {}) => {
    const res = await api.get("/api/admin/users", { params });
    return res.data;
  },
  updateUser: async (id: number, data: UserUpdate) => {
    const res = await api.patch(`/api/admin/users/${id}`, data);
    return res.data;
  },
  deleteUser: async (id: number) => {
    const res = await api.delete(`/api/admin/users/${id}`);
    return res.data;
  },
  getSettings: async (): Promise<{ data: Record<string, string> }> => {
    const res = await api.get("/api/admin/settings");
    return res.data;
  },
  updateSettings: async (settings: Record<string, string>) => {
    const res = await api.put("/api/admin/settings", { settings });
    return res.data;
  },
};

// --- Services ---
export interface NatalChartRequest {
  name: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  latitude: number;
  longitude: number;
}

export interface ForecastRequest {
  birth_date: string;
  birth_time: string;
  birth_place: string;
  period: "daily" | "weekly" | "monthly";
}

export interface TarotRequest {
  question: string;
  spread_type: "one_card" | "three_card" | "celtic_cross";
}

export const servicesApi = {
  natalChart: async (data: NatalChartRequest) => {
    const res = await api.post("/api/services/natal-chart", data);
    return res.data;
  },
  forecast: async (data: ForecastRequest) => {
    const res = await api.post("/api/services/forecast", data);
    return res.data;
  },
  tarot: async (data: TarotRequest) => {
    const res = await api.post("/api/services/tarot", data);
    return res.data;
  },
};
