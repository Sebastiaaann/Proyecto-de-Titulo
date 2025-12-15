import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppView } from '@/types';
import { routeService } from '@services/databaseService';
import { showToast } from '@components/common/Toast';
import { VehicleType } from '@/lib/validations';

interface DeliveryProof {
    signature: string; // Base64 image
    clientName?: string;
    clientId?: string;
    deliveredAt: number; // Timestamp
    notes?: string;
}

interface RouteRating {
    rating: number; // 1-5 stars
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
    vehicleType: VehicleType;
    driver?: string;
    vehicle?: string;
    timestamp: number;
    status: 'Pending' | 'In Progress' | 'Completed';
    deliveryProof?: DeliveryProof; // Comprobante de entrega
    rating?: RouteRating; // Calificación del servicio
    start_lat?: number;
    start_lng?: number;
    started_at?: string;
}

interface PendingRouteData {
    origin: string;
    destination: string;
    distance: string;
    cargoDescription: string;
    estimatedPrice: string;
    vehicleType: VehicleType;
}

interface IsoStep {
    step: string;
    completed: boolean;
}

interface AppState {
    currentView: AppView;
    isLoading: boolean;
    registeredRoutes: RegisteredRoute[];
    pendingRouteData: PendingRouteData | null;
    isoSteps: IsoStep[];
    setView: (view: AppView) => void;
    setLoading: (loading: boolean) => void;
    toggleIsoStep: (stepName: string) => void;
    loadRoutes: () => Promise<void>;
    addRoute: (route: RegisteredRoute) => Promise<void>;
    removeRoute: (routeId: string) => Promise<void>;
    updateRouteStatus: (routeId: string, status: 'Pending' | 'In Progress' | 'Completed') => Promise<void>;
    startRoute: (routeId: string, location: { lat: number; lng: number }) => Promise<void>;
    updateRouteWithProof: (routeId: string, deliveryProof: DeliveryProof) => Promise<void>;
    updateRouteRating: (routeId: string, rating: RouteRating) => Promise<void>;
    setPendingRouteData: (data: PendingRouteData | null) => void;
    clearPendingRouteData: () => void;
}

export type { RouteRating, RegisteredRoute, DeliveryProof };

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            currentView: AppView.HOME,
            isLoading: false,
            registeredRoutes: [],
            pendingRouteData: null,
            isoSteps: [
                { step: 'Auditoría Interna', completed: true },
                { step: 'Gestión de No Conformidades', completed: true },
                { step: 'Revisión por Dirección', completed: false },
                { step: 'Certificación Externa', completed: false },
            ],

            setView: (view) => set({ currentView: view }),
            setLoading: (loading) => set({ isLoading: loading }),

            toggleIsoStep: (stepName) => set((state) => ({
                isoSteps: state.isoSteps.map((s) =>
                    s.step === stepName ? { ...s, completed: !s.completed } : s
                )
            })),

            // Cargar rutas desde Supabase
            loadRoutes: async () => {
                try {
                    const routes = await routeService.getAll();
                    set({ registeredRoutes: routes });
                } catch (error) {
                    showToast.error('Error', error instanceof Error ? error.message : 'loadRoutes');
                    // En caso de error, mantener las rutas en localStorage
                }
            },

            // Agregar ruta (Supabase + Estado local)
            addRoute: async (route) => {
                // Optimistic Update: Agregar inmediatamente al estado local
                set((state) => ({
                    registeredRoutes: [route, ...state.registeredRoutes] // Agregar al inicio para que se vea primero
                }));

                try {
                    await routeService.create(route);
                    showToast.success('Ruta creada exitosamente');
                } catch (error) {
                    showToast.error('Error', error instanceof Error ? error.message : 'addRoute');
                    // Rollback: Si falla, remover la ruta del estado local
                    set((state) => ({
                        registeredRoutes: state.registeredRoutes.filter(r => r.id !== route.id)
                    }));
                    throw error;
                }
            },

            // Eliminar ruta (Supabase + Estado local)
            removeRoute: async (routeId) => {
                try {
                    await routeService.delete(routeId);
                    set((state) => ({
                        registeredRoutes: state.registeredRoutes.filter(route => route.id !== routeId)
                    }));
                    showToast.success('Ruta eliminada exitosamente');
                } catch (error) {
                    showToast.error('Error', error instanceof Error ? error.message : 'removeRoute');
                    // Fallback: eliminar solo del estado local
                    set((state) => ({
                        registeredRoutes: state.registeredRoutes.filter(route => route.id !== routeId)
                    }));
                    throw error;
                }
            },

            // Actualizar estado de ruta (Supabase + Estado local)
            updateRouteStatus: async (routeId, status) => {
                try {
                    await routeService.updateStatus(routeId, status);
                    set((state) => ({
                        registeredRoutes: state.registeredRoutes.map(route =>
                            route.id === routeId ? { ...route, status } : route
                        )
                    }));
                    showToast.success('Estado de ruta actualizado');
                } catch (error) {
                    showToast.error('Error', error instanceof Error ? error.message : 'updateRouteStatus');
                    // Fallback: actualizar solo el estado local
                    set((state) => ({
                        registeredRoutes: state.registeredRoutes.map(route =>
                            route.id === routeId ? { ...route, status } : route
                        )
                    }));
                    throw error;
                }
            },

            // Iniciar ruta con ubicación
            startRoute: async (routeId, location) => {
                try {
                    const updated = await routeService.startRoute(routeId, location);
                    set((state) => ({
                        registeredRoutes: state.registeredRoutes.map(route =>
                            route.id === routeId
                                ? {
                                    ...route,
                                    status: 'In Progress',
                                    start_lat: updated?.start_lat ?? route.start_lat,
                                    start_lng: updated?.start_lng ?? route.start_lng,
                                    started_at: updated?.started_at ?? route.started_at,
                                }
                                : route
                        )
                    }));
                    showToast.success('Ruta iniciada correctamente');
                } catch (error) {
                    showToast.error('Error', error instanceof Error ? error.message : 'startRoute');
                    // Fallback local
                    set((state) => ({
                        registeredRoutes: state.registeredRoutes.map(route =>
                            route.id === routeId ? { ...route, status: 'In Progress' } : route
                        )
                    }));
                    throw error;
                }
            },

            // Actualizar ruta con comprobante de entrega
            updateRouteWithProof: async (routeId, deliveryProof) => {
                try {
                    // Actualizar en Supabase
                    await routeService.updateProof(routeId, deliveryProof);

                    set((state) => ({
                        registeredRoutes: state.registeredRoutes.map(route =>
                            route.id === routeId
                                ? { ...route, deliveryProof, status: 'Completed' as const }
                                : route
                        )
                    }));
                    showToast.success('Comprobante de entrega registrado');
                } catch (error) {
                    showToast.error('Error', error instanceof Error ? error.message : 'updateRouteWithProof');
                    // Fallback: actualizar solo el estado local
                    set((state) => ({
                        registeredRoutes: state.registeredRoutes.map(route =>
                            route.id === routeId
                                ? { ...route, deliveryProof, status: 'Completed' as const }
                                : route
                        )
                    }));
                    throw error;
                }
            },

            // Actualizar calificación de ruta
            updateRouteRating: async (routeId, rating) => {
                try {
                    // Actualizar en Supabase (si existe el servicio)
                    // await routeService.updateRating(routeId, rating);

                    set((state) => ({
                        registeredRoutes: state.registeredRoutes.map(route =>
                            route.id === routeId
                                ? { ...route, rating }
                                : route
                        )
                    }));
                    showToast.success('Calificación registrada exitosamente');
                } catch (error) {
                    showToast.error('Error', error instanceof Error ? error.message : 'updateRouteRating');
                    // Fallback: actualizar solo el estado local
                    set((state) => ({
                        registeredRoutes: state.registeredRoutes.map(route =>
                            route.id === routeId
                                ? { ...route, rating }
                                : route
                        )
                    }));
                    throw error;
                }
            },

            setPendingRouteData: (data) => set({ pendingRouteData: data }),
            clearPendingRouteData: () => set({ pendingRouteData: null }),
        }),
        {
            name: 'fleettech-storage',
            partialize: (state) => ({
                currentView: state.currentView,
                registeredRoutes: state.registeredRoutes,
                isoSteps: state.isoSteps
            }),
        }
    )
);


