import { supabase } from './supabaseClient';
import type { Vehicle, Driver, FinancialReport, MaintenanceLog, Transaction } from '@/types';
import { DatabaseError } from '@/lib/errors';
import type {
  VehicleCreate,
  VehicleUpdate,
  VehicleStatus,
  DriverCreate,
  DriverUpdate,
  DriverStatus,
  RouteCreate,
  RouteUpdate,
  RouteStatus,
  DeliveryProof,
} from '@/lib/validations';

// Tipos para las tablas de Supabase
interface RouteDB {
  id: string;
  origin: string;
  destination: string;
  distance: string; // Keeping as string to avoid breaking if DB is text, but we will send clean string
  estimated_price: number; // Changed to number to match likely DB type
  vehicle_type: string;
  driver?: string;
  vehicle?: string;
  timestamp: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  delivery_proof?: any;
}

// ... (other interfaces unchanged)

/**
 * Transform database route to app route
 */
function transformRouteFromDB(route: RouteDB): any {
  return {
    id: route.id,
    origin: route.origin,
    destination: route.destination,
    distance: route.distance, // Assumes DB stores "123 km" or just "123"
    estimatedPrice: `$${(route.estimated_price || 0).toLocaleString('es-CL')}`, // Format number to currency string
    vehicleType: route.vehicle_type,
    driver: route.driver,
    vehicle: route.vehicle,
    timestamp: new Date(route.timestamp).getTime(),
    status: route.status,
    deliveryProof: route.delivery_proof
  };
}

/**
 * Transform app route to database route
 */
function transformRouteToDB(route: RouteCreate): RouteDB {
  // Strip currency symbols and parse to number
  const price = parseFloat(route.estimatedPrice.replace(/[^0-9.]/g, '')) || 0;

  return {
    id: route.id,
    origin: route.origin,
    destination: route.destination,
    distance: route.distance,
    estimated_price: price, // Send raw number
    vehicle_type: route.vehicleType,
    driver: route.driver,
    vehicle: route.vehicle,
    timestamp: new Date(route.timestamp).toISOString(),
    status: route.status,
    delivery_proof: route.deliveryProof
  };
}

// ... (other interfaces unchanged)



interface VehicleDB {
  id: string;
  plate: string;
  model: string;
  status: 'Active' | 'Maintenance' | 'Idle';
  mileage: number;
  fuel_level: number;
  next_service: string;
  city?: string;
  location_lat?: number;
  location_lng?: number;
  insurance_expiry?: string;
  documents?: any[]; // JSONB
}

interface DriverDB {
  id: string;
  name: string;
  rut: string;
  license_type: string;
  license_expiry: string;
  status: 'Available' | 'On Route' | 'Off Duty';
  user_id?: string;
}

/**
 * Transform database vehicle to app vehicle
 */
function transformVehicleFromDB(v: VehicleDB): Vehicle {
  return {
    id: v.id,
    plate: v.plate,
    model: v.model,
    status: v.status,
    mileage: v.mileage,
    fuelLevel: v.fuel_level,
    nextService: v.next_service,
    city: v.city,
    location: v.location_lat && v.location_lng ? {
      lat: v.location_lat,
      lng: v.location_lng
    } : undefined,
    insuranceExpiry: v.insurance_expiry,
    documents: v.documents
  };
}

/**
 * Transform app vehicle to database vehicle
 */
function transformVehicleToDB(vehicle: VehicleCreate): VehicleDB {
  return {
    id: vehicle.id,
    plate: vehicle.plate,
    model: vehicle.model,
    status: vehicle.status,
    mileage: vehicle.mileage,
    fuel_level: vehicle.fuelLevel,
    next_service: vehicle.nextService,
    city: vehicle.city,
    location_lat: vehicle.location?.lat,
    location_lng: vehicle.location?.lng,
    insurance_expiry: vehicle.insuranceExpiry,
    documents: vehicle.documents
  };
}

// ============================================
// VEHICLES - CRUD Operations
// ============================================

export const vehicleService = {
  /**
   * Get all vehicles
   */
  async getAll(): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new DatabaseError(
          'Failed to fetch vehicles',
          error.code,
          error
        );
      }

      return data?.map(transformVehicleFromDB) || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('Error inesperado al cargar vehículos', 'UNKNOWN', error);
    }
  },

  /**
   * Create new vehicle
   */
  async create(vehicle: VehicleCreate): Promise<Vehicle> {
    try {
      const dbVehicle = transformVehicleToDB(vehicle);

      const { data, error } = await supabase
        .from('vehicles')
        .insert([dbVehicle])
        .select()
        .single();

      if (error) {
        throw new DatabaseError(
          'Failed to create vehicle',
          error.code,
          error
        );
      }

      return transformVehicleFromDB(data);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('Error inesperado al crear vehículo', 'UNKNOWN', error);
    }
  },

  /**
   * Update vehicle
   */
  async update(id: string, updates: VehicleUpdate): Promise<Vehicle> {
    try {
      // Transform fields to snake_case
      const dbUpdates: Partial<VehicleDB> = {};
      if (updates.plate !== undefined) dbUpdates.plate = updates.plate;
      if (updates.model !== undefined) dbUpdates.model = updates.model;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.mileage !== undefined) dbUpdates.mileage = updates.mileage;
      if (updates.fuelLevel !== undefined) dbUpdates.fuel_level = updates.fuelLevel;
      if (updates.nextService !== undefined) dbUpdates.next_service = updates.nextService;
      if (updates.city !== undefined) dbUpdates.city = updates.city;
      if (updates.location?.lat !== undefined) dbUpdates.location_lat = updates.location.lat;
      if (updates.location?.lng !== undefined) dbUpdates.location_lng = updates.location.lng;
      if (updates.insuranceExpiry !== undefined) dbUpdates.insurance_expiry = updates.insuranceExpiry;
      if (updates.documents !== undefined) dbUpdates.documents = updates.documents;

      const { data, error } = await supabase
        .from('vehicles')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(
          'Failed to update vehicle',
          error.code,
          error
        );
      }

      return transformVehicleFromDB(data);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('Error inesperado al actualizar vehículo', 'UNKNOWN', error);
    }
  },

  /**
   * Delete vehicle
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) {
        throw new DatabaseError(
          'Failed to delete vehicle',
          error.code,
          error
        );
      }

      return true;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('Error inesperado al eliminar vehículo', 'UNKNOWN', error);
    }
  },

  /**
   * Get vehicles by status
   */
  async getByStatus(status: VehicleStatus): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', status)
        .is('deleted_at', null);

      if (error) {
        throw new DatabaseError(
          'Failed to fetch vehicles by status',
          error.code,
          error
        );
      }

      return data?.map(transformVehicleFromDB) || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('Error inesperado al cargar vehículos', 'UNKNOWN', error);
    }
  },
};

/**
 * Transform database driver to app driver
 */
function transformDriverFromDB(d: DriverDB): Driver {
  return {
    id: d.id,
    name: d.name,
    rut: d.rut,
    licenseType: d.license_type,
    licenseExpiry: d.license_expiry,
    status: d.status,
    user_id: d.user_id
  };
}

/**
 * Transform app driver to database driver
 */
function transformDriverToDB(driver: DriverCreate): DriverDB {
  return {
    id: driver.id,
    name: driver.name,
    rut: driver.rut,
    license_type: driver.licenseType,
    license_expiry: driver.licenseExpiry,
    status: driver.status,
    user_id: driver.user_id
  };
}

// ============================================
// DRIVERS - CRUD Operations
// ============================================

export const driverService = {
  /**
   * Get all drivers
   */
  async getAll(): Promise<Driver[]> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new DatabaseError(
          'Failed to fetch drivers',
          error.code,
          error
        );
      }

      return data?.map(transformDriverFromDB) || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('Error inesperado al cargar conductores', 'UNKNOWN', error);
    }
  },

  /**
   * Create new driver
   */
  async create(driver: DriverCreate): Promise<Driver> {
    try {
      const dbDriver = transformDriverToDB(driver);

      const { data, error } = await supabase
        .from('drivers')
        .insert([dbDriver])
        .select()
        .single();

      if (error) {
        throw new DatabaseError(
          'Failed to create driver',
          error.code,
          error
        );
      }

      return transformDriverFromDB(data);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('Error inesperado al crear conductor', 'UNKNOWN', error);
    }
  },

  /**
   * Update driver
   */
  async update(id: string, updates: DriverUpdate): Promise<Driver> {
    try {
      // Transform fields to snake_case
      const dbUpdates: Partial<DriverDB> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.rut !== undefined) dbUpdates.rut = updates.rut;
      if (updates.licenseType !== undefined) dbUpdates.license_type = updates.licenseType;
      if (updates.licenseExpiry !== undefined) dbUpdates.license_expiry = updates.licenseExpiry;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.user_id !== undefined) dbUpdates.user_id = updates.user_id;

      const { data, error } = await supabase
        .from('drivers')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(
          'Failed to update driver',
          error.code,
          error
        );
      }

      return transformDriverFromDB(data);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('Error inesperado al actualizar conductor', 'UNKNOWN', error);
    }
  },

  /**
   * Delete driver
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id);

      if (error) {
        throw new DatabaseError(
          'Failed to delete driver',
          error.code,
          error
        );
      }

      return true;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('Error inesperado al eliminar conductor', 'UNKNOWN', error);
    }
  },

  /**
   * Get available drivers
   */
  async getAvailable(): Promise<Driver[]> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('status', 'Available')
        .is('deleted_at', null);

      if (error) {
        throw new DatabaseError(
          'Failed to fetch available drivers',
          error.code,
          error
        );
      }

      return data?.map(transformDriverFromDB) || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('Error inesperado al cargar conductores disponibles', 'UNKNOWN', error);
    }
  },
};

// ============================================
// ROUTES - Removed old service (duplicated below)
// ============================================

// ============================================
// GPS TRACKING - Real-time Operations
// ============================================

export const gpsService = {
  // Agregar nueva ubicación GPS
  async addLocation(location: {
    route_id: string;
    vehicle_id: string;
    latitude: number;
    longitude: number;
    speed: number;
    engine_on: boolean;
  }) {
    const { data, error } = await supabase
      .from('gps_tracking')
      .insert([{ ...location, timestamp: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener historial de ubicaciones
  async getRouteHistory(routeId: string) {
    const { data, error } = await supabase
      .from('gps_tracking')
      .select('*')
      .eq('route_id', routeId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Obtener el último punto GPS (más reciente)
  async getLatestRoutePoint(routeId: string) {
    const { data, error } = await supabase
      .from('gps_tracking')
      .select('latitude, longitude, speed, timestamp')
      .eq('route_id', routeId)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data?.[0] ?? null;
  },

  // Suscribirse a actualizaciones en tiempo real
  subscribeToRoute(routeId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`route-${routeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gps_tracking',
          filter: `route_id=eq.${routeId}`,
        },
        callback
      )
      .on('broadcast', { event: 'location' }, (payload) => callback(payload.payload))
      .subscribe();
  },

  // Emitir ubicación en tiempo real (Broadcast)
  async broadcastLocation(routeId: string, payload: { vehicleId: string; lat: number; lng: number; speed: number }) {
    const channel = supabase.channel(`route-${routeId}`);
    // No necesitamos suscribirnos esperando confirmación para enviar, 
    // pero idealmente el canal debería estar abierto. 
    // Supabase JS maneja esto, pero si creamos canales efímeros puede ser costoso en conexiones.
    // Para simplificar:
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'location',
          payload: payload,
        });
      }
    });
  }
};

// ============================================
// MAINTENANCE - Operations
// ============================================

interface MaintenanceDB {
  id: string;
  vehicle_id: string;
  type: 'Preventive' | 'Corrective' | 'Emergency';
  description: string;
  cost: number;
  provider: string;
  scheduled_date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  guarantee: boolean;
}

function transformMaintenanceFromDB(m: any): MaintenanceLog {
  return {
    id: m.id,
    vehicleId: m.vehicle_id,
    type: m.type || 'Preventive',
    description: m.description,
    cost: m.cost || 0,
    provider: m.provider || 'Internal',
    date: m.scheduled_date,
    status: m.status || 'Scheduled',
    guarantee: m.guarantee
  };
}

function transformMaintenanceToDB(m: Omit<MaintenanceLog, 'id'>): Partial<MaintenanceDB> {
  return {
    vehicle_id: m.vehicleId,
    type: m.type,
    description: m.description,
    cost: m.cost,
    provider: m.provider,
    scheduled_date: m.date,
    status: m.status,
    guarantee: m.guarantee || false
  };
}

export const maintenanceService = {
  async getAll(): Promise<MaintenanceLog[]> {
    const { data, error } = await supabase
      .from('maintenance')
      .select('*, vehicle:vehicles(*)')
      .is('deleted_at', null)
      .order('scheduled_date', { ascending: false });

    if (error) throw error;
    return data?.map(transformMaintenanceFromDB) || [];
  },

  async getByVehicle(vehicleId: string): Promise<MaintenanceLog[]> {
    const { data, error } = await supabase
      .from('maintenance')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .is('deleted_at', null)
      .order('scheduled_date', { ascending: false });

    if (error) throw error;
    return data?.map(transformMaintenanceFromDB) || [];
  },

  async create(maintenance: Omit<MaintenanceLog, 'id'>) {
    const dbMaintenance = transformMaintenanceToDB(maintenance);
    const { data, error } = await supabase
      .from('maintenance')
      .insert([dbMaintenance])
      .select()
      .single();

    if (error) throw error;
    return transformMaintenanceFromDB(data);
  },

  async update(id: string, updates: Partial<MaintenanceLog>) {
    const dbUpdates: any = {};
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.cost !== undefined) dbUpdates.cost = updates.cost;
    if (updates.provider) dbUpdates.provider = updates.provider;
    if (updates.date) dbUpdates.scheduled_date = updates.date;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.guarantee !== undefined) dbUpdates.guarantee = updates.guarantee;

    const { data, error } = await supabase
      .from('maintenance')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformMaintenanceFromDB(data);
  },

  // Obtener mantenimientos próximos
  async getUpcoming(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('maintenance')
      .select('*, vehicle:vehicles(*)')
      .gte('scheduled_date', new Date().toISOString())
      .lte('scheduled_date', futureDate.toISOString())
      .is('deleted_at', null);

    if (error) throw error;
    return data;
  },
};

// ============================================
// COMPLIANCE/DOCUMENTS - Operations
// ============================================

export const complianceService = {
  async getAll() {
    const { data, error } = await supabase
      .from('compliance_documents')
      .select('*')
      .is('deleted_at', null)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getExpiringSoon(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('compliance_documents')
      .select('*')
      .lte('expiry_date', futureDate.toISOString())
      .gte('expiry_date', new Date().toISOString())
      .is('deleted_at', null);

    if (error) throw error;
    return data;
  },

  async create(document: any) {
    const { data, error } = await supabase
      .from('compliance_documents')
      .insert([document])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================
// ANALYTICS - Dashboard Metrics
// ============================================


// ============================================
// ROUTES - CRUD Operations
// ============================================

export const routeService = {
  /**
   * Get all routes
   */
  async getAll(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        throw new DatabaseError(
          'Failed to fetch routes',
          error.code,
          error
        );
      }

      return data?.map(transformRouteFromDB) || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('Error inesperado al cargar rutas', 'UNKNOWN', error);
    }
  },

  /**
   * Get routes by driver
   */
  async getByDriver(driverName: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('driver', driverName)
        .order('timestamp', { ascending: false });

      if (error) {
        throw new DatabaseError(
          'Failed to fetch routes by driver',
          error.code,
          error
        );
      }

      return data?.map(transformRouteFromDB) || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('Error inesperado al cargar rutas del conductor', 'UNKNOWN', error);
    }
  },

  /**
   * Create new route
   */
  async create(route: RouteCreate): Promise<any> {
    try {
      const dbRoute = transformRouteToDB(route);

      const { data, error } = await supabase
        .from('routes')
        .insert([dbRoute])
        .select()
        .single();

      if (error) {
        console.error('Supabase Create Route Error:', error); // DEBUG: Print full error details
        throw new DatabaseError(
          'Failed to create route',
          error.code,
          error
        );
      }

      return transformRouteFromDB(data);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('Error inesperado al crear ruta', 'UNKNOWN', error);
    }
  },

  /**
   * Update route status
   */
  async updateStatus(id: string, status: RouteStatus): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('routes')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(
          'Failed to update route status',
          error.code,
          error
        );
      }

      return transformRouteFromDB(data);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('Error inesperado al actualizar estado de ruta', 'UNKNOWN', error);
    }
  },

  /**
   * Start route with geolocation
   */
  async startRoute(id: string, location: { lat: number; lng: number }): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('routes')
        .update({
          status: 'In Progress',
          started_at: new Date().toISOString(),
          start_lat: location.lat,
          start_lng: location.lng
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(
          'Failed to start route',
          error.code,
          error
        );
      }

      return transformRouteFromDB(data);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('Error inesperado al iniciar ruta', 'UNKNOWN', error);
    }
  },

  /**
   * Update delivery proof
   */
  async updateProof(id: string, deliveryProof: DeliveryProof): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('routes')
        .update({
          delivery_proof: deliveryProof,
          status: 'Completed'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(
          'Failed to update delivery proof',
          error.code,
          error
        );
      }

      return transformRouteFromDB(data);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('Error inesperado al actualizar comprobante de entrega', 'UNKNOWN', error);
    }
  },

  /**
   * Delete route
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', id);

      if (error) {
        throw new DatabaseError(
          'Failed to delete route',
          error.code,
          error
        );
      }

      return true;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('Error inesperado al eliminar ruta', 'UNKNOWN', error);
    }
  }
};

export const analyticsService = {
  // Obtener métricas del dashboard
  async getDashboardMetrics() {
    const { data, error } = await supabase.rpc('get_dashboard_metrics');

    if (error) throw error;
    return data;
  },

  // Rentabilidad por conductor
  async getDriverProfitability(startDate?: string, endDate?: string) {
    const { data, error } = await supabase.rpc('get_driver_profitability', {
      start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: endDate || new Date().toISOString(),
    });

    if (error) throw error;
    return data;
  },

  // Rutas más rentables
  async getMostProfitableRoutes(limit: number = 10) {
    const { data, error } = await supabase.rpc('get_most_profitable_routes', {
      route_limit: limit,
    });

    if (error) throw error;
    return data;
  },
};

// --- Financial Reports ---

interface FinancialReportDB {
  id?: string;
  top_driver: string;
  most_profitable_route: string;
  cost_saving_opportunity: string;
  efficiency_trend: string;
  net_profit_margin: string;
  created_at?: string;
}

function transformReportToDB(report: FinancialReport): FinancialReportDB {
  return {
    top_driver: report.topDriver,
    most_profitable_route: report.mostProfitableRoute,
    cost_saving_opportunity: report.costSavingOpportunity,
    efficiency_trend: report.efficiencyTrend,
    net_profit_margin: report.netProfitMargin
  };
}

function transformReportFromDB(report: FinancialReportDB): FinancialReport {
  return {
    topDriver: report.top_driver,
    mostProfitableRoute: report.most_profitable_route,
    costSavingOpportunity: report.cost_saving_opportunity,
    efficiencyTrend: report.efficiency_trend,
    netProfitMargin: report.net_profit_margin
  };
}

export const financialReportService = {
  async create(report: FinancialReport): Promise<FinancialReport> {
    try {
      const dbReport = transformReportToDB(report);
      const { data, error } = await supabase
        .from('financial_reports')
        .insert([dbReport])
        .select()
        .single();

      if (error) throw error;
      return transformReportFromDB(data);
    } catch (error) {
      console.error('Error creating financial report:', error);
      // Fallback for dev if table missing
      return report;
    }
  },

  async getLatest(): Promise<FinancialReport | null> {
    try {
      const { data, error } = await supabase
        .from('financial_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      return transformReportFromDB(data);
    } catch (error) {
      console.error('Error fetching latest report:', error);
      return null;
    }
  }
};

// ============================================
// TRANSACTIONS - Unified Financials
// ============================================

interface TransactionDB {
  id: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  date: string;
  description: string;
  status: 'Pending' | 'Paid' | 'Overdue';
  document_type?: string;
  document_number?: string;
  document_url?: string;
  related_id?: string;
}

function transformTransactionFromDB(t: any): Transaction {
  return {
    id: t.id,
    type: t.type,
    category: t.category,
    amount: t.amount,
    date: t.date,
    description: t.description,
    status: t.status,
    document: t.document_type ? {
      type: t.document_type as any,
      number: t.document_number,
      url: t.document_url
    } : undefined,
    relatedId: t.related_id
  };
}

function transformTransactionToDB(t: Omit<Transaction, 'id'>): Partial<TransactionDB> {
  return {
    type: t.type,
    category: t.category,
    amount: t.amount,
    date: t.date,
    description: t.description,
    status: t.status,
    document_type: t.document?.type,
    document_number: t.document?.number,
    document_url: t.document?.url,
    related_id: t.relatedId
  };
}

export const transactionService = {
  async getAll() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data?.map(transformTransactionFromDB) || [];
  },

  async create(transaction: Omit<Transaction, 'id'>) {
    const dbTx = transformTransactionToDB(transaction);
    const { data, error } = await supabase
      .from('transactions')
      .insert([dbTx])
      .select()
      .single();

    if (error) throw error;
    return transformTransactionFromDB(data);
  },

  async getBalance() {
    // Simple client-side calculation for now (or could be RPC)
    const txs = await this.getAll();
    const income = txs.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = txs.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, net: income - expenses };
  }
};

// Exportar todos los servicios
export default {
  vehicles: vehicleService,
  drivers: driverService,
  routes: routeService,
  gps: gpsService,
  maintenance: maintenanceService,
  compliance: complianceService,
  analytics: analyticsService,
  financials: financialReportService,
  transactions: transactionService,
};
