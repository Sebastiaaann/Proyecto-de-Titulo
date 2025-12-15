import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, User, Truck, Navigation, Phone, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import LiveTrackingMap from './LiveTrackingMap';
import { useStore, type RegisteredRoute } from '@store/useStore';
import { useLiveTracking } from '@hooks/useLiveTracking';

interface LiveTrackingModalProps {
    route: RegisteredRoute;
    onClose: () => void;
}

const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({ route, onClose }) => {
    const { location, status, eta, isLoading, error, lastUpdate } = useLiveTracking({
        routeId: route.id,
        enabled: true,
        onError: (err) => console.error('Live tracking error:', err),
    });

    const freshnessMs = lastUpdate ? Date.now() - lastUpdate.getTime() : null;
    const hasFreshLocation = Boolean(location) && (freshnessMs == null || freshnessMs <= 30_000);

    // Convert location to tuple format for map
    const driverLocation = location ? ([location.lat, location.lng] as [number, number]) : undefined;

    // Prefer real start coords stored on route; fallback to driver location; final fallback Puerto Montt
    const fallbackCenter: [number, number] = driverLocation || [-41.4693, -72.9424];
    const originCoords: [number, number] = (route.start_lat != null && route.start_lng != null)
        ? [route.start_lat, route.start_lng]
        : fallbackCenter;

    // Destination coordinates are not persisted yet; avoid misleading markers by defaulting to origin
    const destCoords: [number, number] = originCoords;

    // Timeline steps based on Supabase status
    const timelineSteps = [
        { label: 'Solicitud enviada', completed: true, icon: '✅' },
        { label: 'Conductor asignado', completed: true, icon: '👤' },
        { label: 'En camino al origen', completed: status === 'picking_up' || status === 'in_transit' || status === 'delivering' || status === 'completed', icon: '🚗' },
        { label: 'Carga recogida', completed: status === 'in_transit' || status === 'delivering' || status === 'completed', icon: '📦' },
        { label: 'En camino al destino', completed: status === 'delivering' || status === 'completed', icon: '🛣️' },
        { label: 'Entrega completada', completed: status === 'completed', icon: '🎯' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-6xl h-[90vh] bg-dark-900 rounded-2xl border border-white/10 shadow-2xl flex flex-col animate-slide-up">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Navigation className="w-6 h-6 text-brand-500" />
                                Seguimiento en Tiempo Real
                            </h2>

                            {/* Connection Status */}
                            <div className="flex items-center gap-2">
                                {error ? (
                                    <span className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-medium">
                                        <WifiOff className="w-3 h-3" />
                                        Desconectado
                                    </span>
                                ) : isLoading ? (
                                    <span className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                                        <Wifi className="w-3 h-3 animate-pulse" />
                                        Conectando...
                                    </span>
                                ) : !location ? (
                                    <span className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                                        <Wifi className="w-3 h-3" />
                                        Esperando GPS
                                    </span>
                                ) : !hasFreshLocation ? (
                                    <span className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                                        <Wifi className="w-3 h-3" />
                                        Señal débil
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-medium">
                                        <Wifi className="w-3 h-3" />
                                        En vivo
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                            {route.origin.split(',')[0]} → {route.destination.split(',')[0]}
                        </p>
                        {lastUpdate && (
                            <p className="text-xs text-slate-500 mt-1">
                                Última actualización: {new Date(lastUpdate).toLocaleTimeString('es-CL')}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Map */}
                    <div className="flex-1 p-4">
                        <LiveTrackingMap
                            origin={originCoords}
                            destination={destCoords}
                            driverLocation={driverLocation}
                            driverName={route.driver}
                            vehiclePlate={route.vehicle}
                            estimatedArrival={eta || undefined}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-white/10 p-6 overflow-y-auto space-y-6">
                        {/* Driver Info */}
                        <div className="glass-panel p-4 rounded-xl border border-white/10">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Conductor</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    {route.driver?.charAt(0) || 'C'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-white">{route.driver || 'Sin asignar'}</p>
                                    <p className="text-sm text-slate-400">{route.vehicle || 'Vehículo no asignado'}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 px-3 py-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-lg text-sm font-medium hover:bg-brand-500/20 transition-colors flex items-center justify-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    Llamar
                                </button>
                                <button className="flex-1 px-3 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    Chat
                                </button>
                            </div>
                        </div>

                        {/* Route Info */}
                        <div className="glass-panel p-4 rounded-xl border border-white/10">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Información del Viaje</h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Distancia</span>
                                    <span className="text-white font-semibold">{route.distance}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Precio</span>
                                    <span className="text-green-400 font-semibold">{route.estimatedPrice}</span>
                                </div>

                                {eta && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">Llegada estimada</span>
                                        <span className="text-brand-400 font-semibold">
                                            {eta.toLocaleTimeString('es-CL', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="glass-panel p-4 rounded-xl border border-white/10">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Estado del Viaje</h3>

                            <div className="space-y-3">
                                {timelineSteps.map((step, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step.completed
                                                ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
                                                : 'bg-white/5 text-slate-600 border-2 border-white/10'
                                            }`}>
                                            {step.icon}
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <p className={`text-sm font-medium ${step.completed ? 'text-white' : 'text-slate-500'
                                                }`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <button className="w-full px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-bold hover:bg-red-500/20 transition-colors">
                                Cancelar Viaje
                            </button>
                            <button className="w-full px-4 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-bold hover:bg-white/10 transition-colors">
                                Reportar Problema
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveTrackingModal;
