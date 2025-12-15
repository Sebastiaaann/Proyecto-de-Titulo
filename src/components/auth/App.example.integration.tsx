/**
 * Ejemplo de Integración - LoginView
 * 
 * Este archivo muestra cómo integrar el LoginView en tu aplicación.
 */

import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import { useAuth } from './src/hooks/useAuth';
import { LoginView } from './components/auth/LoginView';
import { ToastProvider } from './components/Toast';

/**
 * Componente principal de la aplicación con autenticación
 */
function AppWithAuth() {
  const { isAuthenticated, loading } = useAuth();

  // Loading state mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar LoginView
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Si está autenticado, mostrar la aplicación principal
  return (
    <div className="min-h-screen bg-dark-950">
      {/* Tu aplicación principal aquí */}
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          ¡Bienvenido a FleetTech!
        </h1>
        <p className="text-slate-400">
          Has iniciado sesión correctamente. Aquí va el contenido de tu dashboard.
        </p>
      </div>
    </div>
  );
}

/**
 * Componente raíz con todos los providers
 */
function App() {
  return (
    <AuthProvider>
      <ToastProvider />
      <AppWithAuth />
    </AuthProvider>
  );
}

export default App;

/**
 * INSTRUCCIONES DE USO:
 * 
 * 1. Asegúrate de tener configurado el AuthProvider en tu App.tsx
 * 2. Importa LoginView donde lo necesites:
 * 
 *    import { LoginView } from './components/auth/LoginView';
 * 
 * 3. Usa useAuth para verificar el estado de autenticación:
 * 
 *    const { isAuthenticated, loading } = useAuth();
 *    if (!isAuthenticated) return <LoginView />;
 * 
 * 4. El sistema de Toast ya está integrado para mostrar errores y éxitos
 * 
 * ESTILOS PERSONALIZABLES:
 * 
 * Puedes modificar los colores en tailwind.config.js:
 * - brand: Color principal del sistema
 * - dark: Colores del fondo oscuro
 * 
 * Los componentes usan:
 * - bg-dark-950: Fondo principal
 * - bg-dark-900: Fondos de cards y inputs
 * - text-slate-200/300/400: Textos con diferentes opacidades
 * - border-white/10: Bordes sutiles
 * - brand-500/600: Color de acento para botones y elementos interactivos
 */
