import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as auth from '../services/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.me()
      .then(res => {
        // Backend ApiResponse: { statusCode, data: "string message", message: actualPayload }
        setAdmin(res?.message || null);
      })
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const res = await auth.login(credentials);
    // Backend ApiResponse: { statusCode, data: "string message", message: { accessToken, refreshToken, loggedInAdmin } }
    const payload = res?.message;
    const adminData = payload?.loggedInAdmin ?? null;
    setAdmin(adminData);
    return res;
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch {
      /* ignore: best-effort logout */
    }
    setAdmin(null);
  };

  const value = useMemo(() => ({ admin, loading, login, logout }), [admin, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default useAuth;
