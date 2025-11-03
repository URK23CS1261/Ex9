import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Dashboard from '../pages/Dashboard';

const ProtectedRoute = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }  
  return (
    <>
      <Dashboard />
    </>
  );
};

export default ProtectedRoute;
