
import React, { useState, useEffect } from 'react';
import { analyzeRouteRisks } from '../services/geminiService';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Activity, Satellite, Loader2, AlertTriangle, FileText } from 'lucide-react';

// Fix for default Leaflet icons in React/Webpack/ESM environments
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const truckIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

// Helper component to fly to location when selectedTruck changes
const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 2 });
  }, [center, map]);
  return null;
};

// --- NEW: Text Formatter Component ---
const FormattedAnalysis = ({ text }: { text: string }) => {
  if (!text) return null;

  // Simple parser to handle Gemini's markdown-like output
  const lines = text.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="space-y-3 font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        
        // Detection: Executive Summary / Conclusion (Usually at the end)
        if (trimmed.includes("Evaluación de Riesgo Concisa") || trimmed.includes("Resumen:")) {
            const content = trimmed.split(':')[1] || trimmed;
            return (
                <div key={idx} className="mt-6 p-4 bg-brand-900/30 border border-brand-500/40 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                    <h5 className="text-brand-400 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Activity className="w-3 h-3" /> Resumen Ejecutivo
                    </h5>
                    <p className="text-slate-200 text-sm font-medium leading-relaxed italic">
                        "{content.replace(/\*\*/g, '').trim()}"
                    </p>
                </div>
            );
        }

        // Detection: Headers (Bolded lines or ending in colon)
        if ((trimmed.startsWith('**') && trimmed.endsWith('**')) || (trimmed.endsWith(':') && !trimmed.startsWith('*'))) {
            return (
                <h4 key={idx} className="text-brand-400 font-bold text-sm uppercase tracking-wide mt-5 border-b border-white/10 pb-1 mb-2">
                    {trimmed.replace(/\*\*/g, '')}
                </h4>
            );
        }

        // Detection: List Items (Bullets or Numbers)
        if (trimmed.startsWith('*') || trimmed.match(/^\d+\./)) {
            // Clean markers
            const cleanText = trimmed.replace(/^[\*\d\.]+\s*/, '');
            
            // Check for "Title: Description" pattern
            const parts = cleanText.split(':');
            if (parts.length > 1) {
                return (
                    <div key={idx} className="flex items-start gap-2 ml-2 mb-2 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0"></span>
                        <span className="text-slate-300 leading-relaxed">
                            <strong className="text-white font-semibold">{parts[0].replace(/\*\*/g, '')}:</strong>
                            {parts.slice(1).join(':').replace(/\*\*/g, '')}
                        </span>
                    </div>
                );
            }
            return (
                <div key={idx} className="flex items-start gap-2 ml-2 mb-2 text-sm">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0"></span>
                    <span className="text-slate-300 leading-relaxed">{cleanText.replace(/\*\*/g, '')}</span>
                </div>
            );
        }

        // Standard Paragraph
        return (
            <p key={idx} className="text-slate-400 text-sm leading-relaxed mb-2">
                {trimmed.replace(/\*\*/g, '')}
            </p>
        );
      })}
    </div>
  );
};

const FleetTracking: React.FC = () => {
    const [analysis, setAnalysis] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
    
    // Mock Data - Updated with Coordinates for Southern Chile
    const trucks = [
        { 
            id: "TRK-882", 
            location: "Puerto Montt, Los Lagos", 
            coords: [-41.4689, -72.9411] as [number, number],
            status: "In Transit", 
            destination: "Osorno, Los Lagos", 
            load: 85, 
            driver: "Carlos M." 
        },
        { 
            id: "TRK-104", 
            location: "Castro, Chiloé", 
            coords: [-42.4721, -73.7732] as [number, number],
            status: "Warning", 
            destination: "Ancud, Chiloé", 
            load: 40, 
            driver: "Ana S." 
        },
        { 
            id: "TRK-339", 
            location: "Valdivia, Los Ríos", 
            coords: [-39.8196, -73.2452] as [number, number],
            status: "In Transit", 
            destination: "Puerto Varas, Los Lagos", 
            load: 92, 
            driver: "Jorge O." 
        },
    ];

    const activeTruck = trucks.find(t => t.id === selectedTruckId) || trucks[0];

    const handleAnalyze = async (origin: string, dest: string, truckId: string) => {
        setSelectedTruckId(truckId);
        setLoading(true);
        const res = await analyzeRouteRisks(origin, dest);
        setAnalysis(res);
        setLoading(false);
    };

    useEffect(() => {
        // Initial analysis
        if (!selectedTruckId) {
            handleAnalyze(trucks[0].location, trucks[0].destination, trucks[0].id);
        }
    }, []);

    return (
        <div className="min-h-screen pt-24 px-4 bg-dark-950 pb-10">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Satellite className="w-8 h-8 text-brand-500 animate-pulse-slow" />
                            Rastreo Satelital
                        </h2>
                        <p className="text-slate-400">Monitoreo GPS en tiempo real y ubicación de flota.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="glass-panel px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3">
                            <span className="text-xs text-slate-400 uppercase font-bold">Estado Red GPS</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-green-400 font-mono text-sm">SEÑAL ESTABLE</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Vehicle List */}
                    <div className="col-span-1 space-y-4 h-[680px] overflow-y-auto pr-2 custom-scrollbar">
                        <h3 className="text-slate-400 text-xs uppercase font-bold mb-2">Flota en Ruta</h3>
                        {trucks.map((truck) => (
                            <div 
                                key={truck.id} 
                                onClick={() => handleAnalyze(truck.location, truck.destination, truck.id)}
                                className={`p-5 rounded-xl border cursor-pointer transition-all relative overflow-hidden ${
                                    selectedTruckId === truck.id 
                                    ? 'bg-white/10 border-brand-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                                    : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <div>
                                        <h3 className="text-white font-mono font-bold text-lg">{truck.id}</h3>
                                        <p className="text-xs text-slate-500">{truck.driver}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded border ${
                                        truck.status === 'Warning' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'
                                    }`}>
                                        {truck.status === 'Warning' ? 'Alerta' : 'En Tránsito'}
                                    </span>
                                </div>
                                <div className="space-y-2 relative z-10">
                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                        <MapPin className="w-4 h-4 text-brand-500" /> {truck.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Navigation className="w-4 h-4" /> {truck.destination}
                                    </div>
                                </div>
                                {selectedTruckId === truck.id && (
                                    <div className="absolute bottom-0 right-0 p-2">
                                        <Activity className="w-12 h-12 text-brand-500/10" />
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        <div className="p-4 rounded-xl border border-dashed border-white/10 bg-white/5 text-center mt-4">
                            <p className="text-xs text-slate-500">Mostrando 3 de 24 vehículos activos</p>
                        </div>
                    </div>

                    {/* Right Column: Map & Analysis Panel */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* React Leaflet Map */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 h-[500px] relative shadow-xl">
                            <div className="w-full h-full bg-slate-950 rounded-xl relative overflow-hidden z-0 group">
                                <MapContainer 
                                    center={activeTruck.coords} 
                                    zoom={13} 
                                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                                >
                                    {/* Dark Mode Tiles */}
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    />
                                    
                                    <MapController center={activeTruck.coords} />

                                    {trucks.map(truck => (
                                        <Marker 
                                            key={truck.id} 
                                            position={truck.coords} 
                                            icon={truckIcon}
                                            eventHandlers={{
                                                click: () => handleAnalyze(truck.location, truck.destination, truck.id),
                                            }}
                                        >
                                            <Popup className="custom-popup">
                                                <div className="p-2">
                                                    <h3 className="font-bold text-dark-900">{truck.id}</h3>
                                                    <p className="text-xs text-dark-800">{truck.driver}</p>
                                                    <p className="text-xs font-semibold mt-1">{truck.status}</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>

                                {/* Floating Truck Info Overlay */}
                                <div className="absolute top-4 right-4 z-[500]">
                                    <div className="bg-black/80 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-2">
                                        <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
                                        {activeTruck.id}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Analysis Section (Moved below map) */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg animate-slide-up relative overflow-hidden min-h-[300px]">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>
                            
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="hidden md:block p-3 bg-brand-500/10 rounded-lg border border-brand-500/20 flex-shrink-0">
                                    <FileText className="w-6 h-6 text-brand-500" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                                Informe de Riesgo de Ruta
                                                <span className="px-2 py-0.5 text-[10px] bg-white/10 rounded-full text-slate-400 font-mono uppercase">Gemini 2.5 Flash</span>
                                            </h3>
                                            <p className="text-slate-500 text-xs font-mono mt-1">
                                                CONTEXTO: {activeTruck.location.toUpperCase()} &rarr; {activeTruck.destination.toUpperCase()}
                                            </p>
                                        </div>
                                        {!loading && (
                                            <button onClick={() => handleAnalyze(activeTruck.location, activeTruck.destination, activeTruck.id)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors" title="Regenerar Análisis">
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-brand-400 text-sm animate-pulse rounded-xl bg-black/20 border border-white/5">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                            <span>Analizando topografía, clima y tráfico en tiempo real...</span>
                                        </div>
                                    ) : (
                                        <div className="bg-black/20 rounded-xl border border-white/5 p-6">
                                            {analysis ? (
                                                <FormattedAnalysis text={analysis} />
                                            ) : (
                                                <div className="text-center py-8 text-slate-500">
                                                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <p>Selecciona un vehículo para iniciar el análisis.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default FleetTracking;
