import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface DriverLocation {
    lat: number;
    lng: number;
    heading?: number; // Dirección en grados (0-360)
    speed?: number; // km/h
    timestamp: number;
}

export interface LiveRouteData {
    id: string;
    route_id: string;
    driver_location: DriverLocation;
    driver_heading?: number;
    speed?: number;
    last_update: string;
    status: 'waiting' | 'picking_up' | 'in_transit' | 'delivering' | 'completed';
    eta?: string;
}

class LiveTrackingService {
    private channels: Map<string, RealtimeChannel> = new Map();

    /**
     * Iniciar tracking para una ruta
     */
    async startTracking(routeId: string, initialLocation: DriverLocation): Promise<void> {
        try {
            const { error } = await supabase
                .from('live_routes')
                .upsert({
                    route_id: routeId,
                    driver_location: {
                        lat: initialLocation.lat,
                        lng: initialLocation.lng,
                    },
                    driver_heading: initialLocation.heading,
                    speed: initialLocation.speed,
                    status: 'waiting',
                    last_update: new Date().toISOString(),
                }, {
                    onConflict: 'route_id'
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error starting tracking:', error);
            throw error;
        }
    }

    /**
     * Actualizar ubicación del conductor
     */
    async updateLocation(
        routeId: string,
        location: DriverLocation,
        status?: LiveRouteData['status']
    ): Promise<void> {
        try {
            const updateData: any = {
                driver_location: {
                    lat: location.lat,
                    lng: location.lng,
                },
                driver_heading: location.heading,
                speed: location.speed,
                last_update: new Date().toISOString(),
            };

            if (status) {
                updateData.status = status;
            }

            const { error } = await supabase
                .from('live_routes')
                .update(updateData)
                .eq('route_id', routeId);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating location:', error);
            throw error;
        }
    }

    /**
     * Obtener ubicación actual
     */
    async getCurrentLocation(routeId: string): Promise<LiveRouteData | null> {
        try {
            const { data, error } = await supabase
                .from('live_routes')
                .select('*')
                .eq('route_id', routeId)
                .single();

            if (error) throw error;
            return data as LiveRouteData;
        } catch (error) {
            console.error('Error getting current location:', error);
            return null;
        }
    }

    /**
     * Suscribirse a actualizaciones en tiempo real
     */
    subscribeToRoute(
        routeId: string,
        onUpdate: (data: LiveRouteData) => void,
        onError?: (error: any) => void
    ): () => void {
        // Si ya existe una suscripción, cancelarla primero
        if (this.channels.has(routeId)) {
            this.unsubscribe(routeId);
        }

        const channel = supabase
            .channel(`live-route-${routeId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'live_routes',
                    filter: `route_id=eq.${routeId}`,
                },
                (payload) => {
                    console.log('Realtime update:', payload);
                    if (payload.new) {
                        onUpdate(payload.new as LiveRouteData);
                    }
                }
            )
            .subscribe((status) => {
                console.log('Subscription status:', status);
                if (status === 'SUBSCRIPTION_ERROR' && onError) {
                    onError(new Error('Failed to subscribe to route updates'));
                }
            });

        this.channels.set(routeId, channel);

        // Retornar función de cleanup
        return () => this.unsubscribe(routeId);
    }

    /**
     * Cancelar suscripción
     */
    unsubscribe(routeId: string): void {
        const channel = this.channels.get(routeId);
        if (channel) {
            supabase.removeChannel(channel);
            this.channels.delete(routeId);
        }
    }

    /**
     * Detener tracking
     */
    async stopTracking(routeId: string): Promise<void> {
        try {
            // Actualizar estado a completado
            const { error } = await supabase
                .from('live_routes')
                .update({
                    status: 'completed',
                    last_update: new Date().toISOString(),
                })
                .eq('route_id', routeId);

            if (error) throw error;

            // Cancelar suscripción
            this.unsubscribe(routeId);
        } catch (error) {
            console.error('Error stopping tracking:', error);
            throw error;
        }
    }

    /**
     * Limpiar registros antiguos (>24 horas)
     */
    async cleanupOldRecords(): Promise<void> {
        try {
            const yesterday = new Date();
            yesterday.setHours(yesterday.getHours() - 24);

            const { error } = await supabase
                .from('live_routes')
                .delete()
                .lt('created_at', yesterday.toISOString());

            if (error) throw error;
        } catch (error) {
            console.error('Error cleaning up old records:', error);
        }
    }
}

export const liveTrackingService = new LiveTrackingService();
