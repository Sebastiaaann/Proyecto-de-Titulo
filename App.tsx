
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import FleetManager from './components/FleetManager';
import RoutePlanner from './components/RoutePlanner';
import Financials from './components/Financials';
import Compliance from './components/Compliance';
import FleetTracking from './components/FleetTracking';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);

  const renderView = () => {
    switch (currentView) {
      case AppView.HOME:
        return <Hero setView={setCurrentView} />;
      case AppView.DASHBOARD:
        return <Dashboard />;
      case AppView.TRACKING:
        return <FleetTracking />;
      case AppView.FLEET:
        return <FleetManager />;
      case AppView.ROUTES:
        return <RoutePlanner />;
      case AppView.FINANCIALS:
        return <Financials />;
      case AppView.COMPLIANCE:
        return <Compliance />;
      default:
        return <Hero setView={setCurrentView} />;
    }
  };

  return (
    <div className="antialiased text-slate-200 selection:bg-brand-500 selection:text-black font-sans">
      <Navbar currentView={currentView} setView={setCurrentView} />
      <main className="bg-dark-950">
        {renderView()}
      </main>
      
      {/* Footer */}
      <footer className="bg-black border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-600 text-sm">
          <p>© 2024 FleetMaster Corp. Todos los derechos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="hover:text-white cursor-pointer transition-colors">Privacidad</span>
            <span className="hover:text-white cursor-pointer transition-colors">Seguridad</span>
            <span className="hover:text-white cursor-pointer transition-colors">API</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
