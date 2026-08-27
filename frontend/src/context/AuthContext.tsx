import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api } from '../api/client.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrHandle: string, pass: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; handle: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      // If no token in localStorage, perform instant guest boot login as Cadet Developer
      if (!localStorage.getItem('devos_token')) {
        const bootRes = await api.login('student@devos.academy', 'student123');
        api.setToken(bootRes.token);
        setUser(bootRes.user);
        return;
      }
      const res = await api.getMe();
      if (res.user) {
        setUser(res.user);
      } else {
        const bootRes = await api.login('student@devos.academy', 'student123');
        api.setToken(bootRes.token);
        setUser(bootRes.user);
      }
    } catch {
      // Fallback guest login
      try {
        const bootRes = await api.login('student@devos.academy', 'student123');
        api.setToken(bootRes.token);
        setUser(bootRes.user);
      } catch {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (emailOrHandle: string, pass: string) => {
    const res = await api.login(emailOrHandle, pass);
    api.setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: { email: string; password: string; name: string; handle: string }) => {
    const res = await api.register(data);
    api.setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
