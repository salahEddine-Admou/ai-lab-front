import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './Loader';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader label="Chargement de votre espace…" />;
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
