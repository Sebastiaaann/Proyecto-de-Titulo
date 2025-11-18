
import React from 'react';
import { AppView } from '../types';
import { LayoutDashboard, Truck, Map, PieChart, Zap, FileCheck, Radar } from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: AppView.TRACKING, label: 'Rastreo GPS', icon: <Radar className="w-4 h-4" /> },
    { id: AppView.FLEET, label: 'Equipo', icon: <Truck className="w-4 h-4" /> },
    { id: AppView.ROUTES, label: 'Rutas', icon: <Map className="w-4 h-4" /> },
    { id: AppView.ROUTE_BUILDER, label: 'Constructor', icon: <Zap className="w-4 h-4" /> },
    { id: AppView.FINANCIALS, label: 'Finanzas', icon: <PieChart className="w-4 h-4" /> },
    { id: AppView.COMPLIANCE, label: 'Cumplimiento', icon: <FileCheck className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView(AppView.HOME)}>
            <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-brand-500/20 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-brand-500 to-brand-900 rounded-xl flex items-center justify-center border border-white/10">
                    <Zap className="text-white w-5 h-5" />
                </div>
            </div>
            <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tighter text-white leading-none">
                  FLEET<span className="text-brand-500">MASTER</span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">OS Logístico</span>
            </div>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                    currentView === item.id
                      ? 'bg-white/10 text-white border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                      : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* User/Action */}
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-slate-400">SISTEMA ONLINE</span>
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
