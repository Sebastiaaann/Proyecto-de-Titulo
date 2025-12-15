import React, { useEffect, useMemo, useState } from 'react';
import { X, MapPin, Package, Truck, User, Clock, FileSignature, Trash2, CheckCircle2, Loader2, Star, Navigation } from 'lucide-react';
import RatingModal, { type RatingData } from '../routes/RatingModal';
import LiveTrackingModal from '../tracking/LiveTrackingModal';
import { useStore } from '@store/useStore';
import { useConfirm } from '@components/common/ConfirmDialog';
import { gpsService } from '@services/databaseService';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

type GpsTrackPoint = {
    latitude: number;
    longitude: number;
    timestamp: string;
    speed?: number;
};

const FitBounds: React.FC<{ bounds: LatLngBoundsExpression }>= ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        map.fitBounds(bounds, { padding: [24, 24] });
    }, [bounds, map]);
    return null;
};

interface DeliveryProof {
    signature: string;
    clientName?: string;
    clientId?: string;
    deliveredAt: number;
    notes?: string;
}

interface RouteRating {
    rating: number;
    tags: string[];
    comment: string;
    timestamp: number;
}

interface RegisteredRoute {
    id: string;
    origin: string;
    destination: string;
    distance: string;
    estimatedPrice: string;
    vehicleType: string;
    driver?: string;
    vehicle?: string;
    timestamp: number;
    status: 'Pending' | 'In Progress' | 'Completed';
    deliveryProof?: DeliveryProof;
    rating?: RouteRating;
}

interface RouteDetailsModalProps {
    route: RegisteredRoute;
    onClose: () => void;
    onStatusChange?: (routeId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => void;
    onDelete?: (routeId: string) => void;
}

const RouteDetailsModal: React.FC<RouteDetailsModalProps> = ({ route, onClose, onStatusChange, onDelete }) => {
    const { confirm, ConfirmComponent } = useConfirm();
    const [showRating, setShowRating] = useState(false);
    const [showTracking, setShowTracking] = useState(false);
    const [trackLoading, setTrackLoading] = useState(false);
    const [trackError, setTrackError] = useState<string | null>(null);
    const [trackPoints, setTrackPoints] = useState<GpsTrackPoint[]>([]);
    const updateRouteRating = useStore((state) => state.updateRouteRating);
    const updateRouteStatus = useStore((state) => state.updateRouteStatus);
    const removeRoute = useStore((state) => state.removeRoute);

    useEffect(() => {
        let cancelled = false;

        const loadLocalTrack = (): GpsTrackPoint[] => {
            try {
                const raw = localStorage.getItem(`gps_track_${route.id}`);
                if (!raw) return [];
                const parsed = JSON.parse(raw) as Array<any>;
                return (parsed || [])
                    .map((p: any) => ({
                        latitude: Number(p.latitude),
                        longitude: Number(p.longitude),
                        timestamp: String(p.timestamp ?? ''),
                        speed: p.speed != null ? Number(p.speed) : undefined,
                    }))
                    .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && Boolean(p.timestamp));
            } catch {
                return [];
            }
        };

        const loadTrack = async () => {
            if (route.status !== 'Completed') return;

            setTrackLoading(true);
            setTrackError(null);
            try {
                const history = await gpsService.getRouteHistory(route.id);
                if (cancelled) return;

                const points: GpsTrackPoint[] = (history || [])
                    .map((row: any) => ({
                        latitude: Number(row.latitude),
                        longitude: Number(row.longitude),
                        timestamp: String(row.timestamp),
                        speed: row.speed != null ? Number(row.speed) : undefined,
                    }))
                    .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));

                if (points.length >= 2) {
                    setTrackPoints(points);
                } else {
                    // Fallback local if DB has no points (offline/dev/RLS)
                    const local = loadLocalTrack();
                    setTrackPoints(local);
                }
            } catch (e) {
                if (cancelled) return;
                console.error('Error loading GPS track:', e);
                const local = loadLocalTrack();
                if (local.length >= 2) {
                    setTrackPoints(local);
                    setTrackError(null);
                } else {
                    setTrackError('No se pudo cargar el trayecto GPS de esta ruta.');
                    setTrackPoints([]);
                }
            } finally {
                if (!cancelled) setTrackLoading(false);
            }
        };

        loadTrack();
        return () => {
            cancelled = true;
        };
    }, [route.id, route.status]);

    const polylinePositions: LatLngExpression[] = useMemo(
        () => trackPoints.map((p) => [p.latitude, p.longitude] as LatLngExpression),
        [trackPoints]
    );

    const bounds: LatLngBoundsExpression | null = useMemo(() => {
        if (polylinePositions.length < 2) return null;
        return polylinePositions as LatLngBoundsExpression;
    }, [polylinePositions]);

    const startEnd = useMemo(() => {
        if (polylinePositions.length === 0) return null;
        const start = polylinePositions[0];
        const end = polylinePositions[polylinePositions.length - 1];
        return { start, end };
    }, [polylinePositions]);

    const handleStatusChange = async () => {
        const statusFlow = {
            'Pending': 'In Progress',
            'In Progress': 'Completed',
            'Completed': 'Pending'
        } as const;

        const newStatus = statusFlow[route.status];

        if (onStatusChange) {
            onStatusChange(route.id, newStatus);
        } else {
            await updateRouteStatus(route.id, newStatus);
        }
    };

    const handleDelete = async () => {
        confirm(
            'Eliminar Ruta',
            `¿Estás seguro de que deseas eliminar la ruta "${route.origin} → ${route.destination}"?\n\nEsta acción no se puede deshacer.`,
            async () => {
                if (onDelete) {
                    onDelete(route.id);
                } else {
                    await removeRoute(route.id);
                }
                onClose();
            },
            'danger'
        );
    };

    const handleRatingSubmit = async (ratingData: RatingData) => {
        await updateRouteRating(route.id, {
            rating: ratingData.rating,
            tags: ratingData.tags,
            comment: ratingData.comment,
            timestamp: ratingData.timestamp,
        });
        setShowRating(false);
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'Completed':
                return { color: 'green', icon: CheckCircle2, label: 'Completada' };
            case 'In Progress':
                return { color: 'blue', icon: Loader2, label: 'En Progreso' };
            default:
                return { color: 'orange', icon: Clock, label: 'Pendiente' };
        }
    };

    const statusInfo = getStatusInfo(route.status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-dark-900 border border-white/10 rounded-2xl shadow-2xl animate-slide-in-bottom">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-dark-900/95 backdrop-blur-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Package className="w-6 h-6 text-brand-500" />
                            Detalles de Ruta
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">ID: {route.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Cerrar modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status Badge & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-${statusInfo.color}-500/10 text-${statusInfo.color}-400 border border-${statusInfo.color}-500/20`}>
                                <StatusIcon className={`w-4 h-4 ${route.status === 'In Progress' ? 'animate-spin' : ''}`} />
                                {statusInfo.label}
                            </span>

                            {/* Live Tracking Button */}
                            {route.status === 'In Progress' && (
                                <button
                                    onClick={() => setShowTracking(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full text-sm font-bold hover:bg-blue-600/30 transition-all animate-pulse"
                                >
                                    <Navigation className="w-4 h-4" />
                                    Ver en Tiempo Real
                                </button>
                            )}
                        </div>

                        <div className="text-xs text-slate-400">
                            Registrada el {new Date(route.timestamp).toLocaleDateString('es-CL', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>

                    {/* Route Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass-panel p-4 rounded-xl border border-white/5">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-brand-500/10 rounded-lg">
                                    <MapPin className="w-5 h-5 text-brand-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Origen</p>
                                    <p className="text-white font-medium">{route.origin}</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-4 rounded-xl border border-white/5">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-accent-500/10 rounded-lg">
                                    <MapPin className="w-5 h-5 text-accent-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Destino</p>
                                    <p className="text-white font-medium">{route.destination}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trip Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-panel p-4 rounded-xl border border-white/5">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Distancia</p>
                            <p className="text-white font-bold text-lg font-mono">{route.distance}</p>
                        </div>

                        <div className="glass-panel p-4 rounded-xl border border-white/5">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Precio</p>
                            <p className="text-green-400 font-bold text-lg">{route.estimatedPrice}</p>
                        </div>

                        <div className="glass-panel p-4 rounded-xl border border-white/5">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Tipo Vehículo</p>
                            <p className="text-white font-medium text-sm">{route.vehicleType}</p>
                        </div>

                        <div className="glass-panel p-4 rounded-xl border border-white/5">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Vehículo</p>
                            <p className="text-white font-medium text-sm">{route.vehicle || 'No asignado'}</p>
                        </div>
                    </div>

                    {/* Completed Route Map (GPS track) */}
                    {route.status === 'Completed' && (
                        <div className="glass-panel p-4 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 mb-4">
                                <Navigation className="w-5 h-5 text-brand-500" />
                                <h3 className="text-white font-semibold">Trayecto Realizado</h3>
                            </div>

                            {trackLoading ? (
                                <div className="h-64 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Cargando mapa…
                                    </div>
                                </div>
                            ) : trackError ? (
                                <div className="h-40 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center">
                                    <p className="text-sm text-slate-400">{trackError}</p>
                                </div>
                            ) : polylinePositions.length >= 2 && bounds ? (
                                <div className="h-64 rounded-xl overflow-hidden border border-white/10">
                                    <MapContainer
                                        style={{ height: '100%', width: '100%' }}
                                        center={polylinePositions[0]}
                                        zoom={13}
                                        scrollWheelZoom={false}
                                    >
                                        <TileLayer
                                            attribution='&copy; OpenStreetMap'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <FitBounds bounds={bounds} />
                                        <Polyline positions={polylinePositions} pathOptions={{ color: '#6366f1', weight: 5, opacity: 0.9 }} />
                                        {startEnd && (
                                            <>
                                                <Marker position={startEnd.start} />
                                                <Marker position={startEnd.end} />
                                            </>
                                        )}
                                    </MapContainer>
                                </div>
                            ) : (
                                <div className="h-40 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center">
                                    <p className="text-sm text-slate-400">
                                        No hay puntos GPS registrados para esta ruta.
                                    </p>
                                </div>
                            )}

                            {!trackLoading && !trackError && polylinePositions.length > 0 && (
                                <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
                                    <span>{trackPoints.length} puntos GPS</span>
                                    <span>
                                        {new Date(trackPoints[0].timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                        {' — '}
                                        {new Date(trackPoints[trackPoints.length - 1].timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Driver Information */}
                    {route.driver && (
                        <div className="glass-panel p-4 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/10 rounded-lg">
                                    <User className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Conductor Asignado</p>
                                    <p className="text-white font-medium">{route.driver}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delivery Proof */}
                    {route.deliveryProof && (
                        <div className="glass-panel p-4 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 mb-4">
                                <FileSignature className="w-5 h-5 text-brand-500" />
                                <h3 className="text-white font-semibold">Comprobante de Entrega</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {route.deliveryProof.clientName && (
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Cliente</p>
                                        <p className="text-white font-medium">{route.deliveryProof.clientName}</p>
                                    </div>
                                )}
                                {route.deliveryProof.clientId && (
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">RUT/ID</p>
                                        <p className="text-white font-medium font-mono">{route.deliveryProof.clientId}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Entregado</p>
                                    <p className="text-white font-medium">
                                        {new Date(route.deliveryProof.deliveredAt).toLocaleString('es-CL')}
                                    </p>
                                </div>
                            </div>

                            {route.deliveryProof.notes && (
                                <div className="mb-4">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Notas</p>
                                    <p className="text-slate-300 text-sm">{route.deliveryProof.notes}</p>
                                </div>
                            )}

                            {/* Signature */}
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Firma del Cliente</p>
                                <div className="bg-slate-900 rounded-lg p-2 border border-slate-700">
                                    <img
                                        src={route.deliveryProof.signature}
                                        alt="Firma del cliente"
                                        className="w-full h-32 object-contain invert-0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rating Section */}
                    {route.rating ? (
                        <div className="glass-panel p-4 rounded-xl border border-white/5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold text-slate-400 uppercase">Calificación</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-5 h-5 ${star <= route.rating!.rating
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-slate-600'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {route.rating.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {route.rating.tags.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-medium border border-yellow-500/20"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {route.rating.comment && (
                                <p className="text-sm text-slate-300 italic">"{route.rating.comment}"</p>
                            )}
                        </div>
                    ) : route.status === 'Completed' && route.driver && (
                        <button
                            onClick={() => setShowRating(true)}
                            className="w-full p-4 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl font-bold hover:bg-brand-500/20 transition-colors flex items-center justify-center gap-2"
                        >
                            <Star className="w-5 h-5" />
                            Calificar este viaje
                        </button>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 flex items-center justify-between gap-3 p-6 border-t border-white/10 bg-dark-900/95 backdrop-blur-sm">
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Eliminar Ruta
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white/5 text-slate-300 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                        >
                            Cerrar
                        </button>
                        {route.status !== 'Completed' && (
                            <button
                                onClick={handleStatusChange}
                                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
                            >
                                {route.status === 'Pending' ? (
                                    <>
                                        <Loader2 className="w-4 h-4" />
                                        Iniciar Ruta
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Completar Ruta
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            {showRating && route.driver && (
                <RatingModal
                    routeId={route.id}
                    driverName={route.driver}
                    onClose={() => setShowRating(false)}
                    onSubmit={handleRatingSubmit}
                />
            )}

            {/* Live Tracking Modal */}
            {showTracking && (
                <LiveTrackingModal
                    route={route}
                    onClose={() => setShowTracking(false)}
                />
            )}

            {/* Confirm Dialog */}
            <ConfirmComponent />
        </div>
    );
};

export default RouteDetailsModal;
