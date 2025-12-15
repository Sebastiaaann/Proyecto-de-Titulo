
import React from 'react';
import { AppView } from '@/types';
import { useStore } from '@store/useStore';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs: React.FC = () => {
    const { currentView, setView } = useStore();
    const viewLabels: Record<AppView, string> = {
        [AppView.HOME]: 'Inicio',
        [AppView.DASHBOARD]: 'Dashboard',
        [AppView.TRACKING]: 'Rastreo GPS',
        [AppView.FLEET]: 'Equipo',
        [AppView.ROUTES]: 'Rutas',
        [AppView.ROUTE_BUILDER]: 'Constructor de Rutas',
        [AppView.FINANCIALS]: 'Finanzas',
        [AppView.COMPLIANCE]: 'Cumplimiento',
        [AppView.DRIVER_MOBILE]: 'Vista Conductor',
    };

    // Don't show breadcrumbs on home page or driver mobile view
    if (currentView === AppView.HOME || currentView === AppView.DRIVER_MOBILE) {
        return null;
    }

    return (
        <div className="fixed top-20 left-0 w-full z-40 glass-panel border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 py-3 text-sm">
                    {/* Home breadcrumb */}
                    <button
                        onClick={() => setView(AppView.HOME)}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors group"
                        aria-label="Ir a inicio"
                    >
                        <Home className="w-4 h-4" />
                        <span className="hidden sm:inline">Inicio</span>
                    </button>

                    {/* Separator */}
                    <ChevronRight className="w-4 h-4 text-slate-600" />

                    {/* Current view */}
                    <span className="text-white font-medium">
                        {viewLabels[currentView]}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Breadcrumbs;
