
import React, { useState, useEffect } from 'react';
import { analyzeFleetHealth } from '../services/geminiService';
import { Vehicle } from '../types';
import { BarChart3, Fuel, Wrench, TrendingUp, AlertCircle, Zap, MapPin, BellRing } from 'lucide-react';

// Mock Data
const initialVehicles: Vehicle[] = [
  { id: "V-001", plate: "HG-LF-99", model: "Volvo FH16", status: "Active", mileage: 120500, fuelLevel: 75, nextService: "2024-11-15" },
  { id: "V-002", plate: "JS-KK-22", model: "Scania R450", status: "Maintenance", mileage: 240100, fuelLevel: 10, nextService: "2024-10-28" },
  { id: "V-003", plate: "LK-MM-11", model: "Mercedes Actros", status: "Active", mileage: 85000, fuelLevel: 92, nextService: "2024-12-01" },
  { id: "V-004", plate: "PP-QA-55", model: "Ford F-Max", status: "Idle", mileage: 45000, fuelLevel: 40, nextService: "2025-01-10" },
];

// Mock Alerts for Smart Feed
const smartAlerts = [
    { id: 1, type: 'critical', msg: "Consumo excesivo de combustible detectado en V-001 (+15% sobre promedio)", time: "Hace 10m" },
    { id: 2, type: 'warning', msg: "Conductor D-2 excedió límite de velocidad en zona urbana", time: "Hace 45m" },
    { id: 3, type: 'info', msg: "Ruta Santiago-Valdivia optimizada: Ahorro potencial $45.000", time: "Hace 2h" }
];

const Dashboard: React.FC = () => {
  const [aiInsight, setAiInsight] = useState("Inicializando FleetMaster AI...");

  useEffect(() => {
    const fetchInsight = async () => {
      const insight = await analyzeFleetHealth(initialVehicles);
      setAiInsight(insight);
    };
    fetchInsight();
  }, []);

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-10 bg-dark-950 text-slate-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Centro de Mando</h2>
            <p className="text-slate-500 text-sm">Resumen de operaciones, mantenimiento y salud financiera.</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
             <button className="px-4 py-2 bg-brand-600/20 text-brand-400 border border-brand-600/30 rounded-lg text-sm font-medium hover:bg-brand-600/30 transition-colors">
                Exportar Reporte (PDF)
             </button>
             <button className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                Agregar Vehículo
             </button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Key Metrics */}
          <div className="glass-card p-6 rounded-2xl md:col-span-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
             <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Flota Activa</span>
                <TruckIcon className="text-brand-500 w-5 h-5" />
             </div>
             <div className="text-4xl font-bold text-white mb-1">24<span className="text-lg text-slate-500">/28</span></div>
             <div className="flex items-center gap-1 text-xs text-brand-400">
                <TrendingUp className="w-3 h-3" /> +2 desde la semana pasada
             </div>
          </div>

          <div className="glass-card p-6 rounded-2xl md:col-span-1 animate-slide-up" style={{ animationDelay: '0.2s' }}>
             <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Eficiencia Combustible</span>
                <Fuel className="text-accent-500 w-5 h-5" />
             </div>
             <div className="text-4xl font-bold text-white mb-1">3.2<span className="text-lg text-slate-500">km/L</span></div>
             <div className="flex items-center gap-1 text-xs text-red-400">
                <TrendingUp className="w-3 h-3 rotate-180" /> -0.1 vs objetivo
             </div>
          </div>

          <div className="glass-card p-6 rounded-2xl md:col-span-1 animate-slide-up" style={{ animationDelay: '0.3s' }}>
             <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Mantenimiento</span>
                <Wrench className="text-orange-500 w-5 h-5" />
             </div>
             <div className="text-4xl font-bold text-white mb-1">3<span className="text-lg text-slate-500">Pendientes</span></div>
             <div className="flex items-center gap-1 text-xs text-orange-400">
                <AlertCircle className="w-3 h-3" /> 1 Crítico
             </div>
          </div>

          <div className="glass-card p-6 rounded-2xl md:col-span-1 animate-slide-up" style={{ animationDelay: '0.4s' }}>
             <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Ingresos Mensuales</span>
                <BarChart3 className="text-green-500 w-5 h-5" />
             </div>
             <div className="text-4xl font-bold text-white mb-1">$84M</div>
             <div className="flex items-center gap-1 text-xs text-brand-400">
                <TrendingUp className="w-3 h-3" /> +12% Año/Año
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
           {/* Main Map Area (Mockup) */}
           <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 p-1 relative min-h-[400px] overflow-hidden animate-fade-in">
              <div className="absolute top-5 left-5 z-10 bg-dark-900/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-mono text-white">RASTREO EN VIVO: PUERTO MONTT, CHILE</span>
                 </div>
              </div>
              {/* Abstract Map Background */}
              <div className="w-full h-full bg-dark-900 relative">
                 <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:20px_20px]"></div>
                 {/* Simulated Truck Dots */}
                 <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-brand-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse"></div>
                 <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-brand-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse" style={{ animationDelay: '1s'}}></div>
                 <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)] animate-pulse" style={{ animationDelay: '0.5s'}}></div>
              </div>
           </div>

           {/* AI Insights & Quick List */}
           <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Smart Alerts Feed (NEW) */}
              <div className="glass-panel border border-white/5 rounded-2xl p-6 animate-slide-in-right">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                       <BellRing className="w-4 h-4 text-accent-500" /> Alertas Inteligentes
                    </h3>
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">3 NUEVAS</span>
                 </div>
                 <div className="space-y-3">
                    {smartAlerts.map((alert) => (
                        <div key={alert.id} className="flex gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border-l-2 border-l-transparent hover:border-l-accent-500">
                             <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${alert.type === 'critical' ? 'bg-red-500' : alert.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                             <div>
                                <p className="text-xs text-slate-300 leading-snug">{alert.msg}</p>
                                <p className="text-[10px] text-slate-500 mt-1 font-mono">{alert.time}</p>
                             </div>
                        </div>
                    ))}
                 </div>
              </div>

              {/* Gemini Box */}
              <div className="glass-card p-6 rounded-2xl border-t-2 border-t-brand-500 animate-slide-in-right" style={{ animationDelay: '0.1s'}}>
                 <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-emerald-700 flex items-center justify-center shadow-lg">
                       <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                       <h3 className="text-white font-bold text-sm">Resumen Operativo</h3>
                       <p className="text-[10px] text-slate-400 uppercase tracking-wider">Gemini Live</p>
                    </div>
                 </div>
                 <p className="text-slate-300 text-sm leading-relaxed font-light">
                    {aiInsight}
                 </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

const TruckIcon = ({className}:{className?:string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
)

export default Dashboard;
