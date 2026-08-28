import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api } from '../api/client.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  requiresPayment: boolean;
  paywallOpen: boolean;
  setPaywallOpen: (open: boolean) => void;
  login: (emailOrHandle: string, pass: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; handle: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  activateSubscription: (updatedUser?: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [paywallOpen, setPaywallOpen] = useState<boolean>(false);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('devos_token');
      if (token) {
        const res = await api.getMe();
        if (res.user) {
          setUser(res.user);
          if (res.user.role !== 'ADMIN' && res.user.subscription_status === 'PENDING_PAYMENT') {
            setPaywallOpen(true);
          }
          return;
        }
      }

      // Guest Boot (Student demo account)
      const bootRes = await api.login('student@devos.academy', 'student123');
      api.setToken(bootRes.token);
      setUser(bootRes.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check URL query parameters for return from Stripe checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const sessionId = params.get('session_id');

    if (payment === 'success' && sessionId) {
      api.verifySession(sessionId).then(res => {
        if (res.success && res.user) {
          setUser(res.user);
          setPaywallOpen(false);
          // Remove query params from url cleanly
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }).catch(() => {});
    }

    refreshUser();
  }, []);

  const login = async (emailOrHandle: string, pass: string) => {
    const res = await api.login(emailOrHandle, pass);
    api.setToken(res.token);
    setUser(res.user);
    if (res.user.role !== 'ADMIN' && res.user.subscription_status === 'PENDING_PAYMENT') {
      setPaywallOpen(true);
    } else {
      setPaywallOpen(false);
    }
  };

  const register = async (data: { email: string; password: string; name: string; handle: string }) => {
    const res = await api.register(data);
    api.setToken(res.token);
    setUser(res.user);
    // New registrations are immediately directed to the paywall / checkout
    setPaywallOpen(true);
  };

  const activateSubscription = (updatedUser?: User) => {
    if (updatedUser) {
      setUser(updatedUser);
    } else if (user) {
      setUser({ ...user, subscription_status: 'ACTIVE' });
    }
    setPaywallOpen(false);
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    setPaywallOpen(false);
    refreshUser();
  };

  const requiresPayment = !!user && user.role !== 'ADMIN' && user.subscription_status === 'PENDING_PAYMENT';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      requiresPayment, 
      paywallOpen, 
      setPaywallOpen, 
      login, 
      register, 
      logout, 
      refreshUser,
      activateSubscription 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
