import React from 'react';

const MapSkeleton: React.FC = () => {
    return (
        <div className="relative w-full h-full min-h-[500px] bg-dark-900 rounded-2xl overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 animate-pulse"></div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:20px_20px]"></div>

            {/* Live tracking badge skeleton */}
            <div className="absolute top-6 left-6 z-10 bg-dark-800/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 animate-pulse">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                    <div className="h-3 w-48 bg-slate-700 rounded"></div>
                </div>
            </div>

            {/* Filter controls skeleton */}
            <div className="absolute top-6 right-6 z-10 bg-dark-800/80 backdrop-blur-md border border-white/10 rounded-lg p-4 animate-pulse">
                <div className="h-4 w-16 bg-slate-700 rounded mb-3"></div>
                <div className="space-y-2">
                    <div className="h-4 w-20 bg-slate-700 rounded"></div>
                    <div className="h-4 w-24 bg-slate-700 rounded"></div>
                    <div className="h-4 w-20 bg-slate-700 rounded"></div>
                </div>
            </div>

            {/* Legend skeleton */}
            <div className="absolute bottom-6 right-6 z-10 bg-dark-800/80 backdrop-blur-md border border-white/10 rounded-lg p-4 animate-pulse">
                <div className="h-3 w-32 bg-slate-700 rounded mb-3"></div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                        <div className="h-3 w-16 bg-slate-700 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                        <div className="h-3 w-20 bg-slate-700 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                        <div className="h-3 w-16 bg-slate-700 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Custom zoom controls skeleton */}
            <div className="absolute top-24 left-6 z-10 bg-dark-800/80 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden animate-pulse">
                <div className="w-10 h-10 bg-slate-700 border-b border-white/10"></div>
                <div className="w-10 h-10 bg-slate-700 border-b border-white/10"></div>
                <div className="w-10 h-10 bg-slate-700"></div>
            </div>

            {/* Location button skeleton */}
            <div className="absolute top-24 right-6 z-10 w-10 h-10 bg-dark-800/80 backdrop-blur-md border border-white/10 rounded-lg animate-pulse"></div>

            {/* Simulated markers */}
            <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-slate-600/50 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-slate-600/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute top-1/2 right-1/3 w-6 h-6 bg-slate-600/50 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>

            {/* Loading text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4 mx-auto"></div>
                    <p className="text-slate-400 text-sm font-medium">Cargando mapa interactivo...</p>
                </div>
            </div>
        </div>
    );
};

export default MapSkeleton;
