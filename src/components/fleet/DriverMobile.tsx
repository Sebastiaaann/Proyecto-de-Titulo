import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@store/useStore';
import { MapPin, Navigation, CheckCircle2, Clock, Truck, AlertCircle, PhoneCall, Package, ArrowRight, Play, Square, Plus, X, Loader2, FileSignature, ExternalLink, User } from 'lucide-react';
import AddressAutocomplete from '@components/routes/AddressAutocomplete';
import { generateSmartQuote } from '@services/geminiService';
import LoadingButton from '@components/common/LoadingButton';
import { driverService, gpsService, vehicleService } from '@services/databaseService';
import { liveTrackingService } from '@services/liveTrackingService';
import type { Driver, Vehicle } from '@/types';
import SignaturePad from '@components/delivery/SignaturePad';
import { showToast } from '@components/common/Toast';

interface DriverMobileProps {
  driverName?: string;
}

const DriverMobile: React.FC<DriverMobileProps> = ({ driverName = "Conductor" }) => {
  const { registeredRoutes, updateRouteStatus, startRoute, updateRouteWithProof, addRoute } = useStore();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(driverName);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [activeRoute, setActiveRoute] = useState<any | null>(() => {
    // Recuperar ruta activa de localStorage al iniciar
    const saved = localStorage.getItem('activeRoute');
    return saved ? JSON.parse(saved) : null;
  });
  const [elapsedTime, setElapsedTime] = useState(() => {
    // Recuperar tiempo transcurrido de localStorage
    const saved = localStorage.getItem('elapsedTime');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isTracking, setIsTracking] = useState(() => {
    // Recuperar estado de tracking de localStorage
    const saved = localStorage.getItem('isTracking');
    return saved === 'true';
  });
  const [showNewRouteForm, setShowNewRouteForm] = useState(false);

  // Form state
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState<[number, number] | undefined>();
  const [destCoords, setDestCoords] = useState<[number, number] | undefined>();
  const [vehicleType, setVehicleType] = useState('Camión 3/4');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quoteResult, setQuoteResult] = useState<any | null>(null);

  // Signature state
  const [showSignature, setShowSignature] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // GPS Tracking state
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Persist GPS state + throttle writes to DB
  const lastGpsSaveAtRef = useRef<number>(0);
  const lastGpsSavedCoordRef = useRef<{ lat: number; lng: number } | null>(null);
  const routeIdRef = useRef<string | null>(null);
  const routeIdOverrideRef = useRef<string | null>(null);
  const isTrackingRef = useRef<boolean>(false);
  // Fix for race condition where realtime update might revert status momentarily
  const completedRoutesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    routeIdRef.current = activeRoute?.id ?? null;
  }, [activeRoute?.id]);

  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  // Restore GPS enabled preference (only restarts if permission already granted)
  useEffect(() => {
    const saved = localStorage.getItem('gpsEnabled');
    if (saved === 'true') {
      setGpsEnabled(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gpsEnabled', gpsEnabled ? 'true' : 'false');
  }, [gpsEnabled]);

  const selectedVehicleId = useMemo(() => {
    if (!selectedVehicle) return '';
    // selectedVehicle may be plate or id depending on older UI/state; normalize to vehicle.id when possible
    const byId = vehicles.find(v => v.id === selectedVehicle);
    if (byId) return byId.id;
    const byPlate = vehicles.find(v => v.plate === selectedVehicle);
    return byPlate?.id ?? selectedVehicle;
  }, [selectedVehicle, vehicles]);

  const shouldSaveGpsPoint = (next: { lat: number; lng: number }) => {
    const now = Date.now();
    // throttle: at most one point every 5s
    if (now - lastGpsSaveAtRef.current < 5000) return false;
    const last = lastGpsSavedCoordRef.current;
    if (!last) return true;
    // quick distance check (~meters) to avoid duplicates
    const dLat = (next.lat - last.lat) * 111320;
    const dLng = (next.lng - last.lng) * 111320;
    const meters = Math.sqrt(dLat * dLat + dLng * dLng);
    return meters >= 10;
  };

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

  // Sync active route from registeredRoutes (Fix for missing active card)
  useEffect(() => {
    // Encontrar si hay alguna ruta en progreso para este conductor
    const inProgressRoute = registeredRoutes.find(r =>
      r.status === 'In Progress' &&
      (selectedDriver === 'Conductor' || r.driver === selectedDriver)
    );

    // Si hay una ruta en progreso y no tenemos una ruta activa localmente, sincronizar
    // Added check for completedRoutesRef to prevent race condition resurrection
    if (inProgressRoute &&
      (!activeRoute || activeRoute.id !== inProgressRoute.id) &&
      !completedRoutesRef.current.has(inProgressRoute.id)) {
      console.log('Syncing active route from store:', inProgressRoute);
      setActiveRoute(inProgressRoute);
      setIsTracking(true);

      // Si no hay tiempo transcurrido guardado, calcularlo basado en el timestamp de inicio
      // (Opcional: Si tuviéramos un campo 'startedAt' en la ruta sería más preciso)
      if (elapsedTime === 0 && inProgressRoute.timestamp) {
        const elapsedSeconds = Math.floor((Date.now() - inProgressRoute.timestamp) / 1000);
        // Solo establecer si es razonable (menos de 24 horas)
        if (elapsedSeconds > 0 && elapsedSeconds < 86400) {
          setElapsedTime(elapsedSeconds);
        }
      }
    }
  }, [registeredRoutes, selectedDriver, activeRoute]); // Dependencias para re-sincronizar

  // GPS Functions
  const startGPSTracking = (vehicleOverride?: string, routeIdOverride?: string) => {
    const vehicleKey = vehicleOverride ?? selectedVehicle;
    const vehicleId = vehicleOverride ? (vehicles.find(v => v.id === vehicleOverride)?.id ?? vehicles.find(v => v.plate === vehicleOverride)?.id ?? vehicleOverride) : selectedVehicleId;
    routeIdOverrideRef.current = routeIdOverride ?? null;

    if (!vehicleKey) {
      showToast.warning('Selecciona un vehículo', 'Debes tener un vehículo asignado para activar el GPS');
      return;
    }

    if (!navigator.geolocation) {
      showToast.error('GPS no disponible', 'Tu navegador no soporta geolocalización');
      setLocationError('Geolocalización no disponible');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setCurrentLocation(newLocation);
        setLocationError(null);

        // Actualizar ubicación del vehículo en Supabase
        try {
          await vehicleService.update(vehicleId, {
            location: newLocation,
          });

          // Disparar evento para actualizar mapa en tiempo real
          window.dispatchEvent(new CustomEvent('vehicle-location-update', {
            detail: {
              vehicleId: vehicleId,
              location: newLocation,
              timestamp: Date.now(),
            }
          }));
        } catch (error) {
          console.error('Error updating vehicle location:', error);
        }

        const activeRouteId = routeIdOverrideRef.current ?? routeIdRef.current;
        const shouldPersist = Boolean(activeRouteId) && isTrackingRef.current;

        // Update live_routes for real-time tracking (LiveTracking modal)
        if (activeRouteId && isTrackingRef.current) {
          const speedMps = position.coords.speed ?? 0;
          const speedKmh = Math.max(0, speedMps * 3.6);
          const heading = position.coords.heading ?? undefined;

          try {
            await liveTrackingService.updateLocation(
              activeRouteId,
              {
                lat: latitude,
                lng: longitude,
                heading,
                speed: speedKmh,
                timestamp: Date.now(),
              },
              'in_transit'
            );
          } catch (error) {
            console.error('Error updating live_routes:', error);
          }

          // Also broadcast via Realtime channel (legacy/fallback)
          gpsService.broadcastLocation(activeRouteId, {
            vehicleId: vehicleId,
            lat: latitude,
            lng: longitude,
            speed: speedKmh
          });
        }

        // Guardar punto GPS para el trayecto de la ruta activa (para ver el mapa en rutas completadas)
        // Nota: NO dependemos exclusivamente de Supabase (puede fallar por RLS o schema). Guardamos también en localStorage.
        if (shouldPersist && shouldSaveGpsPoint(newLocation)) {
          const speedMps = position.coords.speed ?? 0;
          const speedKmh = Math.max(0, speedMps * 3.6);
          const localKey = `gps_track_${activeRouteId}`;
          try {
            const prevRaw = localStorage.getItem(localKey);
            const prev = prevRaw ? (JSON.parse(prevRaw) as Array<any>) : [];
            const next = [
              ...prev,
              {
                latitude,
                longitude,
                speed: speedKmh,
                timestamp: new Date().toISOString(),
              },
            ];
            // Keep last N points to avoid unbounded growth
            const capped = next.length > 1500 ? next.slice(next.length - 1500) : next;
            localStorage.setItem(localKey, JSON.stringify(capped));
          } catch (e) {
            // localStorage may be unavailable; ignore
          }

          // Best-effort Supabase insert
          try {
            await gpsService.addLocation({
              route_id: activeRouteId!,
              vehicle_id: vehicleId,
              latitude,
              longitude,
              speed: speedKmh,
              engine_on: true,
            });
          } catch (error) {
            // No bloquear UI si falla el guardado GPS
            console.error('Error saving GPS track point:', error);
          } finally {
            lastGpsSaveAtRef.current = Date.now();
            lastGpsSavedCoordRef.current = newLocation;
          }
        }
      },
      (error) => {
        console.error('GPS Error:', error);
        setLocationError(error.message);
        // No mostrar alerta al usuario si niega el permiso
        if (error.code !== error.PERMISSION_DENIED) {
          showToast.error('Error GPS', error.message);
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    setWatchId(id);
    setGpsEnabled(true);
    showToast.success('GPS Activado', 'Tu ubicación se está compartiendo');
  };

  const stopGPSTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    routeIdOverrideRef.current = null;
    setGpsEnabled(false);
    setCurrentLocation(null);
    showToast.info('GPS Desactivado', 'Dejaste de compartir tu ubicación');
  };

  const toggleGPS = () => {
    if (gpsEnabled) {
      stopGPSTracking();
    } else {
      startGPSTracking(undefined, routeIdRef.current ?? undefined);
    }
  };

  // If user had GPS enabled and we have an active route, attempt to restart watch after reload
  useEffect(() => {
    if (!gpsEnabled) return;
    if (watchId !== null) return;
    if (!isTracking) return;
    if (!routeIdRef.current) return;
    if (!selectedVehicle) return;

    // This will only work without prompting if permission was granted previously
    startGPSTracking(undefined, routeIdRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsEnabled, isTracking, selectedVehicle]);

  // Cleanup GPS on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Filtrar rutas asignadas al conductor
  // IMPORTANTE: Las rutas "In Progress" SIEMPRE se muestran para evitar pérdida de datos
  // Si selectedDriver es "Conductor" (valor por defecto), mostrar TODAS las rutas
  // Si no, filtrar solo las del conductor específico
  const myRoutes = registeredRoutes.filter(route => {
    const isPending = route.status === 'Pending';
    const isInProgress = route.status === 'In Progress';

    // Las rutas en progreso SIEMPRE se muestran (persistencia de datos)
    if (isInProgress) {
      return true;
    }

    // Para rutas pendientes, aplicar filtro de conductor
    if (isPending) {
      if (selectedDriver === 'Conductor') {
        return true; // Mostrar todas las pendientes
      } else {
        return route.driver === selectedDriver; // Solo del conductor específico
      }
    }

    return false; // No mostrar completadas
  });

  // Persistir ruta activa en localStorage
  useEffect(() => {
    if (activeRoute) {
      localStorage.setItem('activeRoute', JSON.stringify(activeRoute));
    } else {
      localStorage.removeItem('activeRoute');
    }
  }, [activeRoute]);

  // Persistir estado de tracking en localStorage
  useEffect(() => {
    localStorage.setItem('isTracking', isTracking.toString());
  }, [isTracking]);

  // Persistir tiempo transcurrido en localStorage
  useEffect(() => {
    localStorage.setItem('elapsedTime', elapsedTime.toString());
  }, [elapsedTime]);

  // Timer para ruta activa
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && activeRoute) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, activeRoute]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Función para abrir navegación externa (Waze, Google Maps, Apple Maps)
  const openNavigation = (destination: string, app: 'waze' | 'google' | 'apple') => {
    const encodedDestination = encodeURIComponent(destination);
    let url = '';

    switch (app) {
      case 'waze':
        // Waze URL scheme
        url = `https://waze.com/ul?q=${encodedDestination}&navigate=yes`;
        break;
      case 'google':
        // Google Maps URL
        url = `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}&travelmode=driving`;
        break;
      case 'apple':
        // Apple Maps URL
        url = `http://maps.apple.com/?daddr=${encodedDestination}&dirflg=d`;
        break;
    }

    window.open(url, '_blank');
    showToast.success('Navegación abierta', `Redirigiendo a ${app === 'waze' ? 'Waze' : app === 'google' ? 'Google Maps' : 'Apple Maps'}`);
  };

  const handleStartRoute = (route: any) => {
    setActiveRoute(route);
    setIsTracking(true);
    setElapsedTime(0);

    // Obtener ubicación inicial y registrar inicio de ruta en BD
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          startRoute(route.id, { lat: latitude, lng: longitude });

          // Initialize live_routes tracking
          try {
            await liveTrackingService.startTracking(route.id, {
              lat: latitude,
              lng: longitude,
              heading: position.coords.heading ?? undefined,
              speed: position.coords.speed ? position.coords.speed * 3.6 : 0,
              timestamp: Date.now(),
            });
          } catch (error) {
            console.error('Error initializing live tracking:', error);
          }
        },
        (error) => {
          console.error('Error getting start location:', error);
          // Fallback: iniciar sin ubicación precisa
          startRoute(route.id, { lat: 0, lng: 0 });
        }
      );
    } else {
      startRoute(route.id, { lat: 0, lng: 0 });
    }

    showToast.success('Ruta iniciada', `${route.origin.split(',')[0]} → ${route.destination.split(',')[0]}`);

    // Auto-start GPS tracking for this route (best effort)
    const vehicleForGps = route.vehicle || selectedVehicle;
    if (vehicleForGps && !gpsEnabled) {
      startGPSTracking(vehicleForGps, route.id);
    }
  };

  const handleFinishRoute = () => {
    // Show signature modal instead of immediately completing
    setShowSignature(true);
  };

  const handleSignatureSave = async (signatureData: string) => {
    // If activeRoute is missing, we must still close the modal
    if (!activeRoute) {
      console.error('handleSignatureSave called but activeRoute is null');
      setShowSignature(false);
      return;
    }

    const routeId = activeRoute.id;
    const currentClientName = clientName; // Capture for toast

    // Create delivery proof object
    const deliveryProof = {
      signature: signatureData,
      clientName: clientName || undefined,
      clientId: clientId || undefined,
      deliveredAt: Date.now(),
      notes: deliveryNotes || undefined,
    };

    // --- OPTIMISTIC UPDATE: Close UI immediately ---
    console.log('Optimistic close of signature modal for route:', routeId);

    // 1. Prevent race conditions
    completedRoutesRef.current.add(routeId);

    // 2. Reset UI State
    setShowSignature(false);
    setIsTracking(false);
    setActiveRoute(null);
    setElapsedTime(0);
    setClientName('');
    setClientId('');
    setDeliveryNotes('');

    // 3. Clear Local Storage
    localStorage.removeItem('activeRoute');
    localStorage.removeItem('isTracking');
    localStorage.removeItem('elapsedTime');

    // 4. Stop GPS if enabled
    if (gpsEnabled) {
      stopGPSTracking();
    }

    // --- ASYNC BACKEND UPDATE ---
    try {
      // Update route with delivery proof and mark as completed
      await updateRouteWithProof(routeId, deliveryProof);

      // Stop live tracking
      try {
        await liveTrackingService.stopTracking(routeId);
      } catch (error) {
        console.error('Error stopping live tracking:', error);
      }

      // Success notification
      showToast.success(
        '¡Ruta completada!',
        `Entrega confirmada${currentClientName ? ' a ' + currentClientName : ''}`
      );
    } catch (error) {
      console.error('Error saving signature (persisted locally):', error);
      // Note: We don't revert UI here to keep experience smooth.
      // The store handles the error toast.
    }
  };

  const handleSignatureCancel = () => {
    setShowSignature(false);
    setClientName('');
    setClientId('');
    setDeliveryNotes('');
  };

  const calculateDistance = (coord1?: [number, number], coord2?: [number, number]): number => {
    if (!coord1 || !coord2) return 0;
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const handleGenerateQuote = async () => {
    if (!origin || !destination) {
      showToast.warning('Faltan datos', 'Por favor ingresa origen y destino');
      return;
    }

    setIsGenerating(true);
    try {
      const distance = calculateDistance(originCoords, destCoords);

      // Si no hay coordenadas, usar cálculo estimado
      if (!distance || distance === 0) {
        throw new Error('No se pudo calcular la distancia');
      }

      const result = await generateSmartQuote(description || 'Transporte de carga', `${distance} km`);

      // Validar que el resultado tenga los campos necesarios y no sean valores de error
      if (!result ||
        !result.estimatedPrice ||
        !result.vehicleType ||
        !result.timeEstimate ||
        result.estimatedPrice === "$0 - $0" ||
        result.vehicleType === "Error" ||
        result.vehicleType === "Rate limit excedido" ||
        result.timeEstimate === "N/A") {
        throw new Error('Respuesta inválida de la IA');
      }

      setQuoteResult(result);
      showToast.success('Cotización generada con IA', 'Revisa los detalles abajo');
    } catch (error) {
      console.error('Error generating quote:', error);

      // Fallback: generar cotización básica calculada
      const distance = calculateDistance(originCoords, destCoords);
      const basePrice = Math.max(distance * 1500, 50000); // Mínimo $50.000
      const maxPrice = Math.ceil(basePrice * 1.35);

      // Determinar tipo de vehículo basado en distancia y descripción
      let vehicleType = 'Camión 3/4';
      if (distance > 200) {
        vehicleType = 'Camión grande';
      } else if (distance < 50 && (!description || description.length < 20)) {
        vehicleType = 'Camioneta';
      }

      // Calcular tiempo estimado (velocidad promedio 60-70 km/h)
      const minHours = Math.ceil(distance / 70);
      const maxHours = Math.ceil(distance / 55);
      const timeEstimate = minHours === maxHours
        ? `${minHours} hora${minHours !== 1 ? 's' : ''}`
        : `${minHours} - ${maxHours} horas`;

      setQuoteResult({
        estimatedPrice: `$${basePrice.toLocaleString('es-CL')} - $${maxPrice.toLocaleString('es-CL')}`,
        vehicleType: vehicleType,
        timeEstimate: timeEstimate,
        logisticsAdvice: [
          'Cotización calculada automáticamente',
          'Confirma detalles con el cliente',
          'Considera tráfico y condiciones climáticas'
        ],
        confidenceScore: 75
      });

      showToast.warning('Cotización básica generada', 'No se pudo usar IA, se calculó automáticamente');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRoute = () => {
    if (!origin || !destination || !quoteResult) {
      showToast.warning('Faltan datos', 'Por favor completa todos los campos y genera una cotización');
      return;
    }

    if (selectedDriver === 'Conductor') {
      showToast.warning('Conductor requerido', 'Por favor selecciona un conductor');
      return;
    }

    if (!selectedVehicle) {
      showToast.warning('Vehículo requerido', 'Por favor selecciona un vehículo');
      return;
    }

    const distance = calculateDistance(originCoords, destCoords);
    const newId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const newRoute = {
      id: newId,
      origin,
      destination,
      distance: `${distance} km`,
      estimatedPrice: quoteResult.estimatedPrice,
      vehicleType: quoteResult.vehicleType,
      driver: selectedDriver,
      vehicle: selectedVehicle,
      timestamp: Date.now(),
      status: 'Pending' as const,
    };

    addRoute(newRoute);

    // Success notification
    showToast.success('Ruta creada', `${origin.split(',')[0]} → ${destination.split(',')[0]}`);

    // Reset form
    setOrigin('');
    setDestination('');
    setOriginCoords(undefined);
    setDestCoords(undefined);
    setDescription('');
    setQuoteResult(null);
    setSelectedVehicle('');
    setShowNewRouteForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 text-white pb-20 pt-20 mobile-ui touch-scroll safe-area-top safe-area-bottom">
      <div className="mx-auto w-full max-w-4xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-6 pb-8 rounded-b-3xl shadow-2xl mt-4 safe-area-top">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-brand-100 text-sm font-medium">Bienvenido</p>
              <h1 className="text-2xl font-bold text-white">{selectedDriver}</h1>
              {selectedVehicle && (
                <p className="text-brand-100 text-xs mt-1">Vehículo: {selectedVehicle}</p>
              )}
            </div>
            <div className="flex gap-2">
              {/* GPS Toggle Button */}
              <button
                onClick={toggleGPS}
                className={`p-3 rounded-full backdrop-blur-sm transition-all touch-feedback ${gpsEnabled
                  ? 'bg-green-500/30 ring-2 ring-green-400 mobile-pulse'
                  : 'bg-white/20 hover:bg-white/30 active:scale-95'
                  }`}
                title={gpsEnabled ? 'GPS Activo' : 'Activar GPS'}
                aria-label={gpsEnabled ? 'GPS Activo - Toca para desactivar' : 'Activar GPS'}
              >
                <Navigation className={`w-6 h-6 ${gpsEnabled ? 'text-green-300' : 'text-white'}`} />
              </button>
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <Truck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* GPS Status Indicator Mejorado */}
          {gpsEnabled && currentLocation && (
            <div className="bg-green-500/10 border border-green-400/20 rounded-2xl p-4 animate-fade-in backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
                  </span>
                  <div>
                    <span className="text-sm font-bold text-green-200 block">GPS Activo</span>
                    <span className="text-xs text-green-300/60">
                      {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
                <Navigation className="w-5 h-5 text-green-300" />
              </div>
            </div>
          )}

          {locationError && (
            <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-xl p-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-300">{locationError}</span>
              </div>
            </div>
          )}

          {/* Status Summary Mejorado */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/5 hover-lift transition-all">
              <div className="text-3xl font-bold text-white mb-1">{myRoutes.length}</div>
              <div className="text-xs text-brand-100 font-medium">Pendientes</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/5 hover-lift transition-all">
              <div className="text-3xl font-bold text-yellow-300 mb-1">
                {selectedDriver === 'Conductor'
                  ? registeredRoutes.filter(r => r.status === 'In Progress').length
                  : registeredRoutes.filter(r => r.driver === selectedDriver && r.status === 'In Progress').length
                }
              </div>
              <div className="text-xs text-brand-100 font-medium">En Curso</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/5 hover-lift transition-all">
              <div className="text-3xl font-bold text-green-300 mb-1">
                {selectedDriver === 'Conductor'
                  ? registeredRoutes.filter(r => r.status === 'Completed').length
                  : registeredRoutes.filter(r => r.driver === selectedDriver && r.status === 'Completed').length
                }
              </div>
              <div className="text-xs text-brand-100 font-medium">Completadas</div>
            </div>
          </div>
        </div>

        {/* Floating Add Button Mejorado */}
        {!showNewRouteForm && !isTracking && (
          <button
            onClick={() => setShowNewRouteForm(true)}
            className="fixed bottom-24 right-6 z-30 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 active:scale-95 text-white p-5 rounded-2xl shadow-2xl shadow-brand-500/30 transition-all hover:scale-110 hover:shadow-brand-500/50 touch-feedback safe-area-bottom group"
            aria-label="Crear nueva ruta"
          >
            <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        )}

        {/* New Route Form Modal */}
        {showNewRouteForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-end">
            <div className="w-full bg-dark-900 rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto animate-slide-up touch-scroll hide-scrollbar mobile-form safe-area-bottom">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Nueva Ruta</h2>
                <button
                  onClick={() => {
                    setShowNewRouteForm(false);
                    setQuoteResult(null);
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Selector de Conductor */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Conductor
                  </label>
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-500"
                    disabled={loadingData}
                  >
                    <option value="Conductor" className="bg-dark-900">{loadingData ? 'Cargando...' : 'Seleccionar conductor'}</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.name} className="bg-dark-900">
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selector de Vehículo */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Vehículo
                  </label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-500"
                    disabled={loadingData}
                  >
                    <option value="" className="bg-dark-900">{loadingData ? 'Cargando...' : 'Seleccionar vehículo'}</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.plate} className="bg-dark-900">
                        {vehicle.plate} - {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>

                <AddressAutocomplete
                  label="Origen"
                  value={origin}
                  onChange={(val, coords) => {
                    setOrigin(val);
                    setOriginCoords(coords);
                  }}
                  placeholder="Ingresa dirección de origen"
                />

                <AddressAutocomplete
                  label="Destino"
                  value={destination}
                  onChange={(val, coords) => {
                    setDestination(val);
                    setDestCoords(coords);
                  }}
                  placeholder="Ingresa dirección de destino"
                />

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Descripción de la Carga (Opcional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej: Pallets de electrónicos, frágil"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <LoadingButton
                  onClick={handleGenerateQuote}
                  loading={isGenerating}
                  disabled={!origin || !destination}
                  className="w-full active:scale-98 touch-feedback"
                >
                  Generar Cotización con IA
                </LoadingButton>

                {quoteResult && (
                  <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-4 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Precio Estimado</span>
                      <span className="text-2xl font-bold text-brand-400">
                        {quoteResult.estimatedPrice || '$0 - $0'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Vehículo Recomendado</span>
                      <span className="text-white font-semibold">
                        {quoteResult.vehicleType || 'No especificado'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Tiempo Estimado</span>
                      <span className="text-white font-semibold">
                        {quoteResult.timeEstimate || 'Calculando...'}
                      </span>
                    </div>

                    {/* Show selected vehicle if different from recommendation */}
                    {selectedVehicle && (
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-slate-400 text-sm">Vehículo Asignado</span>
                        <span className="text-brand-300 font-semibold">{selectedVehicle}</span>
                      </div>
                    )}

                    <button
                      onClick={handleSaveRoute}
                      disabled={!selectedDriver || selectedDriver === 'Conductor' || !selectedVehicle}
                      className="w-full mt-4 bg-brand-500 hover:bg-brand-600 active:scale-98 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:active:scale-100 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all touch-feedback"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Crear Ruta
                    </button>

                    {(!selectedDriver || selectedDriver === 'Conductor' || !selectedVehicle) && (
                      <p className="text-xs text-yellow-400 text-center">
                        ⚠️ Selecciona un conductor y vehículo para crear la ruta
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Route Card Mejorado - Persistente hasta firma */}
        {activeRoute && isTracking ? (
          <div className="px-4 pt-6 pb-8 mb-6 relative z-10 animate-slide-in-up">
            <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-3xl p-8 shadow-2xl border-2 border-green-300/30 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>

              <div className="relative z-10">
                {/* Header con más espacio */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <span className="flex h-4 w-4 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                    </span>
                    <span className="text-white font-bold text-lg uppercase tracking-wider">Ruta en Curso</span>
                  </div>
                  <div className="px-5 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                    <span className="text-white text-sm font-bold">ACTIVA</span>
                  </div>
                </div>

                {/* Route Info con más espacio y mejor legibilidad */}
                <div className="space-y-6 mb-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="flex items-start gap-5">
                    <div className="flex flex-col items-center mt-2">
                      <div className="w-5 h-5 bg-white rounded-full shadow-lg"></div>
                      <div className="w-1 h-12 bg-gradient-to-b from-white to-white/30 my-2"></div>
                      <MapPin className="w-5 h-5 text-white drop-shadow-lg" />
                    </div>
                    <div className="flex-1 space-y-6">
                      <div>
                        <p className="text-white/80 text-sm font-semibold mb-2 uppercase tracking-wide">Origen</p>
                        <p className="text-white font-bold text-xl leading-snug">{activeRoute.origin.split(',')[0]}</p>
                      </div>
                      <div>
                        <p className="text-white/80 text-sm font-semibold mb-2 uppercase tracking-wide">Destino</p>
                        <p className="text-white font-bold text-xl leading-snug">{activeRoute.destination.split(',')[0]}</p>
                      </div>
                    </div>
                  </div>

                  {/* Botones de Navegación */}
                  <div className="pt-4 border-t border-white/20">
                    <p className="text-white/80 text-xs font-semibold mb-3 uppercase tracking-wide">Abrir Navegación</p>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => openNavigation(activeRoute.destination, 'waze')}
                        className="bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 rounded-xl p-3 flex flex-col items-center gap-2 transition-all touch-feedback group"
                        aria-label="Abrir en Waze"
                      >
                        <div className="w-10 h-10 bg-[#33CCFF] rounded-lg flex items-center justify-center">
                          <Navigation className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white text-xs font-semibold">Waze</span>
                      </button>

                      <button
                        onClick={() => openNavigation(activeRoute.destination, 'google')}
                        className="bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 rounded-xl p-3 flex flex-col items-center gap-2 transition-all touch-feedback group"
                        aria-label="Abrir en Google Maps"
                      >
                        <div className="w-10 h-10 bg-[#4285F4] rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white text-xs font-semibold">Google</span>
                      </button>

                      <button
                        onClick={() => openNavigation(activeRoute.destination, 'apple')}
                        className="bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 rounded-xl p-3 flex flex-col items-center gap-2 transition-all touch-feedback group"
                        aria-label="Abrir en Apple Maps"
                      >
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <ExternalLink className="w-5 h-5 text-gray-800" />
                        </div>
                        <span className="text-white text-xs font-semibold">Apple</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Timer con más espacio y mejor visibilidad */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-7 mb-8 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Clock className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-white text-base font-semibold">Tiempo Transcurrido</span>
                    </div>
                    <div className="text-4xl font-bold text-white font-mono tabular-nums tracking-wider">{formatTime(elapsedTime)}</div>
                  </div>
                </div>

                {/* Finish Button con más tamaño y espacio */}
                <button
                  onClick={handleFinishRoute}
                  className="w-full bg-white text-green-600 py-6 rounded-2xl font-bold text-xl flex items-center justify-center gap-4 hover:bg-green-50 hover:shadow-2xl active:scale-98 transition-all shadow-xl touch-feedback group"
                  aria-label="Finalizar ruta y firmar comprobante"
                >
                  <FileSignature className="w-7 h-7 group-hover:scale-110 transition-transform" />
                  <span>Finalizar y Firmar Entrega</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 pt-6 pb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-brand-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Mis Rutas Pendientes</h2>
                <p className="text-slate-400 text-sm">Gestiona tus entregas activas</p>
              </div>
            </div>
          </div>
        )}

        {/* Routes List Mejorada */}
        <div className="px-4 pb-24 space-y-4">
          {myRoutes.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/10">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
              <p className="text-slate-200 text-xl font-bold mb-2">¡Todo listo!</p>
              <p className="text-slate-400 text-base">No tienes rutas pendientes</p>
              <p className="text-slate-500 text-sm mt-1">Excelente trabajo 🎉</p>
            </div>
          ) : (
            myRoutes.map((route, index) => (
              <div
                key={route.id}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover-lift shadow-xl animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Route Header Mejorado */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`flex h-2.5 w-2.5 relative ${route.status === 'In Progress' ? 'animate-pulse' : ''}`}>
                        {route.status === 'In Progress' && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${route.status === 'In Progress' ? 'bg-blue-400' : 'bg-yellow-400'}`}></span>
                      </span>
                      <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full ${route.status === 'In Progress'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                        {route.status === 'In Progress' ? 'En Curso' : 'Pendiente'}
                      </span>
                    </div>
                    <p className="text-white font-bold text-xl mb-3 leading-tight">
                      {route.origin.split(',')[0]} <span className="text-brand-400 mx-2">→</span> {route.destination.split(',')[0]}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-brand-400" />
                        <span className="font-medium">{route.distance}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-brand-400" />
                        <span className="font-medium">{route.vehicleType}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Route Details Mejorado */}
                <div className="grid grid-cols-2 gap-3 mb-5 p-4 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/5">
                  <div>
                    <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Cotización</p>
                    <p className="text-white font-bold text-lg">{route.estimatedPrice}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Fecha</p>
                    <p className="text-white font-bold text-base">
                      {new Date(route.timestamp).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Driver and Vehicle Info Mejorado */}
                {(route.driver || route.vehicle) && (
                  <div className="mb-5 p-4 bg-gradient-to-br from-brand-500/10 to-brand-600/10 border border-brand-400/20 rounded-2xl space-y-2.5">
                    {route.driver && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
                          <span className="text-brand-300">👤</span>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Conductor</p>
                          <p className="text-white font-bold">{route.driver}</p>
                        </div>
                      </div>
                    )}
                    {route.vehicle && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
                          <Truck className="w-4 h-4 text-brand-300" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Vehículo</p>
                          <p className="text-white font-bold">{route.vehicle}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Navegación rápida para rutas pendientes */}
                {route.status === 'Pending' && (
                  <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Ver Ruta</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openNavigation(route.destination, 'waze')}
                        className="flex-1 bg-[#33CCFF]/10 hover:bg-[#33CCFF]/20 border border-[#33CCFF]/30 text-[#33CCFF] py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <Navigation className="w-4 h-4" />
                        Waze
                      </button>
                      <button
                        onClick={() => openNavigation(route.destination, 'google')}
                        className="flex-1 bg-[#4285F4]/10 hover:bg-[#4285F4]/20 border border-[#4285F4]/30 text-[#4285F4] py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <MapPin className="w-4 h-4" />
                        Google
                      </button>
                      <button
                        onClick={() => openNavigation(route.destination, 'apple')}
                        className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Apple
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Button Mejorado */}
                {route.status === 'Pending' && (
                  <button
                    onClick={() => handleStartRoute(route)}
                    disabled={isTracking}
                    className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 active:scale-98 touch-feedback group"
                  >
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Iniciar Ruta</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Emergency Contact */}
      </div>

      {!isTracking && (
        <div className="fixed bottom-0 left-0 right-0 bg-dark-950/95 backdrop-blur-lg border-t border-white/10 p-4">
          <div className="mx-auto w-full max-w-4xl">
            <button className="w-full bg-red-500/10 border-2 border-red-500 text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors">
              <PhoneCall className="w-5 h-5" />
              Contactar Soporte
            </button>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignature && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4 overflow-y-auto">
          <div className="w-full max-w-6xl bg-dark-900 rounded-2xl shadow-2xl overflow-hidden my-4 md:my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <FileSignature className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white">Comprobante de Entrega</h3>
                    <p className="text-xs md:text-sm text-brand-100">Firma del cliente</p>
                  </div>
                </div>
                <button
                  onClick={handleSignatureCancel}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 md:p-6 max-h-[calc(100vh-120px)] md:max-h-none overflow-y-auto">
              {/* Route Info */}
              {activeRoute && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 space-y-2 mb-4 md:mb-6">
                  <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="truncate">{activeRoute.origin.split(',')[0]} → {activeRoute.destination.split(',')[0]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400">
                    <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                    <span>Tiempo: {formatTime(elapsedTime)}</span>
                  </div>
                </div>
              )}

              {/* Horizontal Layout: Form + Signature (Responsive) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Left Column: Client Information */}
                <div className="space-y-3 md:space-y-4 order-2 md:order-1">
                  <h4 className="text-xs md:text-sm font-bold text-white mb-2 md:mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                    <User className="w-3 h-3 md:w-4 md:h-4 text-brand-400" /> Información del Cliente
                  </h4>
                  
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-slate-300 mb-1.5 md:mb-2">
                      Nombre del Cliente
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-slate-300 mb-1.5 md:mb-2">
                      RUT/Cédula (Opcional)
                    </label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="Ej: 12.345.678-9"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-slate-300 mb-1.5 md:mb-2">
                      Observaciones (Opcional)
                    </label>
                    <textarea
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Ej: Entregado en buen estado"
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Right Column: Signature Pad */}
                <div className="order-1 md:order-2">
                  <SignaturePad
                    onSave={handleSignatureSave}
                    onCancel={handleSignatureCancel}
                    embedded={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DriverMobile;
