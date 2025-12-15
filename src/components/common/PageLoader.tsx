import React from 'react';

const PageLoader: React.FC = () => {
    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 text-sm font-medium animate-pulse">Cargando...</p>
            </div>
        </div>
    );
};

export default PageLoader;
