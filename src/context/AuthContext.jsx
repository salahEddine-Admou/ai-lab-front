import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persist = (data) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    return persist(data);
  };

  const register = async (name, email, password) => {
    const data = await api.register({ name, email, password });
    return persist(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    const { user: u } = await api.me();
    setUser(u);
    return u;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(({ user: u }) => setUser(u))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
