import React, { Suspense, useEffect } from 'react';
import { useStore } from '@store/useStore';
import { useSupabaseRealtime } from '@hooks/useSupabaseRealtime';
import { useAuth } from '@hooks/useAuth';
import Navbar from '@components/layout/Navbar';
import Breadcrumbs from '@components/layout/Breadcrumbs';
import { ToastProvider, showToast } from '@components/common/Toast';
import PageLoader from '@components/common/PageLoader';
import { LoginView } from '@components/auth/LoginView';
import Unauthorized from '@components/unauthorized/Unauthorized';

import SkipLink from '@components/common/SkipLink';
import Hero from '@components/dashboard/Hero';

// Lazy Load
const Dashboard = React.lazy(() => import('@components/dashboard/Dashboard'));
const FleetManager = React.lazy(() => import('@components/fleet/FleetManager'));
const RoutePlanner = React.lazy(() => import('@components/routes/RoutePlanner'));
const RouteBuilder = React.lazy(() => import('@components/routes/RouteBuilder'));
const Financials = React.lazy(() => import('@components/financials/Financials'));
const Compliance = React.lazy(() => import('@components/dashboard/Compliance'));
const FleetTracking = React.lazy(() => import('@components/fleet/FleetTracking'));
const DriverMobile = React.lazy(() => import('@components/fleet/DriverMobile'));

import { AppView } from './types/index';
import { enableDemoMode } from '@utils/demoData';

const App: React.FC = () => {
  // 1. Hooks Principales
  const { user, profile, loading } = useAuth();
  const store = useStore();
  const { currentView, setView } = store;
  
  useSupabaseRealtime();

  // 1.1. Ref para controlar redirecciones y evitar bucles infinitos
  const isRedirecting = React.useRef(false);

  // 2. Efecto de Redirección (UX Layer)
  // Este efecto maneja la experiencia de usuario, pero NO es la única barrera de seguridad.
  useEffect(() => {
    // Si no hay perfil o ya estamos cargando, no hacer nada
    if (!profile || loading) return;

    const role = profile.role;

    // A. Lógica estricta para DRIVER
    if (role === 'driver') {
      if (currentView !== AppView.DRIVER_MOBILE) {
        // Evitar doble setView si ya estamos en proceso
        if (!isRedirecting.current) {
          isRedirecting.current = true;
          console.log('🚗 Driver detected - Enforcing mobile view');
          setView(AppView.DRIVER_MOBILE);
          // Reseteamos el flag en el próximo ciclo
          setTimeout(() => { isRedirecting.current = false; }, 100);
        }
      }
    }
    // B. Lógica para FLEET MANAGER
    else if (role === 'fleet_manager') {
      const forbiddenViews = [AppView.FINANCIALS, AppView.COMPLIANCE];
      
      if (forbiddenViews.includes(currentView)) {
        if (!isRedirecting.current) {
          isRedirecting.current = true;
          console.log('🛡️ Restricted view - Redirecting to Dashboard');
          showToast.warning('Acceso Denegado', 'Redirigiendo al Dashboard...');
          setView(AppView.DASHBOARD);
          setTimeout(() => { isRedirecting.current = false; }, 100);
        }
      }
    }
  }, [
    // Dependencias Críticas: Solo re-ejecutar si cambia el rol, no el objeto profile entero
    profile?.role,
    currentView,
    loading,
    setView
  ]);

  // 3. Demo Mode (Solo en Desarrollo o entorno seguro)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Verificamos que no estemos en producción real (opcional, ajusta según tu lógica)
      const isProd = import.meta.env.PROD; 
      
      if (!isProd && e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        enableDemoMode(useStore);
        showToast.success('🎭 Modo Demo', 'Datos de prueba cargados');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // 4. Early Returns (Loading & Auth)

  if (loading) {
    return (
      <div className="antialiased text-slate-200">
        <PageLoader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="antialiased text-slate-200">
        <ToastProvider />
        <LoginView />
      </div>
    );
  }

  // 5. Render Guard - MODO DESARROLLO: Sin restricciones
  // Todas las vistas están accesibles para todos los usuarios
  
  const renderView = () => {
    switch (currentView) {
      case AppView.HOME:
        return <Hero />;
      case AppView.DASHBOARD:
        return <Dashboard />;
      case AppView.TRACKING:
        return <FleetTracking />;
      case AppView.FLEET:
        return <FleetManager />;
      case AppView.ROUTES:
        return <RoutePlanner />;
      case AppView.ROUTE_BUILDER:
        return <RouteBuilder />;
      case AppView.FINANCIALS:
        return <Financials />;
      case AppView.COMPLIANCE:
        return <Compliance />;
      case AppView.DRIVER_MOBILE:
        return <DriverMobile />;
      default:
        return <Hero />;
    }
  };

  // 6. UI Condicional
  const isDriver = profile?.role === 'driver';
  
  // Ocultar navegación si es driver
  const showNavigation = !isDriver; 

  return (
    <div className="antialiased text-slate-200 selection:bg-brand-500 selection:text-black font-sans">
      <SkipLink />
      <ToastProvider />
      
      {showNavigation && <Navbar />}
      
      <main 
        id="main-content" 
        className="bg-dark-950"
      >
        <Suspense fallback={<PageLoader />}>
          {renderView()}
        </Suspense>
      </main>

      {showNavigation && (
        <footer className="bg-black border-t border-white/5 py-8">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-600 text-sm">
            <p>© 2025 FleetTech Corp.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;