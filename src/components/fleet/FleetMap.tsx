import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { divIcon, LatLng } from 'leaflet';
import { Vehicle, MapFilter, VehicleLocation } from '@/types';
import { Filter, MapPin, Plus, Minus, Home, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface FleetMapProps {
    vehicles: Vehicle[];
}

interface VehicleCluster {
    position: VehicleLocation;
    vehicles: Vehicle[];
    isCluster: boolean;
}

// Custom marker icons based on vehicle status
const createMarkerIcon = (status: Vehicle['status']) => {
    const colors = {
        Active: '#22c55e',
        Maintenance: '#f97316',
        Idle: '#64748b'
    };

    const color = colors[status];

    return divIcon({
        className: 'custom-marker',
        html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 15px ${color}80;
        animation: pulse 2s infinite;
      "></div>
    `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
};

// Custom cluster icon
const createClusterIcon = (count: number) => {
    let size = 40;
    let color = '#6366f1'; // brand color

    if (count >= 50) {
        size = 60;
        color = '#f97316'; // warning color
    } else if (count >= 10) {
        size = 50;
        color = '#22c55e'; // accent color
    }

    return divIcon({
        html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 4px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-center: center;
        font-weight: bold;
        color: white;
        font-size: ${size > 50 ? '18px' : size > 40 ? '16px' : '14px'};
        box-shadow: 0 0 20px ${color}80;
      ">
        ${count}
      </div>
    `,
        className: 'custom-cluster-icon',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2]
    });
};

// Simple clustering algorithm
const clusterVehicles = (vehicles: Vehicle[], zoom: number): VehicleCluster[] => {
    if (zoom >= 12) {
        // At high zoom levels, don't cluster
        return vehicles.map(v => ({
            position: v.location!,
            vehicles: [v],
            isCluster: false
        }));
    }

    const clusters: VehicleCluster[] = [];
    const processed = new Set<string>();
    const clusterRadius = zoom >= 10 ? 0.01 : zoom >= 8 ? 0.03 : 0.05; // degrees

    vehicles.forEach(vehicle => {
        if (!vehicle.location || processed.has(vehicle.id)) return;

        const nearby = vehicles.filter(v => {
            if (!v.location || processed.has(v.id)) return false;
            const distance = Math.sqrt(
                Math.pow(v.location.lat - vehicle.location!.lat, 2) +
                Math.pow(v.location.lng - vehicle.location!.lng, 2)
            );
            return distance < clusterRadius;
        });

        nearby.forEach(v => processed.add(v.id));

        if (nearby.length > 1) {
            // Calculate center of cluster
            const avgLat = nearby.reduce((sum, v) => sum + v.location!.lat, 0) / nearby.length;
            const avgLng = nearby.reduce((sum, v) => sum + v.location!.lng, 0) / nearby.length;

            clusters.push({
                position: { lat: avgLat, lng: avgLng },
                vehicles: nearby,
                isCluster: true
            });
        } else {
            clusters.push({
                position: vehicle.location,
                vehicles: [vehicle],
                isCluster: false
            });
        }
    });

    return clusters;
};

// Custom Zoom Controls Component
const CustomZoomControls: React.FC = memo(() => {
    const map = useMap();

    const handleZoomIn = useCallback(() => {
        map.zoomIn();
    }, [map]);

    const handleZoomOut = useCallback(() => {
        map.zoomOut();
    }, [map]);

    const handleResetZoom = useCallback(() => {
        map.setView([-41.4693, -72.9424], 10);
    }, [map]);

    return (
        <div className="absolute top-24 left-6 z-[1000] bg-dark-900/90 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden shadow-xl">
            <button
                onClick={handleZoomIn}
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-brand-500/20 transition-colors border-b border-white/10"
                title="Acercar"
            >
                <Plus className="w-5 h-5" />
            </button>
            <button
                onClick={handleZoomOut}
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-brand-500/20 transition-colors border-b border-white/10"
                title="Alejar"
            >
                <Minus className="w-5 h-5" />
            </button>
            <button
                onClick={handleResetZoom}
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-brand-500/20 transition-colors"
                title="Vista inicial"
            >
                <Home className="w-4 h-4" />
            </button>
        </div>
    );
});

CustomZoomControls.displayName = 'CustomZoomControls';

// Location Button Component
const LocationButton: React.FC = memo(() => {
    const map = useMap();
    const [loading, setLoading] = useState(false);

    const handleLocate = useCallback(() => {
        setLoading(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    map.setView([latitude, longitude], 13);
                    setLoading(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    showToast.error('Error de ubicación', 'No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
                    setLoading(false);
                }
            );
        } else {
            showToast.warning('Geolocalización no disponible', 'Tu navegador no soporta geolocalización.');
            setLoading(false);
        }
    }, [map]);

    return (
        <button
            onClick={handleLocate}
            disabled={loading}
            className="absolute top-24 right-6 z-[1000] w-10 h-10 bg-dark-900/90 backdrop-blur-md border border-white/10 rounded-lg flex items-center justify-center text-white hover:bg-brand-500/20 transition-colors shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            title="Centrar en mi ubicación"
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
                <Navigation className="w-5 h-5" />
            )}
        </button>
    );
});

LocationButton.displayName = 'LocationButton';

// Legend Component
const MapLegend: React.FC = memo(() => {
    return (
        <div className="absolute bottom-6 right-6 z-[1000] bg-dark-900/90 backdrop-blur-md border border-white/10 rounded-lg p-4 shadow-xl">
            <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">Estado de Vehículos</h4>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    <span className="text-slate-300 text-xs">Activo</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-sm"></div>
                    <span className="text-slate-300 text-xs">Mantenimiento</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-500 rounded-full border-2 border-white shadow-sm"></div>
                    <span className="text-slate-300 text-xs">Inactivo</span>
                </div>
            </div>
        </div>
    );
});

MapLegend.displayName = 'MapLegend';

// Filter Controls Component
const FilterControls: React.FC<{
    filters: MapFilter;
    onFilterChange: (filters: MapFilter) => void;
}> = memo(({ filters, onFilterChange }) => {
    return (
        <div className="absolute top-6 right-6 z-[1000] bg-dark-900/90 backdrop-blur-md border border-white/10 rounded-lg p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-brand-500" />
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">Filtros</h4>
            </div>
            <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={filters.showActive}
                        onChange={(e) => onFilterChange({ ...filters, showActive: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-600 bg-dark-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-slate-300 text-xs group-hover:text-white transition-colors">Activos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={filters.showMaintenance}
                        onChange={(e) => onFilterChange({ ...filters, showMaintenance: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-600 bg-dark-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-slate-300 text-xs group-hover:text-white transition-colors">Mantenimiento</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={filters.showIdle}
                        onChange={(e) => onFilterChange({ ...filters, showIdle: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-600 bg-dark-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-slate-300 text-xs group-hover:text-white transition-colors">Inactivos</span>
                </label>
            </div>
        </div>
    );
});

FilterControls.displayName = 'FilterControls';

// Zoom tracker component
const ZoomTracker: React.FC<{ onZoomChange: (zoom: number) => void }> = ({ onZoomChange }) => {
    const map = useMap();

    React.useEffect(() => {
        const handleZoom = () => {
            onZoomChange(map.getZoom());
        };

        map.on('zoomend', handleZoom);
        handleZoom(); // Initial zoom

        return () => {
            map.off('zoomend', handleZoom);
        };
    }, [map, onZoomChange]);

    return null;
};

const FleetMap: React.FC<FleetMapProps> = memo(({ vehicles }) => {
    const [filters, setFilters] = useState<MapFilter>({
        showActive: true,
        showMaintenance: true,
        showIdle: true
    });
    const [zoom, setZoom] = useState(10);
    const [realtimeVehicles, setRealtimeVehicles] = useState<Vehicle[]>(vehicles);

    // Update local vehicles when prop changes
    useEffect(() => {
        setRealtimeVehicles(vehicles);
    }, [vehicles]);

    // Listen for real-time GPS updates from drivers
    useEffect(() => {
        const handleLocationUpdate = (event: Event) => {
            const customEvent = event as CustomEvent<{
                vehicleId: string;
                location: { lat: number; lng: number };
                timestamp: number;
            }>;

            const { vehicleId, location } = customEvent.detail;

            // Update the vehicle's location in real-time
            setRealtimeVehicles(prevVehicles =>
                prevVehicles.map(vehicle =>
                    vehicle.id === vehicleId
                        ? { ...vehicle, location }
                        : vehicle
                )
            );
        };

        window.addEventListener('vehicle-location-update', handleLocationUpdate);

        return () => {
            window.removeEventListener('vehicle-location-update', handleLocationUpdate);
        };
    }, []);

    // Memoize filtered vehicles to avoid recalculation on every render
    const filteredVehicles = useMemo(() => {
        return realtimeVehicles.filter(vehicle => {
            if (vehicle.status === 'Active' && !filters.showActive) return false;
            if (vehicle.status === 'Maintenance' && !filters.showMaintenance) return false;
            if (vehicle.status === 'Idle' && !filters.showIdle) return false;
            return vehicle.location !== undefined;
        });
    }, [realtimeVehicles, filters]);

    // Memoize clusters
    const clusters = useMemo(() => {
        return clusterVehicles(filteredVehicles, zoom);
    }, [filteredVehicles, zoom]);

    // Memoize filter change handler
    const handleFilterChange = useCallback((newFilters: MapFilter) => {
        setFilters(newFilters);
    }, []);

    const handleZoomChange = useCallback((newZoom: number) => {
        setZoom(newZoom);
    }, []);

    // Center map on Puerto Montt, Chile
    const center: [number, number] = [-41.4693, -72.9424];

    return (
        <div className="relative w-full h-full min-h-[500px]">
            <MapContainer
                center={center}
                zoom={10}
                className="w-full h-full rounded-2xl"
                style={{ background: '#0f172a' }}
                zoomControl={false} // Disable default zoom control
            >
                {/* Dark mode tile layer */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Zoom Tracker */}
                <ZoomTracker onZoomChange={handleZoomChange} />

                {/* Custom Zoom Controls */}
                <CustomZoomControls />

                {/* Location Button */}
                <LocationButton />

                {/* Clustered Markers */}
                {clusters.map((cluster, index) => {
                    if (cluster.isCluster) {
                        // Render cluster marker
                        return (
                            <Marker
                                key={`cluster-${index}`}
                                position={[cluster.position.lat, cluster.position.lng]}
                                icon={createClusterIcon(cluster.vehicles.length)}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-2 min-w-[200px]">
                                        <h3 className="font-bold text-sm text-dark-900 mb-2">
                                            Cluster de {cluster.vehicles.length} vehículos
                                        </h3>
                                        <div className="max-h-48 overflow-y-auto space-y-2">
                                            {cluster.vehicles.map(vehicle => (
                                                <div key={vehicle.id} className="text-xs border-b border-slate-200 pb-2 last:border-0">
                                                    <p className="font-semibold">{vehicle.id} - {vehicle.plate}</p>
                                                    <p className="text-slate-600">{vehicle.model}</p>
                                                    <p>
                                                        <span className={`font-semibold ${vehicle.status === 'Active' ? 'text-green-600' :
                                                            vehicle.status === 'Maintenance' ? 'text-orange-600' :
                                                                'text-slate-600'
                                                            }`}>{vehicle.status}</span>
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2 italic">Haz zoom para ver marcadores individuales</p>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    } else {
                        // Render individual marker
                        const vehicle = cluster.vehicles[0];
                        return (
                            <Marker
                                key={vehicle.id}
                                position={[cluster.position.lat, cluster.position.lng]}
                                icon={createMarkerIcon(vehicle.status)}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-2 min-w-[240px]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="w-4 h-4 text-brand-500" />
                                            <h3 className="font-bold text-sm text-dark-900">{vehicle.id}</h3>
                                        </div>
                                        <div className="space-y-1 text-xs text-dark-700">
                                            <p><strong>Placa:</strong> {vehicle.plate}</p>
                                            <p><strong>Modelo:</strong> {vehicle.model}</p>
                                            <p><strong>Estado:</strong> <span className={`font-semibold ${vehicle.status === 'Active' ? 'text-green-600' :
                                                vehicle.status === 'Maintenance' ? 'text-orange-600' :
                                                    'text-slate-600'
                                                }`}>{vehicle.status}</span></p>
                                            <p><strong>Combustible:</strong> {vehicle.fuelLevel}%</p>
                                            <p><strong>Kilometraje:</strong> {vehicle.mileage.toLocaleString()} km</p>

                                            {/* GPS Information */}
                                            <div className="mt-2 pt-2 border-t border-slate-200">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Navigation className="w-3 h-3 text-brand-500" />
                                                    <strong className="text-brand-600">GPS en Tiempo Real</strong>
                                                </div>
                                                <p className="font-mono text-[10px] text-slate-600">
                                                    <strong>Lat:</strong> {vehicle.location?.lat.toFixed(6)}<br />
                                                    <strong>Lng:</strong> {vehicle.location?.lng.toFixed(6)}
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-1">
                                                    <strong>Actualizado:</strong> {new Date().toLocaleTimeString('es-CL')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    }
                })}
            </MapContainer>

            {/* Filter Controls */}
            <FilterControls filters={filters} onFilterChange={handleFilterChange} />

            {/* Legend */}
            <MapLegend />

            {/* Live Tracking Badge */}
            <div className="absolute top-6 left-6 z-[1000] bg-dark-900/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-mono text-white">RASTREO EN VIVO: PUERTO MONTT, CHILE</span>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        .custom-marker {
          background: transparent !important;
          border: none !important;
        }

        .custom-cluster-icon {
          background: transparent !important;
          border: none !important;
        }

        .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .leaflet-popup-tip {
          background: white;
        }

        .leaflet-control-attribution {
          background: rgba(15, 23, 42, 0.8) !important;
          color: rgba(148, 163, 184, 0.8) !important;
          font-size: 10px !important;
        }

        .leaflet-control-attribution a {
          color: rgba(99, 102, 241, 0.8) !important;
        }
      `}</style>
        </div>
    );
});

FleetMap.displayName = 'FleetMap';

export default FleetMap;
