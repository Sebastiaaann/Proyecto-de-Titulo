import React from 'react';
import { ArrowRight, Globe, Activity, Shield } from 'lucide-react';
import { AppView } from '../types';

interface HeroProps {
  setView: (view: AppView) => void;
}

const Hero: React.FC<HeroProps> = ({ setView }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-950">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"></div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[128px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-brand-500/20 bg-brand-500/5 backdrop-blur-md animate-fade-in">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          <span className="text-brand-400 text-xs font-bold tracking-widest uppercase">FleetMaster v2.0 En Vivo</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-bold text-white mb-8 tracking-tighter leading-[1.1] animate-slide-up">
          Control Total Sobre <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-200 to-accent-400">
            Activos en Movimiento
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
          La plataforma todo en uno para líderes logísticos. Optimiza rutas, gestiona mantenimientos y visualiza costos con la inteligencia de Gemini AI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <button 
            onClick={() => setView(AppView.DASHBOARD)}
            className="px-8 py-4 bg-white text-black rounded-lg font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center gap-2"
          >
            Abrir Dashboard <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setView(AppView.ROUTES)}
            className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-lg font-medium text-lg transition-all hover:bg-white/10 backdrop-blur-sm"
          >
            Probar Planificador
          </button>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {[
              { icon: <Globe className="text-brand-400" />, title: "Telemetría en Vivo", desc: "Rastreo GPS en tiempo real con latencia mínima." },
              { icon: <Activity className="text-accent-400" />, title: "Mantenimiento Predictivo", desc: "La IA pronostica reparaciones antes de que ocurran fallas." },
              { icon: <Shield className="text-orange-400" />, title: "Cumplimiento y Seguridad", desc: "Validación automatizada de licencias y puntuación de seguridad." }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl glass-card text-left group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/10">
                      {feature.icon}
                  </div>
                  <h3 className="text-white font-semibold text-xl mb-2">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;