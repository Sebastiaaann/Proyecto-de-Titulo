// Demo Mode - Datos de ejemplo impresionantes para presentaciones

export const DEMO_VEHICLES = [
  {
    id: 'V-DEMO-001',
    plate: 'AB-CD-12',
    model: 'Volvo FH16 750',
    status: 'Active',
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
    status: 'Active',
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
    status: 'Active',
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
    status: 'Maintenance',
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
    status: 'Active',
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
    vehicleType: 'Camión 3/4',
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
    vehicleType: 'Camión Plataforma',
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
    vehicleType: 'Camión 3/4',
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
    vehicleType: 'Camión 1/2',
    timestamp: Date.now() - 21600000,
    status: 'Completed' as const,
  },
  {
    id: 'R-DEMO-005',
    origin: 'Concepción, Región del Biobío, Chile',
    destination: 'Temuco, Región de La Araucanía, Chile',
    distance: '280 km',
    estimatedPrice: '$175.000',
    vehicleType: 'Camión Plataforma',
    timestamp: Date.now() - 28800000,
    status: 'Completed' as const,
  },
  {
    id: 'R-DEMO-006',
    origin: 'Viña del Mar, Región de Valparaíso, Chile',
    destination: 'Santiago, Región Metropolitana, Chile',
    distance: '125 km',
    estimatedPrice: '$88.000',
    vehicleType: 'Camión 3/4',
    driver: 'María González',
    vehicle: 'IJ-KL-56',
    timestamp: Date.now() - 1800000,
    status: 'Pending' as const,
  },
];

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

export default {
  DEMO_VEHICLES,
  DEMO_DRIVERS,
  DEMO_ROUTES,
  enableDemoMode,
  generateLiveData,
};
