import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Flag, Loader2 } from 'lucide-react';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = new Icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Custom icons
const DriverIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="#ffffff" stroke-width="3"/>
      <path d="M20 10 L20 30 M10 20 L30 20" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const OriginIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="#22c55e" stroke="#ffffff" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="#ffffff"/>
    </svg>
  `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

const DestinationIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
      <path d="M16 8 L16 24 M8 16 L24 16" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

interface LiveTrackingMapProps {
    origin: [number, number];
    destination: [number, number];
    driverLocation?: [number, number];
    routePath?: [number, number][];
    driverName?: string;
    vehiclePlate?: string;
    estimatedArrival?: Date;
}

// Component to auto-fit bounds
function MapBounds({ positions }: { positions: [number, number][] }) {
    const map = useMap();

    useEffect(() => {
        if (positions.length > 0) {
            const bounds = positions.reduce(
                (acc, pos) => acc.extend(pos),
                new L.LatLngBounds(positions[0], positions[0])
            );
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [positions, map]);

    return null;
}

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
    origin,
    destination,
    driverLocation,
    routePath,
    driverName = 'Conductor',
    vehiclePlate,
    estimatedArrival,
}) => {
    const [currentPosition, setCurrentPosition] = useState<[number, number] | undefined>(driverLocation);

    // Update driver position when it changes
    useEffect(() => {
        if (driverLocation) {
            setCurrentPosition(driverLocation);
        }
    }, [driverLocation]);

    // Calculate positions for map bounds
    const allPositions = [
        origin,
        destination,
        ...(currentPosition ? [currentPosition] : []),
    ];

    // Default route path (straight line if not provided)
    const displayPath = routePath || [origin, destination];

    return (
        <div className="relative w-full h-full rounded-xl overflow-hidden">
            <MapContainer
                center={origin}
                zoom={13}
                className="w-full h-full"
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Auto-fit bounds */}
                <MapBounds positions={allPositions} />

                {/* Route path */}
                <Polyline
                    positions={displayPath}
                    color="#3b82f6"
                    weight={4}
                    opacity={0.7}
                />

                {/* Origin marker */}
                <Marker position={origin} icon={OriginIcon}>
                    <Popup>
                        <div className="text-center">
                            <p className="font-bold text-green-600">Origen</p>
                            <p className="text-xs text-gray-600">Punto de recogida</p>
                        </div>
                    </Popup>
                </Marker>

                {/* Destination marker */}
                <Marker position={destination} icon={DestinationIcon}>
                    <Popup>
                        <div className="text-center">
                            <p className="font-bold text-red-600">Destino</p>
                            <p className="text-xs text-gray-600">Punto de entrega</p>
                        </div>
                    </Popup>
                </Marker>

                {/* Driver marker */}
                {currentPosition && (
                    <Marker position={currentPosition} icon={DriverIcon}>
                        <Popup>
                            <div className="text-center">
                                <p className="font-bold text-blue-600">{driverName}</p>
                                {vehiclePlate && (
                                    <p className="text-xs text-gray-600">{vehiclePlate}</p>
                                )}
                                {estimatedArrival && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Llegada: {new Date(estimatedArrival).toLocaleTimeString('es-CL', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* Driver info overlay */}
            {currentPosition && (
                <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
                    <div className="glass-panel p-4 rounded-xl border border-white/10 shadow-2xl pointer-events-auto">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    {driverName.charAt(0)}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                            </div>

                            <div className="flex-1">
                                <h4 className="font-bold text-white">{driverName}</h4>
                                {vehiclePlate && (
                                    <p className="text-sm text-slate-400">{vehiclePlate}</p>
                                )}
                            </div>

                            {estimatedArrival && (
                                <div className="text-right">
                                    <p className="text-xs text-slate-400">Llegada estimada</p>
                                    <p className="text-lg font-bold text-brand-400">
                                        {new Date(estimatedArrival).toLocaleTimeString('es-CL', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading indicator when no driver location */}
            {!currentPosition && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark-900/50 backdrop-blur-sm z-[1000]">
                    <div className="glass-panel p-6 rounded-xl text-center">
                        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
                        <p className="text-white font-semibold">Esperando ubicación del conductor...</p>
                        <p className="text-sm text-slate-400 mt-1">El conductor aún no ha iniciado el viaje</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveTrackingMap;
