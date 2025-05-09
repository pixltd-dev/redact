import { useEffect, useState, useCallback } from 'react';

const API =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8001/backend/user.php'
    : './backend/user.php';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
        setUser(data.user ?? null);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    isLoading,
    user,
    checkAuth, // useful to manually re-check (after login/logout)
  };
};
