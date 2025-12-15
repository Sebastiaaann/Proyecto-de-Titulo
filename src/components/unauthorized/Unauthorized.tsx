import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useStore } from '@store/useStore';
import { AppView } from '@/types';

/**
 * Unauthorized Component
 * 
 * Pantalla de acceso restringido mostrada cuando un usuario intenta
 * acceder a una sección para la cual no tiene permisos.
 * 
 * Características:
 * - Diseño centrado y elegante
 * - Icono de alerta de seguridad
 * - Mensaje claro de restricción
 * - Botón para regresar al dashboard
 * - Estilo consistente con el tema oscuro
 */
const Unauthorized: React.FC = () => {
  const { setView } = useStore();

  const handleGoBack = () => {
    setView(AppView.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="max-w-lg w-full text-center relative z-10">
        {/* Icon Container with Enhanced Animation */}
        <div className="relative inline-flex items-center justify-center mb-10 animate-fade-in">
          {/* Multi-layer Glow Effect */}
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute inset-0 bg-red-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>

          {/* Icon Container with Glass Effect */}
          <div className="relative bg-gradient-to-br from-red-500/10 via-red-600/10 to-red-900/20 rounded-full p-10 border border-red-500/20 backdrop-blur-xl shadow-2xl shadow-red-500/10 hover-lift">
            <ShieldAlert className="w-20 h-20 text-red-400 drop-shadow-lg" />
          </div>
        </div>

        {/* Content Card with Glass Morphism */}
        <div className="glass-card rounded-2xl p-8 mb-6 border border-white/5 shadow-2xl animate-slide-in-up">
          {/* Title */}
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Acceso Restringido
          </h1>

          {/* Description */}
          <div className="space-y-3 mb-8">
            <p className="text-lg text-slate-300 leading-relaxed">
              No tienes los permisos necesarios para acceder a esta sección.
            </p>
            <p className="text-base text-slate-400">
              Por favor, contacta al administrador si crees que esto es un error.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGoBack}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/50 w-full sm:w-auto"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Volver al Inicio</span>
          </button>
        </div>

        {/* Error Code Badge */}
        <div className="flex items-center justify-center gap-3 text-slate-500 animate-fade-in delay-300">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
          <div className="px-4 py-2 bg-slate-900/50 rounded-full border border-slate-800/50 backdrop-blur-sm">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Error 403</span>
          </div>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
        </div>

        {/* Additional Info */}
        <p className="mt-8 text-sm text-slate-600 animate-fade-in delay-500">
          Si necesitas ayuda, contacta al equipo de soporte
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;
