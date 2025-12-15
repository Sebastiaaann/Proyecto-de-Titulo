import { liveTrackingService, type DriverLocation } from '@services/liveTrackingService';

/**
 * Simulador de conductor para testing
 * Simula el movimiento de un conductor desde origen a destino
 */
export class DriverSimulator {
    private intervalId: NodeJS.Timeout | null = null;
    private progress = 0;

    constructor(
        private routeId: string,
        private origin: [number, number],
        private destination: [number, number],
        private updateInterval = 3000 // 3 segundos
    ) { }

    /**
     * Iniciar simulación
     */
    async start(): Promise<void> {
        // Iniciar tracking en Supabase
        await liveTrackingService.startTracking(this.routeId, {
            lat: this.origin[0],
            lng: this.origin[1],
            timestamp: Date.now(),
        });

        // Simular movimiento
        this.intervalId = setInterval(async () => {
            this.progress += 0.02; // 2% por iteración

            if (this.progress >= 1) {
                this.progress = 1;
                await this.stop();
                return;
            }

            // Interpolar posición
            const lat = this.origin[0] + (this.destination[0] - this.origin[0]) * this.progress;
            const lng = this.origin[1] + (this.destination[1] - this.origin[1]) * this.progress;

            // Calcular velocidad simulada (40-60 km/h)
            const speed = 40 + Math.random() * 20;

            // Calcular heading (dirección)
            const heading = this.calculateHeading(
                this.origin[0],
                this.origin[1],
                this.destination[0],
                this.destination[1]
            );

            // Determinar estado
            let status: 'waiting' | 'picking_up' | 'in_transit' | 'delivering' | 'completed';
            if (this.progress < 0.1) {
                status = 'waiting';
            } else if (this.progress < 0.3) {
                status = 'picking_up';
            } else if (this.progress < 0.8) {
                status = 'in_transit';
            } else if (this.progress < 1) {
                status = 'delivering';
            } else {
                status = 'completed';
            }

            // Actualizar ubicación en Supabase
            await liveTrackingService.updateLocation(
                this.routeId,
                {
                    lat,
                    lng,
                    heading,
                    speed,
                    timestamp: Date.now(),
                },
                status
            );

            console.log(`[Simulator] Progress: ${(this.progress * 100).toFixed(0)}% - Status: ${status}`);
        }, this.updateInterval);
    }

    /**
     * Detener simulación
     */
    async stop(): Promise<void> {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        await liveTrackingService.stopTracking(this.routeId);
        console.log('[Simulator] Stopped');
    }

    /**
     * Calcular heading (dirección) entre dos puntos
     */
    private calculateHeading(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const dLng = (lng2 - lng1) * (Math.PI / 180);
        const lat1Rad = lat1 * (Math.PI / 180);
        const lat2Rad = lat2 * (Math.PI / 180);

        const y = Math.sin(dLng) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

        let heading = Math.atan2(y, x) * (180 / Math.PI);
        heading = (heading + 360) % 360; // Normalizar a 0-360

        return heading;
    }
}

/**
 * Ejemplo de uso:
 * 
 * const simulator = new DriverSimulator(
 *   'route-123',
 *   [-33.4489, -70.6693], // Santiago
 *   [-33.4372, -70.6506]  // Destino
 * );
 * 
 * await simulator.start();
 * 
 * // Para detener:
 * await simulator.stop();
 */
