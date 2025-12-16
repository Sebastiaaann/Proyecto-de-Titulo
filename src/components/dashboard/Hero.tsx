import React, { useEffect } from 'react';
import { ArrowRight, Globe, Activity, Shield, Play, Map, Check } from 'lucide-react';
import { AppView } from '@/types';
import { useStore } from '@store/useStore';

const Hero: React.FC = () => {
  const { setView } = useStore();

  // Parallax Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const layers = document.querySelectorAll('.parallax-layer');
      const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;

      layers.forEach((layer) => {
        const speed = parseFloat((layer as HTMLElement).dataset.speed || '0.5');
        const moveX = x * 50 * speed;
        const moveY = y * 50 * speed;
        (layer as HTMLElement).style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-950">
      {/* Animated Background with Parallax */}
      <div className="absolute inset-0 z-0 pointer-events-none parallax-container">
        {/* Grid Pattern */}
        <div
          className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] parallax-layer"
          data-speed="0.5"
        ></div>

        {/* Gradient Orbs */}
        <div
          className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[128px] animate-pulse-slow parallax-layer"
          data-speed="0.3"
        ></div>
        <div
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[128px] animate-pulse-slow parallax-layer"
          style={{ animationDelay: '2s' }}
          data-speed="0.4"
        ></div>

        {/* Floating Particles - More Dynamic */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-brand-400 rounded-full animate-float opacity-50 parallax-layer" data-speed="0.6"></div>
        <div className="absolute top-3/4 left-1/5 w-3 h-3 bg-accent-400 rounded-full animate-float opacity-30 parallax-layer" style={{ animationDelay: '1.5s' }} data-speed="0.7"></div>
        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white rounded-full animate-float opacity-20 parallax-layer" style={{ animationDelay: '3s' }} data-speed="0.8"></div>
        <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-brand-300 rounded-full animate-float opacity-40 parallax-layer" style={{ animationDelay: '2.5s' }} data-speed="0.65"></div>
        <div className="absolute top-1/5 right-1/5 w-2.5 h-2.5 bg-accent-300 rounded-full animate-float opacity-35 parallax-layer" style={{ animationDelay: '4s' }} data-speed="0.75"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-brand-500/20 bg-brand-500/5 backdrop-blur-md animate-fade-in">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          <span className="text-brand-400 text-xs font-bold tracking-widest uppercase">FleetTech </span>
        </div>

        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <img 
            src="/logoFTSR.svg" 
            alt="FleetTech Logo" 
            className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 mx-auto filter brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 tracking-tighter leading-[0.95] animate-slide-up">
          Control Total<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-300 to-accent-400 animate-gradient">
            de tu Flota
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up font-light" style={{ animationDelay: '0.2s' }}>
          Plataforma inteligente para gestión de flotas. Optimiza rutas, prevé mantenimientos y controla costos con IA de última generación.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={() => setView(AppView.DASHBOARD)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left - rect.width / 2;
              const y = e.clientY - rect.top - rect.height / 2;
              e.currentTarget.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0) scale(1)';
            }}
            className="magnetic-btn ripple group relative px-10 py-5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-2xl font-bold text-lg transition-all hover:shadow-glow-lg flex items-center gap-3 overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/50 shadow-2xl shadow-brand-500/20"
            aria-label="Abrir Dashboard"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <span className="relative flex items-center gap-3 text-lg">
              Ir al Dashboard
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" aria-hidden="true" />
            </span>
          </button>
          <button
            onClick={() => setView(AppView.ROUTES)}
            className="ripple group px-10 py-5 bg-white/5 hover:bg-white/10 text-white border-2 border-white/10 hover:border-brand-400/50 rounded-2xl font-semibold text-lg transition-all hover:scale-105 backdrop-blur-md flex items-center gap-3 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50 shadow-xl"
            aria-label="Probar Planificador de Rutas"
          >
            <span>Planificar Rutas</span>
            <Map className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          </button>
        </div>

        {/* Features Grid Mejorado */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
          {[
            { icon: <Globe className="w-7 h-7" />, title: "Telemetría en Vivo", desc: "Rastreo GPS en tiempo real con actualizaciones instantáneas y precisión milimétrica.", color: "from-brand-500 to-brand-600" },
            { icon: <Activity className="w-7 h-7" />, title: "IA Predictiva", desc: "Algoritmos inteligentes predicen mantenimientos y optimizan operaciones automáticamente.", color: "from-accent-500 to-accent-600" },
            { icon: <Shield className="w-7 h-7" />, title: "Seguridad Total", desc: "Cumplimiento normativo automatizado con alertas proactivas y reportes detallados.", color: "from-orange-500 to-orange-600" }
          ].map((feature, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-md text-left group hover-lift cursor-pointer hover:border-white/20 transition-all duration-300 shadow-xl">
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg text-white`}>
                {feature.icon}
              </div>
              <h3 className="text-white font-bold text-2xl mb-3">{feature.title}</h3>
              <p className="text-slate-400 text-base leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing Section */}
        <div className="mt-32 max-w-7xl mx-auto animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Planes Flexibles</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Escala tu operación con nuestra tecnología. Sin contratos forzosos, cancela cuando quieras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free Plan */}
            <div className="relative p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-md hover:border-white/20 transition-all duration-300 group">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">Gratis</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-slate-500">/mes</span>
                </div>
                <p className="text-slate-400 mt-4 text-sm">Para probar la plataforma sin compromiso.</p>
              </div>
              <ul className="space-y-4 mb-8">
                {['1 Vehículo', 'Gestión Manual', 'Sin App Móvil', 'Soporte Comunitario'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <div className="p-1 rounded-full bg-white/10 text-white">
                      <Check className="w-3 h-3" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/10 transition-all">
                Crear Cuenta
              </button>
            </div>

            {/* Starter Plan */}
            <div className="relative p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-md hover:border-white/20 transition-all duration-300 group">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">Starter</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$25.000</span>
                  <span className="text-slate-500">/mes</span>
                </div>
                <p className="text-slate-400 mt-4 text-sm">Perfecto para pequeñas flotas y startups.</p>
              </div>
              <ul className="space-y-4 mb-8">
                {['Hasta 5 vehículos', 'Rastreo GPS Básico', 'App para Conductores', 'Soporte por Email'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <div className="p-1 rounded-full bg-white/10 text-white">
                      <Check className="w-3 h-3" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/10 transition-all">
                Comenzar Gratis
              </button>
            </div>

            {/* Pro Plan */}
            <div className="relative p-6 rounded-3xl bg-gradient-to-b from-brand-900/20 to-dark-900/50 border border-brand-500/30 backdrop-blur-md transform lg:-translate-y-4 shadow-2xl shadow-brand-500/10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Más Popular
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$75.000</span>
                  <span className="text-slate-500">/mes</span>
                </div>
                <p className="text-brand-200/80 mt-4 text-sm">Para empresas en crecimiento que necesitan control total.</p>
              </div>
              <ul className="space-y-4 mb-8">
                {['Hasta 20 vehículos', 'IA Predictiva', 'Optimización de Rutas', 'Alertas de Seguridad', 'Soporte Prioritario 24/7'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white text-sm">
                    <div className="p-1 rounded-full bg-brand-500 text-black">
                      <Check className="w-3 h-3" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold transition-all shadow-lg shadow-brand-500/25">
                Prueba Pro 14 días
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="relative p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-md hover:border-white/20 transition-all duration-300 group">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">Custom</span>
                </div>
                <p className="text-slate-400 mt-4 text-sm">Soluciones a medida para grandes operaciones.</p>
              </div>
              <ul className="space-y-4 mb-8">
                {['Vehículos Ilimitados', 'API Access', 'Gestor de Cuenta Dedicado', 'SLA Garantizado', 'On-premise Deployment'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <div className="p-1 rounded-full bg-white/10 text-white">
                      <Check className="w-3 h-3" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/10 transition-all">
                Contactar Ventas
              </button>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-24 pb-8 text-center animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => setView(AppView.TERMS_OF_SERVICE)}
              className="text-sm text-slate-500 hover:text-brand-400 transition-colors bg-transparent border-0 cursor-pointer"
            >
              Términos de Servicio
            </button>
            <span className="text-slate-700">•</span>
            <button 
              onClick={() => setView(AppView.PRIVACY_POLICY)}
              className="text-sm text-slate-500 hover:text-brand-400 transition-colors bg-transparent border-0 cursor-pointer"
            >
              Política de Privacidad
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-4">© 2025 FleetTech Corp. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Hero;