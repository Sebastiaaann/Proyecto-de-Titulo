import { useState, useEffect, useCallback } from 'react';
import { liveTrackingService, type LiveRouteData, type DriverLocation } from '@services/liveTrackingService';
import { gpsService } from '@services/databaseService';

interface UseLiveTrackingOptions {
    routeId: string;
    enabled?: boolean;
    onError?: (error: Error) => void;
}

interface UseLiveTrackingReturn {
    location: DriverLocation | null;
    status: LiveRouteData['status'] | null;
    eta: Date | null;
    isLoading: boolean;
    error: Error | null;
    lastUpdate: Date | null;
}

/**
 * Hook para tracking en tiempo real usando Supabase Realtime
 */
export function useLiveTracking({
    routeId,
    enabled = true,
    onError,
}: UseLiveTrackingOptions): UseLiveTrackingReturn {
    const [location, setLocation] = useState<DriverLocation | null>(null);
    const [status, setStatus] = useState<LiveRouteData['status'] | null>(null);
    const [eta, setEta] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const applyGpsPoint = useCallback((row: any) => {
        if (!row) return;
        const latitude = Number(row.latitude);
        const longitude = Number(row.longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

        const ts = row.timestamp ? new Date(row.timestamp) : new Date();
        setLocation({
            lat: latitude,
            lng: longitude,
            speed: row.speed != null ? Number(row.speed) : undefined,
            timestamp: ts.getTime(),
        });
        setLastUpdate(ts);
        setError(null);
    }, []);

    // Cargar ubicación inicial
    useEffect(() => {
        if (!enabled || !routeId) return;

        const loadInitialLocation = async () => {
            try {
                setIsLoading(true);
                const data = await liveTrackingService.getCurrentLocation(routeId);

                if (data) {
                    setLocation({
                        lat: data.driver_location.lat,
                        lng: data.driver_location.lng,
                        heading: data.driver_heading,
                        speed: data.speed,
                        timestamp: new Date(data.last_update).getTime(),
                    });
                    setStatus(data.status);
                    setEta(data.eta ? new Date(data.eta) : null);
                    setLastUpdate(new Date(data.last_update));
                    setError(null);
                    return;
                }

                // Fallback: usar último punto en gps_tracking (si live_routes no existe o está vacío)
                const latest = await gpsService.getLatestRoutePoint(routeId);
                if (latest) {
                    applyGpsPoint(latest);
                }
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to load location');
                setError(error);
                onError?.(error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialLocation();
    }, [routeId, enabled, onError]);

    // Suscribirse a actualizaciones en tiempo real (live_routes) + fallback polling (gps_tracking)
    useEffect(() => {
        if (!enabled || !routeId) return;

        const handleUpdate = (data: LiveRouteData) => {
            setLocation({
                lat: data.driver_location.lat,
                lng: data.driver_location.lng,
                heading: data.driver_heading,
                speed: data.speed,
                timestamp: new Date(data.last_update).getTime(),
            });
            setStatus(data.status);
            setEta(data.eta ? new Date(data.eta) : null);
            setLastUpdate(new Date(data.last_update));
            setError(null);
        };

        const handleError = (err: any) => {
            const error = err instanceof Error ? err : new Error('Realtime subscription error');
            setError(error);
            onError?.(error);
        };

        const unsubscribe = liveTrackingService.subscribeToRoute(
            routeId,
            handleUpdate,
            handleError
        );

        const interval = window.setInterval(async () => {
            try {
                const latest = await gpsService.getLatestRoutePoint(routeId);
                if (!latest) return;
                const latestTs = latest.timestamp ? new Date(latest.timestamp).getTime() : 0;
                const currentTs = lastUpdate?.getTime() ?? 0;
                if (latestTs > currentTs) {
                    applyGpsPoint(latest);
                }
            } catch (e) {
                // polling failures should not hard-fail the UI
            }
        }, 5000);

        return () => {
            unsubscribe();
            window.clearInterval(interval);
        };
    }, [routeId, enabled, onError, applyGpsPoint, lastUpdate]);

    return {
        location,
        status,
        eta,
        isLoading,
        error,
        lastUpdate,
    };
}
