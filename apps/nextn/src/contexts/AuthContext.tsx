'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { authApi } from '@/lib/api';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email?: string;
  userId?: string;
  name: string;
  position?: string;
  profileImage?: string;
  department?: string;
  departmentId?: string;
  isAdmin: boolean;
  allowedTools: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    department: string,
    username: string,
    password: string
  ) => Promise<void>;
  loginById: (userId: string, password: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from cookies
    const token = Cookies.get('token');
    const savedUser = Cookies.get('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        Cookies.remove('token');
        Cookies.remove('user');
      }
    }

    setLoading(false);
  }, []);

  const login = async (
    department: string,
    username: string,
    password: string
  ) => {
    try {
      const response = await authApi.login(department, username, password);
      const { user, token } = response;

      // Save to cookies (expires in 7 days)
      Cookies.set('token', token, { expires: 7, sameSite: 'strict' });
      Cookies.set('user', JSON.stringify(user), {
        expires: 7,
        sameSite: 'strict',
      });
      setUser(user);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Нэвтрэх үед алдаа гарлаа'
      );
    }
  };

  const loginById = async (userId: string, password: string) => {
    try {
      const response = await authApi.loginById(userId, password);
      const { user, token } = response;

      // Save to cookies (expires in 7 days)
      Cookies.set('token', token, { expires: 7, sameSite: 'strict' });
      Cookies.set('user', JSON.stringify(user), {
        expires: 7,
        sameSite: 'strict',
      });
      setUser(user);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Нэвтрэх үед алдаа гарлаа'
      );
    }
  };

  const adminLogin = async (username: string, password: string) => {
    try {
      const response = await authApi.adminLogin(username, password);
      const { user, token } = response;

      if (!user.isAdmin) {
        throw new Error('Та админ эрхгүй байна');
      }

      // Save to cookies (expires in 7 days)
      Cookies.set('token', token, { expires: 7, sameSite: 'strict' });
      Cookies.set('user', JSON.stringify(user), {
        expires: 7,
        sameSite: 'strict',
      });
      setUser(user);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Нэвтрэх үед алдаа гарлаа'
      );
    }
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginById, adminLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
