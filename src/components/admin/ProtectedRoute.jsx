import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // 1. Si Firebase aún está verificando, mostramos "Cargando..."
  if (loading) return <div className="p-10 text-center">Verificando acceso...</div>;

  // 2. Si NO hay usuario, lo mandamos al Login
  if (!user) return <Navigate to="/login" replace />;

  // 3. Si hay usuario, dejamos renderizar las rutas hijas (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;