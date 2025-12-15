import React, { useState, useEffect } from 'react';
import { generateSmartQuote } from '@services/geminiService';
import { MapPin, Truck, DollarSign, Save, Calculator, Zap, AlertCircle, CheckCircle2, Loader2, PieChart, Fuel, FileText, Download, Eye, X, Calendar, User } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';
import VehicleSelector from './VehicleSelector';
import FareEstimator from './FareEstimator';
import { showToast } from '@components/common/Toast';
import LoadingButton from '@components/common/LoadingButton';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@utils/errorMessages';
import { useStore } from '@store/useStore';
import { driverService, vehicleService } from '@services/databaseService';
import { Driver, Vehicle, AppView } from '@/types';
import { VEHICLE_OPTIONS, calculateFareEstimate, type VehicleOption, type FareEstimate } from '@/types/vehicle-options';

interface RouteFormData {
  origin: string;
  destination: string;
  distance: number;
  cargoDescription: string;
  cargoWeight: number;
  driver: string;
  vehicle: string;
  clientQuote: number;
}

interface RouteAnalysis {
  revenue: number;
  aiRecommendations: string[];
  riskScore: number;
}

const RouteBuilder: React.FC = () => {
  const { pendingRouteData, clearPendingRouteData, addRoute, registeredRoutes, updateRouteStatus } = useStore();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState<RouteFormData>({
    origin: '',
    destination: '',
    distance: 0,
    cargoDescription: '',
    cargoWeight: 0,
    driver: '',
    vehicle: '',
    clientQuote: 0,
  });

  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<any | null>(null);

  // Uber-style vehicle selection
  const [selectedVehicleOption, setSelectedVehicleOption] = useState<VehicleOption | null>(null);
  const [fareEstimate, setFareEstimate] = useState<FareEstimate | null>(null);

  // Cargar conductores y vehículos desde Supabase
  useEffect(() => {
    loadData();

    // Escuchar cambios en tiempo real
    const handleVehicleChange = () => loadData();
    const handleDriverChange = () => loadData();

    window.addEventListener('vehicle-change', handleVehicleChange);
    window.addEventListener('driver-change', handleDriverChange);

    return () => {
      window.removeEventListener('vehicle-change', handleVehicleChange);
      window.removeEventListener('driver-change', handleDriverChange);
    };
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [driversData, vehiclesData] = await Promise.all([
        driverService.getAll(),
        vehicleService.getAll()
      ]);
      setDrivers(driversData.filter(d => d.status === 'Available' || d.status === 'On Route'));
      setVehicles(vehiclesData.filter(v => v.status === 'Active'));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  React.useEffect(() => {
    if (pendingRouteData) {
      setFormData(prev => ({
        ...prev,
        origin: pendingRouteData.origin,
        destination: pendingRouteData.destination,
        distance: parseFloat(pendingRouteData.distance.replace(/[^0-9.]/g, '')) || 0,
        cargoDescription: pendingRouteData.cargoDescription,
        clientQuote: parseFloat(pendingRouteData.estimatedPrice.replace(/[^0-9.]/g, '')) || 0,
        vehicle: '', // Vehicle type from planner might not match dropdown exactly, let user choose or map it
      }));
      clearPendingRouteData();
    }
  }, [pendingRouteData, clearPendingRouteData]);

  // Calculate distance when coords change
  React.useEffect(() => {
    if (originCoords && destCoords) {
      const R = 6371; // Radius of the earth in km
      const dLat = deg2rad(destCoords[0] - originCoords[0]);
      const dLon = deg2rad(destCoords[1] - originCoords[1]);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(originCoords[0])) * Math.cos(deg2rad(destCoords[0])) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c; // Distance in km
      setFormData(prev => ({ ...prev, distance: Math.round(d) }));
    }
  }, [originCoords, destCoords]);

  // Auto-calculate fare when distance or vehicle changes
  React.useEffect(() => {
    if (formData.distance > 0 && selectedVehicleOption) {
      const estimate = calculateFareEstimate(formData.distance, selectedVehicleOption);
      setFareEstimate(estimate);
      setFormData(prev => ({ ...prev, clientQuote: estimate.total }));
    } else if (formData.distance > 0) {
      // Default estimation if no vehicle selected
      const estimatedPrice = Math.round(formData.distance * 450);
      setFormData(prev => ({ ...prev, clientQuote: estimatedPrice }));
    }
  }, [formData.distance, selectedVehicleOption]);

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const [analysis, setAnalysis] = useState<RouteAnalysis | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: keyof RouteFormData, value: any) => {
    // 🔒 SANITIZACIÓN DE INPUTS
    let sanitizedValue = value;

    if (typeof value === 'string') {
      // Remover espacios al inicio/final -> Solo al guardar, no al escribir
      // sanitizedValue = value.trim(); // CAUSA BUG: No deja escribir espacios


      // Prevenir XSS básico removiendo tags HTML
      sanitizedValue = sanitizedValue.replace(/<[^>]*>/g, '');

      // Limitar longitud máxima para campos de texto
      if (field === 'cargoDescription' && sanitizedValue.length > 500) {
        sanitizedValue = sanitizedValue.substring(0, 500);
        showToast.warning('La descripción fue truncada a 500 caracteres');
      }

      if ((field === 'origin' || field === 'destination') && sanitizedValue.length > 200) {
        sanitizedValue = sanitizedValue.substring(0, 200);
      }
    }

    // Validar números no negativos
    if (typeof sanitizedValue === 'number' && sanitizedValue < 0) {
      sanitizedValue = 0;
    }

    setFormData({ ...formData, [field]: sanitizedValue });
  };

  const calculateRoute = async () => {
    if (!formData.origin || !formData.destination || formData.distance === 0 || formData.clientQuote === 0) {
      showToast.warning(ERROR_MESSAGES.FORM_INCOMPLETE);
      return;
    }

    setLoading(true);

    const revenue = formData.clientQuote;

    const newAnalysis: RouteAnalysis = {
      revenue,
      aiRecommendations: [],
      riskScore: 0,
    };

    setAnalysis(newAnalysis);

    try {
      const aiQuote = await generateSmartQuote(
        formData.cargoDescription,
        `${formData.origin} a ${formData.destination}, ${formData.distance}km`
      );

      setAiInsight(`Gemini AI sugiere: ${aiQuote.logisticsAdvice.join(' | ')}`);
      newAnalysis.aiRecommendations = aiQuote.logisticsAdvice;
      newAnalysis.riskScore = 100 - aiQuote.confidenceScore;
      setAnalysis({ ...newAnalysis });
    } catch (error) {
      console.error('AI Analysis failed', error);
    }

    setLoading(false);
  };

  const saveRoute = async () => {
    if (!analysis) return;

    setIsSaving(true);
    try {
      const newRoute = {
        id: crypto.randomUUID(), // Proper UUID for Supabase
        origin: formData.origin,
        destination: formData.destination,
        distance: `${formData.distance} km`,
        estimatedPrice: `$${formData.clientQuote.toLocaleString('es-CL')}`,
        vehicleType: (aiInsight ? (aiInsight.includes('Grande') ? 'Camión Grande' : aiInsight.includes('Medano') ? 'Camión Mediano' : 'Camión Pequeño') : 'Camión Mediano') as any, // Cast temporarly or map correctly
        driver: formData.driver || 'Asignación Pendiente',
        vehicle: formData.vehicle || undefined,
        timestamp: Date.now(),
        status: 'Pending' as const
      };

      await addRoute(newRoute);
      // El toast ya se muestra en el store, no duplicar aquí
    } catch (error) {
      // El error ya se maneja en el store
      console.error('Error saving route:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveAsTemplate = async () => {
    if (!formData.origin || !formData.destination) return;
    showToast.success("Ruta guardada como plantilla frecuente");
  };

  const resetForm = () => {
    setFormData({
      origin: '',
      destination: '',
      distance: 0,
      cargoDescription: '',
      cargoWeight: 0,
      driver: '',
      vehicle: '',
      clientQuote: 0,
    });
    setAnalysis(null);
    setAiInsight('');
  };

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-10 bg-dark-950 text-slate-200">
      <div className="max-w-7xl mx-auto animate-fade-in">

        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-brand-500" />
            Constructor de Rutas con Análisis Financiero
          </h2>
          <p className="text-slate-400">Crea rutas optimizadas y analiza rentabilidad en tiempo real con Gemini AI.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">

            <div className="glass-panel border border-white/5 rounded-2xl p-6 animate-slide-up">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Manifiesto de Carga</label>
                  <textarea
                    value={formData.cargoDescription}
                    onChange={(e) => handleInputChange('cargoDescription', e.target.value)}
                    className="w-full h-32 bg-dark-900 border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                    placeholder="ej: 12 Pallets de Electrónicos, aprox 4.5 toneladas. Frágil."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detalles de Ruta</label>
                  <div className="space-y-3">
                    <AddressAutocomplete
                      label="Origen"
                      value={formData.origin}
                      onChange={(val, coords) => {
                        handleInputChange('origin', val);
                        if (coords) setOriginCoords(coords);
                      }}
                    />
                    <AddressAutocomplete
                      label="Destino"
                      value={formData.destination}
                      onChange={(val, coords) => {
                        handleInputChange('destination', val);
                        if (coords) setDestCoords(coords);
                      }}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Distancia (km)</label>
                        <input
                          type="text"
                          value={formData.distance > 0 ? `${formData.distance} km` : ''}
                          readOnly
                          className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-brand-500 outline-none transition-colors cursor-not-allowed opacity-70"
                          placeholder="Calculado automáticamente"
                        />
                      </div>
                      <Input
                        label="Peso (ton)"
                        type="number"
                        value={formData.cargoWeight}
                        onChange={(e) => handleInputChange('cargoWeight', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Selection - Uber Style */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <VehicleSelector
                distance={formData.distance}
                selectedVehicle={selectedVehicleOption}
                onSelectVehicle={(vehicle) => {
                  setSelectedVehicleOption(vehicle);
                  // Update form data with vehicle type
                  setFormData(prev => ({ ...prev, vehicle: vehicle.name }));
                }}
              />
            </div>

            {/* Driver Assignment (only show if vehicle selected) */}
            {selectedVehicleOption && (
              <div className="glass-panel border border-white/5 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-accent-500" /> Asignar Conductor
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Conductor</label>
                  <select
                    value={formData.driver}
                    onChange={(e) => handleInputChange('driver', e.target.value)}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    disabled={loadingData}
                  >
                    <option value="">{loadingData ? 'Cargando...' : 'Seleccionar...'}</option>
                    {drivers.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {selectedVehicleOption && formData.driver && (
                <button
                  onClick={calculateRoute}
                  disabled={loading}
                  className="flex-1 bg-white text-black font-bold py-4 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
                  {loading ? 'Analizando...' : 'Calcular Rentabilidad'}
                </button>
              )}

              {analysis && (
                <>
                  <LoadingButton
                    onClick={saveRoute}
                    loading={isSaving}
                    loadingText="Guardando..."
                    icon={<Save className="w-5 h-5" />}
                    className="px-6 bg-brand-600 text-white font-bold py-4 rounded-xl hover:bg-brand-500 transition-all flex items-center gap-2"
                  >
                    Guardar
                  </LoadingButton>

                  <button
                    onClick={saveAsTemplate}
                    className="px-4 bg-white/5 text-slate-300 font-bold py-4 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 border border-white/10"
                    title="Guardar como plantilla"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                </>
              )}

              <button
                onClick={resetForm}
                className="px-6 bg-white/5 text-slate-400 font-medium py-4 rounded-xl hover:bg-white/10 transition-all border border-white/10"
              >
                Limpiar
              </button>
            </div>

          </div>

          <div className="lg:col-span-1 space-y-6">

            {/* Show FareEstimator if vehicle selected */}
            {selectedVehicleOption && fareEstimate && (
              <FareEstimator
                estimate={fareEstimate}
                vehicle={selectedVehicleOption}
                distance={formData.distance}
              />
            )}

            {/* Placeholder when no vehicle selected */}
            {!selectedVehicleOption && !analysis && !loading && (
              <div className="glass-panel border border-white/5 rounded-2xl p-8 text-center h-[400px] flex flex-col items-center justify-center">
                <PieChart className="w-16 h-16 text-slate-700 mb-4" />
                <p className="text-slate-500">Selecciona un tipo de vehículo para ver la estimación de tarifa.</p>
              </div>
            )}

            {loading && (
              <div className="glass-panel border border-white/5 rounded-2xl p-8 h-[400px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-brand-400 font-mono text-sm animate-pulse">PROCESANDO CON GEMINI AI...</p>
              </div>
            )}

            {analysis && (
              <>
                <div className="glass-panel border border-white/5 rounded-2xl p-6 animate-slide-up relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>

                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Resumen de Cotización</h3>

                  <div className="mb-6">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Precio Estimado</span>
                    <div className="text-4xl font-bold mt-1 text-white">
                      ${analysis.revenue.toLocaleString('es-CL')} CLP
                    </div>
                  </div>
                </div>

                {analysis.aiRecommendations.length > 0 && (
                  <div className="glass-panel border border-accent-500/30 rounded-2xl p-6 animate-slide-up bg-gradient-to-br from-accent-900/20 to-dark-900" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-sm font-bold text-accent-400 uppercase mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Recomendaciones Gemini AI
                    </h3>
                    <ul className="space-y-2">
                      {analysis.aiRecommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

          </div>
        </div>

        {registeredRoutes.length > 0 && (
          <div className="mt-12 glass-panel border border-white/5 rounded-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Rutas Guardadas ({registeredRoutes.length})</h3>
              <span className="text-xs text-slate-500 font-mono">ULTIMAS 10 RUTAS</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="bg-white/5 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="p-4">Ruta</th>
                    <th className="p-4">Vehículo</th>
                    <th className="p-4 text-right">Cotización</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {registeredRoutes.slice(0, 10).map((route) => (
                    <tr key={route.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedRoute(route)}>
                      <td className="p-4">
                        <p className="text-white font-medium">{route.origin.split(',')[0]} → {route.destination.split(',')[0]}</p>
                        <p className="text-xs text-slate-500">{route.distance}</p>
                      </td>
                      <td className="p-4 text-slate-400">{route.vehicleType}</td>
                      <td className="p-4 text-right font-mono text-slate-300">{route.estimatedPrice}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded font-bold ${route.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          route.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                          {route.status === 'Pending' ? 'Pendiente' : route.status === 'In Progress' ? 'En Curso' : 'Completada'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoute(route);
                          }}
                          className="p-2 hover:bg-brand-500/10 text-slate-400 hover:text-brand-400 rounded transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de Detalles de Ruta */}
        {selectedRoute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedRoute(null)}>
            <div className="relative w-full max-w-3xl glass-panel border border-white/10 rounded-2xl overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-brand-500/10 to-accent-500/10">
                <div>
                  <h2 className="text-2xl font-bold text-white">Detalles de Ruta</h2>
                  <p className="text-xs text-slate-400 font-mono mt-1">ID: {selectedRoute.id}</p>
                </div>
                <button
                  onClick={() => setSelectedRoute(null)}
                  className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Origen y Destino */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-bold text-slate-400 uppercase">Origen</span>
                    </div>
                    <p className="text-white font-medium">{selectedRoute.origin}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold text-slate-400 uppercase">Destino</span>
                    </div>
                    <p className="text-white font-medium">{selectedRoute.destination}</p>
                  </div>
                </div>

                {/* Información General */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-br from-brand-500/10 to-brand-500/5 rounded-xl border border-brand-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-brand-400" />
                      <span className="text-xs font-bold text-slate-400 uppercase">Distancia</span>
                    </div>
                    <p className="text-xl font-bold text-white">{selectedRoute.distance}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-bold text-slate-400 uppercase">Cotización</span>
                    </div>
                    <p className="text-xl font-bold text-white">{selectedRoute.estimatedPrice}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-slate-400 uppercase">Vehículo</span>
                    </div>
                    <p className="text-sm font-bold text-white">{selectedRoute.vehicleType}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-slate-400 uppercase">Conductor</span>
                    </div>
                    <p className="text-sm font-bold text-white">{selectedRoute.driver || 'No asignado'}</p>
                  </div>
                </div>

                {/* Estado y Fecha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-400 uppercase">Estado de la Ruta</span>
                    </div>
                    <select
                      value={selectedRoute.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as 'Pending' | 'In Progress' | 'Completed';
                        updateRouteStatus(selectedRoute.id, newStatus);
                        setSelectedRoute({ ...selectedRoute, status: newStatus });
                      }}
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2.5 text-white font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-colors cursor-pointer"
                    >
                      <option value="Pending" className="bg-dark-900">🟡 Pendiente</option>
                      <option value="In Progress" className="bg-dark-900">🔵 En Curso</option>
                      <option value="Completed" className="bg-dark-900">✅ Completada</option>
                    </select>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-400 uppercase">Fecha de Creación</span>
                    </div>
                    <p className="text-white font-medium">
                      {new Date(selectedRoute.timestamp).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button className="flex-1 px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Exportar PDF
                  </button>
                  <button className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-colors">
                    Editar Ruta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div >
  );
};

const Input = ({ label, error, ...props }: any) => (
  <div>
    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
    <input
      {...props}
      className={`w-full bg-dark-900 border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-colors placeholder-slate-600 ${error ? 'border-red-500/50' : 'border-white/10'}`}
    />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

export default RouteBuilder;
