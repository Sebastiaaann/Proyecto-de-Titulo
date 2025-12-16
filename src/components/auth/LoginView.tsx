/**
 * LoginView Component
 * 
 * Layout contenedor para la página de login con diseño dark mode profesional.
 * Incluye branding, card de login y footer.
 */

import React from 'react';
import { Truck, Shield, Zap } from 'lucide-react';
import LoginForm from '@components/auth/LoginForm';
import { useStore } from '@store/useStore';
import { AppView } from '@/types';

export const LoginView: React.FC = () => {
  const { setView } = useStore();

  return (
    <div className="min-h-screen w-full bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding & Info */}
        <div className="hidden lg:flex flex-col space-y-8">
          {/* Logo & Title */}
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="p-6 bg-white/10 rounded-3xl shadow-lg shadow-brand-500/20">
                <img 
                  src="/logoFTSR.svg" 
                  alt="FleetTech" 
                  className="h-24 w-24 filter brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  FleetTech
                </h1>
                <p className="text-slate-400 text-sm">Sistema de Gestión de Flotas</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6 mt-12">
            <div className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-brand-500/30 transition-all duration-300">
              <div className="p-2 bg-brand-500/20 rounded-lg mt-1">
                <Shield className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Seguridad Avanzada</h3>
                <p className="text-sm text-slate-400">
                  Protección de datos con Row Level Security y autenticación robusta.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-brand-500/30 transition-all duration-300">
              <div className="p-2 bg-brand-500/20 rounded-lg mt-1">
                <Zap className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Gestión en Tiempo Real</h3>
                <p className="text-sm text-slate-400">
                  Monitorea tu flota, rutas y entregas con actualizaciones instantáneas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-brand-500/30 transition-all duration-300">
              <div className="p-2 bg-brand-500/20 rounded-lg mt-1">
                <Truck className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Control Total</h3>
                <p className="text-sm text-slate-400">
                  Administra vehículos, conductores y operaciones desde un solo lugar.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">99.9%</div>
              <div className="text-xs text-slate-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">500+</div>
              <div className="text-xs text-slate-400">Flotas Activas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">24/7</div>
              <div className="text-xs text-slate-400">Soporte</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-4 mb-2">
              <div className="p-3 bg-white/10 rounded-xl shadow-lg shadow-brand-500/20">
                <img 
                  src="/logoFTSR.svg" 
                  alt="FleetTech" 
                  className="h-10 w-10 filter brightness-0 invert"
                />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                FleetTech
              </h1>
            </div>
            <p className="text-slate-400 text-sm">Sistema de Gestión de Flotas</p>
          </div>

          {/* Login Card */}
          <div className="bg-dark-900/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 lg:p-10">
            {/* Card Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Bienvenido de vuelta
              </h2>
              <p className="text-slate-400 text-sm">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-brand-500/5 border border-brand-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-brand-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-400">
                  <span className="font-semibold text-brand-400">Conexión segura.</span>
                  {' '}Tus datos están protegidos con encriptación end-to-end.
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              © 2025 FleetTech Corp. Todos los derechos reservados.
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <button 
                onClick={() => setView(AppView.TERMS_OF_SERVICE)}
                className="text-xs text-slate-500 hover:text-brand-400 transition-colors bg-transparent border-0 cursor-pointer"
              >
                Términos de Servicio
              </button>
              <span className="text-slate-700">•</span>
              <button 
                onClick={() => setView(AppView.PRIVACY_POLICY)}
                className="text-xs text-slate-500 hover:text-brand-400 transition-colors bg-transparent border-0 cursor-pointer"
              >
                Política de Privacidad
              </button>
              <span className="text-slate-700">•</span>
              <a href="#" className="text-xs text-slate-500 hover:text-brand-400 transition-colors">
                Soporte
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
