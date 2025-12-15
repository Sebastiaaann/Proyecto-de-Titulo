import React, { useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import type { AppRole } from '../../types/auth.types';
import PageLoader from '@components/common/PageLoader';
import { LoginView } from '@components/auth/LoginView';

// Componente temporal de Unauthorized
const Unauthorized: React.FC = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Acceso Denegado</h1>
    <p>No tienes permisos para acceder a este recurso.</p>
  </div>
);

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole | AppRole[];
  fallback?: React.ReactNode;
}

/**
 * Componente de ruta protegida compatible con Zustand y Dark Mode
 * NOTA: Actualmente deshabilitado para permitir acceso completo durante desarrollo
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback,
}) => {
  // MODO DESARROLLO: Permitir acceso completo sin restricciones
  // Descomentar el código siguiente para habilitar protección de rutas

  /*
  const { isAuthenticated, hasRole, loading } = useAuth();

  // 1. Loading State
  if (loading) {
    return <PageLoader />;
  }

  // 2. No Autenticado
  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    return <LoginView />;
  }

  // 3. Verificación de Rol
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) return <>{fallback}</>;
    return <Unauthorized />;
  }
  */

  // Renderizar contenido sin restricciones
  return <>{children}</>;
};

export default ProtectedRoute;