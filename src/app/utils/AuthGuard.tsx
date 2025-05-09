import { useAuth } from '../hooks/useAuth';
import { JSX, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      alert("Access denied. Please log in.");
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return <p>Checking login...</p>;

  return isAuthenticated ? children : null;
};

export default AuthGuard;
