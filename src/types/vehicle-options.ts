export interface VehicleOption {
    id: string;
    name: string;
    description: string;
    icon: string;
    pricePerKm: number;
    basePrice: number;
    capacity: string;
    estimatedTime: string;
    features: string[];
    color: string;
}

export const VEHICLE_OPTIONS: VehicleOption[] = [
    {
        id: 'van',
        name: 'Furgón Estándar',
        description: 'Ideal para cargas pequeñas y urbanas',
        icon: '🚐',
        pricePerKm: 350,
        basePrice: 2000,
        capacity: 'Hasta 500kg',
        estimatedTime: '5-10 min',
        features: ['Carga seca', 'Urbano', 'Rápido'],
        color: 'blue',
    },
    {
        id: 'truck-small',
        name: 'Camión Pequeño',
        description: 'Para cargas medianas',
        icon: '🚚',
        pricePerKm: 450,
        basePrice: 3000,
        capacity: 'Hasta 2 ton',
        estimatedTime: '10-15 min',
        features: ['Carga seca', 'Interurbano', 'Versátil'],
        color: 'green',
    },
    {
        id: 'truck-large',
        name: 'Camión Grande',
        description: 'Cargas pesadas y voluminosas',
        icon: '🚛',
        pricePerKm: 650,
        basePrice: 5000,
        capacity: 'Hasta 8 ton',
        estimatedTime: '15-20 min',
        features: ['Carga pesada', 'Larga distancia', 'Profesional'],
        color: 'purple',
    },
    {
        id: 'refrigerated',
        name: 'Refrigerado',
        description: 'Temperatura controlada',
        icon: '❄️',
        pricePerKm: 800,
        basePrice: 6000,
        capacity: 'Hasta 3 ton',
        estimatedTime: '10-15 min',
        features: ['Refrigerado', 'Perecederos', 'Temperatura controlada'],
        color: 'cyan',
    },
];

export interface FareEstimate {
    basePrice: number;
    distancePrice: number;
    timePrice: number;
    total: number;
    duration: string;
    durationMinutes: number;
}

export function calculateFareEstimate(
    distance: number,
    vehicleOption: VehicleOption
): FareEstimate {
    const basePrice = vehicleOption.basePrice;
    const distancePrice = distance * vehicleOption.pricePerKm;

    // Estimar duración (promedio 40 km/h en ciudad, 60 km/h en carretera)
    const avgSpeed = distance > 50 ? 60 : 40;
    const durationMinutes = Math.round((distance / avgSpeed) * 60);
    const timePrice = durationMinutes * 10; // 10 CLP por minuto

    const total = basePrice + distancePrice + timePrice;

    return {
        basePrice,
        distancePrice,
        timePrice,
        total,
        duration: `${durationMinutes} min`,
        durationMinutes,
    };
}
