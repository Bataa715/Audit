import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token нэмэх
api.interceptors.request.use(config => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - алдаа шийдвэрлэх
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 401 алдаа гарахад cookie устгах, redirect хийхгүй
      // Middleware redirect-г зохицуулна
      Cookies.remove('token');
      Cookies.remove('user');
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth APIs
export const authApi = {
  createUser: async (data: {
    password: string;
    name: string;
    department: string;
    position: string;
  }) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  login: async (department: string, username: string, password: string) => {
    const response = await api.post('/auth/login', {
      department,
      username,
      password,
    });
    return response.data;
  },

  loginById: async (userId: string, password: string) => {
    const response = await api.post('/auth/login-by-id', { userId, password });
    return response.data;
  },

  adminLogin: async (username: string, password: string) => {
    const response = await api.post('/auth/admin-login', {
      username,
      password,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getUsersByDepartment: async (department: string) => {
    const response = await api.get(
      `/auth/departments/${encodeURIComponent(department)}/users`
    );
    return response.data;
  },

  searchUsers: async (query: string) => {
    const response = await api.get(
      `/auth/users/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  },
};

// Users APIs
export const usersApi = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch(`/users/${id}/status`, { isActive });
    return response.data;
  },

  updateTools: async (id: string, allowedTools: string[]) => {
    const response = await api.patch(`/users/${id}/tools`, { allowedTools });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Departments APIs
export const departmentsApi = {
  create: async (data: {
    name: string;
    description?: string;
    manager?: string;
    employeeCount?: number;
  }) => {
    const response = await api.post('/departments', data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/departments');
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  getByName: async (name: string) => {
    const response = await api.get(
      `/departments/by-name/${encodeURIComponent(name)}`
    );
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/departments/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },
};

// Fitness APIs
export const fitnessApi = {
  // Get all dashboard data (exercises, workout logs, body stats)
  getDashboard: async () => {
    const response = await api.get('/fitness/dashboard');
    return response.data;
  },

  // Exercises
  getExercises: async () => {
    const response = await api.get('/fitness/exercises');
    return response.data;
  },

  createExercise: async (data: {
    name: string;
    category?: string;
    description?: string;
  }) => {
    const response = await api.post('/fitness/exercises', data);
    return response.data;
  },

  deleteExercise: async (id: string) => {
    const response = await api.delete(`/fitness/exercises/${id}`);
    return response.data;
  },

  // Workout Logs
  getWorkoutLogs: async (limit?: number) => {
    const response = await api.get('/fitness/workout-logs', {
      params: { limit },
    });
    return response.data;
  },

  createWorkoutLog: async (data: {
    exerciseId: string;
    sets?: number;
    repetitions?: number;
    weight?: number;
    notes?: string;
  }) => {
    const response = await api.post('/fitness/workout-logs', data);
    return response.data;
  },

  deleteWorkoutLog: async (id: string) => {
    const response = await api.delete(`/fitness/workout-logs/${id}`);
    return response.data;
  },

  // Body Stats
  getBodyStats: async (limit?: number) => {
    const response = await api.get('/fitness/body-stats', {
      params: { limit },
    });
    return response.data;
  },

  createBodyStats: async (data: { weight: number; height: number }) => {
    const response = await api.post('/fitness/body-stats', data);
    return response.data;
  },

  deleteBodyStats: async (id: string) => {
    const response = await api.delete(`/fitness/body-stats/${id}`);
    return response.data;
  },
};
