import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface DemoAccount {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  student_profile?: {
    id: string;
    grade: string;
    class_name: string;
  } | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  demoAccounts: DemoAccount[];
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  switchUser: (userId: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('plj_user_id'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);

  // Fetch demo accounts for login screen reference
  useEffect(() => {
    fetch('/api/auth/demo-accounts')
      .then(res => res.json())
      .then(data => {
        if (data.users) setDemoAccounts(data.users);
      })
      .catch(err => console.error('Failed to load demo accounts:', err));
  }, []);

  const refreshUser = async () => {
    const activeToken = token || localStorage.getItem('plj_user_id');
    if (!activeToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'x-user-id': activeToken,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('plj_user_id');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email: string, password: string = 'password123'): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem('plj_user_id', data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Login gagal.' };
    } catch (e: any) {
      console.error('Login error:', e);
      return { success: false, error: e.message || 'Terjadi kesalahan jaringan.' };
    } finally {
      setIsLoading(false);
    }
  };

  const switchUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        localStorage.setItem('plj_user_id', data.token);
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error switching user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('plj_user_id');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        demoAccounts,
        login,
        switchUser,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
