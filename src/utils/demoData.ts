// Demo Mode - Datos de ejemplo impresionantes para presentaciones

import { Vehicle } from '@/types';
import { VehicleType } from '@/lib/validations';

export const DEMO_VEHICLES: Vehicle[] = [
  {
    id: 'V-DEMO-001',
    plate: 'AB-CD-12',
    model: 'Volvo FH16 750',
    status: 'Active' as const,
    mileage: 125000,
    fuelLevel: 78,
    nextService: '2024-12-15',
    location: { lat: -33.4489, lng: -70.6693 },
    city: 'Santiago Centro',
  },
  {
    id: 'V-DEMO-002',
    plate: 'EF-GH-34',
    model: 'Scania R500',
    status: 'Active' as const,
    mileage: 89000,
    fuelLevel: 92,
    nextService: '2024-12-20',
    location: { lat: -33.0472, lng: -71.6127 },
    city: 'Valparaíso',
  },
  {
    id: 'V-DEMO-003',
    plate: 'IJ-KL-56',
    model: 'Mercedes Actros 2651',
    status: 'Active' as const,
    mileage: 156000,
    fuelLevel: 45,
    nextService: '2024-11-28',
    location: { lat: -36.8201, lng: -73.0444 },
    city: 'Concepción',
  },
  {
    id: 'V-DEMO-004',
    plate: 'MN-OP-78',
    model: 'Freightliner Cascadia',
    status: 'Maintenance' as const,
    mileage: 210000,
    fuelLevel: 15,
    nextService: '2024-11-25',
    location: { lat: -33.4372, lng: -70.6506 },
    city: 'Santiago',
  },
  {
    id: 'V-DEMO-005',
    plate: 'QR-ST-90',
    model: 'MAN TGX 18.640',
    status: 'Active' as const,
    mileage: 67000,
    fuelLevel: 88,
    nextService: '2025-01-10',
    location: { lat: -39.8196, lng: -73.2452 },
    city: 'Valdivia',
  },
];

export const DEMO_DRIVERS = [
  {
    id: 'D-DEMO-001',
    name: 'Carlos Mendoza',
    rut: '12.345.678-5',
    licenseType: 'A5',
    licenseExpiry: '2025-06-15',
    status: 'On Route',
  },
  {
    id: 'D-DEMO-002',
    name: 'Ana Silva',
    rut: '15.432.198-K',
    licenseType: 'A4',
    licenseExpiry: '2025-03-20',
    status: 'Available',
  },
  {
    id: 'D-DEMO-003',
    name: 'Jorge O\'Ryan',
    rut: '9.876.543-2',
    licenseType: 'A5',
    licenseExpiry: '2024-12-01',
    status: 'Off Duty',
  },
  {
    id: 'D-DEMO-004',
    name: 'María González',
    rut: '18.654.321-7',
    licenseType: 'A4',
    licenseExpiry: '2025-08-10',
    status: 'Available',
  },
  {
    id: 'D-DEMO-005',
    name: 'Pedro Ramírez',
    rut: '11.222.333-4',
    licenseType: 'A5',
    licenseExpiry: '2025-04-15',
    status: 'On Route',
  },
];

export const DEMO_ROUTES = [
  {
    id: 'R-DEMO-001',
    origin: 'Santiago, Región Metropolitana, Chile',
    destination: 'Valparaíso, Región de Valparaíso, Chile',
    distance: '120 km',
    estimatedPrice: '$85.000',
    vehicleType: 'Camión Pequeño' as VehicleType,
    driver: 'Carlos Mendoza',
    vehicle: 'AB-CD-12',
    timestamp: Date.now() - 3600000,
    status: 'In Progress' as const,
  },
  {
    id: 'R-DEMO-002',
    origin: 'Santiago, Región Metropolitana, Chile',
    destination: 'Concepción, Región del Biobío, Chile',
    distance: '515 km',
    estimatedPrice: '$320.000',
    vehicleType: 'Camión Grande' as VehicleType,
    driver: 'Pedro Ramírez',
    vehicle: 'QR-ST-90',
    timestamp: Date.now() - 7200000,
    status: 'In Progress' as const,
  },
  {
    id: 'R-DEMO-003',
    origin: 'Valparaíso, Región de Valparaíso, Chile',
    destination: 'La Serena, Región de Coquimbo, Chile',
    distance: '315 km',
    estimatedPrice: '$195.000',
    vehicleType: 'Camión Mediano' as VehicleType,
    driver: 'Ana Silva',
    vehicle: 'EF-GH-34',
    timestamp: Date.now() - 14400000,
    status: 'Completed' as const,
    deliveryProof: {
      signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      clientName: 'Juan Pérez',
      clientId: '12.345.678-9',
      deliveredAt: Date.now() - 7200000,
      notes: 'Entrega realizada sin problemas',
    },
  },
  {
    id: 'R-DEMO-004',
    origin: 'Santiago, Región Metropolitana, Chile',
    destination: 'Rancagua, Región de O\'Higgins, Chile',
    distance: '95 km',
    estimatedPrice: '$65.000',
    vehicleType: 'Camioneta' as VehicleType,
    timestamp: Date.now() - 21600000,
    status: 'Completed' as const,
  },
  {
    id: 'R-DEMO-005',
    origin: 'Concepción, Región del Biobío, Chile',
    destination: 'Temuco, Región de La Araucanía, Chile',
    distance: '280 km',
    estimatedPrice: '$175.000',
    vehicleType: 'Camión Grande' as VehicleType,
    timestamp: Date.now() - 28800000,
    status: 'Completed' as const,
  },
  {
    id: 'R-DEMO-006',
    origin: 'Viña del Mar, Región de Valparaíso, Chile',
    destination: 'Santiago, Región Metropolitana, Chile',
    distance: '125 km',
    estimatedPrice: '$88.000',
    vehicleType: 'Furgón' as VehicleType,
    driver: 'María González',
    vehicle: 'IJ-KL-56',
    timestamp: Date.now() - 1800000,
    status: 'Pending' as const,
  },
];

// Transacciones de demostración
export const DEMO_TRANSACTIONS = [
  {
    id: 'TX-DEMO-001',
    type: 'Income' as const,
    category: 'Freight',
    amount: 850000,
    date: new Date(Date.now() - 86400000).toISOString(),
    description: 'Flete Santiago - Valparaíso',
    status: 'Paid' as const,
    document: {
      type: 'Invoice' as const,
      number: 'DEMO-INV-001',
    },
  },
  {
    id: 'TX-DEMO-002',
    type: 'Expense' as const,
    category: 'Fuel',
    amount: 125000,
    date: new Date(Date.now() - 172800000).toISOString(),
    description: 'Combustible Camión AB-CD-12',
    status: 'Paid' as const,
    document: {
      type: 'Receipt' as const,
      number: 'DEMO-REC-001',
    },
  },
  {
    id: 'TX-DEMO-003',
    type: 'Income' as const,
    category: 'Freight',
    amount: 1650000,
    date: new Date(Date.now() - 259200000).toISOString(),
    description: 'Flete Santiago - Concepción',
    status: 'Paid' as const,
    document: {
      type: 'Invoice' as const,
      number: 'DEMO-INV-002',
    },
  },
  {
    id: 'TX-DEMO-004',
    type: 'Expense' as const,
    category: 'Maintenance',
    amount: 350000,
    date: new Date(Date.now() - 345600000).toISOString(),
    description: 'Mantención preventiva MN-OP-78',
    status: 'Paid' as const,
    document: {
      type: 'Invoice' as const,
      number: 'DEMO-MAINT-001',
    },
    relatedId: 'MAINT-DEMO-001',
  },
  {
    id: 'TX-DEMO-005',
    type: 'Expense' as const,
    category: 'Salaries',
    amount: 800000,
    date: new Date(Date.now() - 432000000).toISOString(),
    description: 'Salario Carlos Mendoza - Diciembre',
    status: 'Paid' as const,
  },
  {
    id: 'TX-DEMO-006',
    type: 'Income' as const,
    category: 'Freight',
    amount: 1200000,
    date: new Date(Date.now() - 518400000).toISOString(),
    description: 'Flete Valparaíso - La Serena',
    status: 'Paid' as const,
    document: {
      type: 'Invoice' as const,
      number: 'DEMO-INV-003',
    },
  },
];

// Logs de mantenimiento de demostración
export const DEMO_MAINTENANCE_LOGS = [
  {
    id: 'MAINT-DEMO-001',
    vehicleId: 'V-DEMO-004',
    type: 'Preventive' as const,
    description: 'Cambio de aceite y filtros',
    cost: 350000,
    provider: 'Taller Central Demo',
    date: new Date(Date.now() - 345600000).toISOString(),
    status: 'Completed' as const,
    guarantee: true,
  },
  {
    id: 'MAINT-DEMO-002',
    vehicleId: 'V-DEMO-001',
    type: 'Corrective' as const,
    description: 'Reparación sistema de frenos',
    cost: 580000,
    provider: 'Servicio Técnico Demo',
    date: new Date(Date.now() - 604800000).toISOString(),
    status: 'Completed' as const,
    guarantee: true,
  },
  {
    id: 'MAINT-DEMO-003',
    vehicleId: 'V-DEMO-002',
    type: 'Preventive' as const,
    description: 'Revisión técnica anual',
    cost: 125000,
    provider: 'Centro de Inspección Demo',
    date: new Date(Date.now() - 1209600000).toISOString(),
    status: 'Completed' as const,
  },
  {
    id: 'MAINT-DEMO-004',
    vehicleId: 'V-DEMO-005',
    type: 'Preventive' as const,
    description: 'Cambio de neumáticos',
    cost: 920000,
    provider: 'Neumáticos Demo S.A.',
    date: new Date(Date.now() + 864000000).toISOString(),
    status: 'Scheduled' as const,
  },
  {
    id: 'MAINT-DEMO-005',
    vehicleId: 'V-DEMO-003',
    type: 'Emergency' as const,
    description: 'Reparación de motor',
    cost: 1250000,
    provider: 'Taller Especializado Demo',
    date: new Date(Date.now() - 1814400000).toISOString(),
    status: 'Completed' as const,
    guarantee: true,
  },
];

// Estadísticas de demostración para Dashboard
export const DEMO_STATS = {
  totalVehicles: 5,
  activeVehicles: 4,
  totalDrivers: 5,
  availableDrivers: 2,
  activeRoutes: 2,
  completedRoutesToday: 1,
  totalRevenue: 3700000,
  totalExpenses: 1375000,
  profit: 2325000,
  profitMargin: 62.8,
  fuelEfficiency: 8.2,
  onTimeDelivery: 96.5,
  avgDeliveryTime: '4.2 horas',
  customerSatisfaction: 4.8,
};

// Función para activar modo demo
export const enableDemoMode = (store: any) => {
  console.log('🎭 Modo Demo Activado');

  // Cargar datos demo en el store
  store.setState({
    registeredRoutes: DEMO_ROUTES,
  });

  // Disparar eventos para actualizar vehículos y conductores
  window.dispatchEvent(new CustomEvent('demo-mode-enabled', {
    detail: {
      vehicles: DEMO_VEHICLES,
      drivers: DEMO_DRIVERS,
    },
  }));

  return {
    vehicles: DEMO_VEHICLES,
    drivers: DEMO_DRIVERS,
    routes: DEMO_ROUTES,
    transactions: DEMO_TRANSACTIONS,
    maintenanceLogs: DEMO_MAINTENANCE_LOGS,
    stats: DEMO_STATS,
  };
};

// Función para generar datos aleatorios en vivo
export const generateLiveData = () => {
  return {
    activeTrucks: Math.floor(Math.random() * 3) + 12,
    routesInProgress: Math.floor(Math.random() * 2) + 3,
    fuelAverage: Math.floor(Math.random() * 10) + 70,
    revenueToday: Math.floor(Math.random() * 50000) + 250000,
  };
};

/**
 * Hook helper para obtener datos demo o reales según el rol del usuario
 */
export function useDemoData<T>(realData: T, demoData: T, isDemoUser: boolean): T {
  return isDemoUser ? demoData : realData;
}

export default {
  DEMO_VEHICLES,
  DEMO_DRIVERS,
  DEMO_ROUTES,
  DEMO_TRANSACTIONS,
  DEMO_MAINTENANCE_LOGS,
  DEMO_STATS,
  enableDemoMode,
  generateLiveData,
  useDemoData,
};
