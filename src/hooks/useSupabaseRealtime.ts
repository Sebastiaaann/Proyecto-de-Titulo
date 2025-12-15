import { useEffect } from 'react';
import { supabase } from '@services/supabaseClient';
import toast from 'react-hot-toast';
import { useStore } from '@store/useStore';

export const useSupabaseRealtime = () => {
    const loadRoutes = useStore(state => state.loadRoutes);

    useEffect(() => {
        // Cargar rutas al iniciar
        loadRoutes();

        // Canal para vehículos
        const vehiclesChannel = supabase
            .channel('public:vehicles')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'vehicles',
                },
                (payload) => {
                    console.log('Vehicle change received!', payload);
                    // Emitir evento personalizado para que FleetManager lo escuche
                    window.dispatchEvent(new CustomEvent('vehicle-change'));
                    
                    if (payload.eventType === 'INSERT') {
                        toast.success('Nuevo vehículo añadido');
                    } else if (payload.eventType === 'UPDATE') {
                        toast('Vehículo actualizado', { icon: '🔄' });
                    } else if (payload.eventType === 'DELETE') {
                        toast.error('Vehículo eliminado');
                    }
                }
            )
            .subscribe();

        // Canal para conductores
        const driversChannel = supabase
            .channel('public:drivers')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'drivers',
                },
                (payload) => {
                    console.log('Driver change received!', payload);
                    // Emitir evento personalizado para que FleetManager lo escuche
                    window.dispatchEvent(new CustomEvent('driver-change'));
                    
                    if (payload.eventType === 'INSERT') {
                        toast.success('Nuevo conductor añadido');
                    } else if (payload.eventType === 'UPDATE') {
                        toast('Conductor actualizado', { icon: '🔄' });
                    } else if (payload.eventType === 'DELETE') {
                        toast.error('Conductor eliminado');
                    }
                }
            )
            .subscribe();

        // Canal para rutas
        const routesChannel = supabase
            .channel('public:routes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'routes',
                },
                (payload) => {
                    console.log('Route change received!', payload);
                    // Recargar rutas cuando hay cambios
                    loadRoutes();
                    
                    if (payload.eventType === 'INSERT') {
                        toast.success('Nueva ruta creada');
                    } else if (payload.eventType === 'UPDATE') {
                        toast('Ruta actualizada', { icon: '🔄' });
                    } else if (payload.eventType === 'DELETE') {
                        toast.error('Ruta eliminada');
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(vehiclesChannel);
            supabase.removeChannel(driversChannel);
            supabase.removeChannel(routesChannel);
        };
    }, [loadRoutes]);
};
