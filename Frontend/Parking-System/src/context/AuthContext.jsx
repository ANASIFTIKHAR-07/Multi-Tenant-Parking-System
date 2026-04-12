import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../services/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authApi.me()
      .then(res => { if (!cancelled) setAdmin(res?.message || null); })
      .catch(() => { if (!cancelled) setAdmin(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    const adminData = res?.message?.loggedInAdmin ?? null;
    setAdmin(adminData);
    return adminData; // return the admin object so caller can navigate immediately
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* best-effort */ }
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({ admin, loading, login, logout }),
    [admin, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default useAuth;
