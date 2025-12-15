
export interface QuoteResult {
  estimatedPrice: string;
  vehicleType: string;
  timeEstimate: string;
  logisticsAdvice: string[];
  confidenceScore: number;
}

export interface VehicleLocation {
  lat: number;
  lng: number;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  status: 'Active' | 'Maintenance' | 'Idle';
  mileage: number;
  fuelLevel: number;
  nextService: string; // Date string
  location?: VehicleLocation; // Optional location for map display
  city?: string; // Ciudad del vehículo
  insuranceExpiry?: string; // Fecha de vencimiento del seguro
  documents?: {
    type: string;
    url: string;
    expiry?: string;
  }[];
}

export interface MapFilter {
  showActive: boolean;
  showMaintenance: boolean;
  showIdle: boolean;
}

export interface Driver {
  id: string;
  name: string;
  rut: string; // Chilean ID
  licenseType: string;
  licenseExpiry: string;
  status: 'Available' | 'On Route' | 'Off Duty';
  user_id?: string; // Link to Supabase Auth User
}

export interface MaintenancePrediction {
  healthScore: number;
  predictedFailure: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendedAction: string;
  estimatedCost: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  type: 'Preventive' | 'Corrective' | 'Emergency';
  description: string;
  cost: number;
  provider: string; // Taller o mecánico
  date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  guarantee?: boolean;
}

export interface FinancialReport {
  topDriver: string;
  mostProfitableRoute: string; // Corrected field name
  costSavingOpportunity: string;
  efficiencyTrend: string;
  netProfitMargin: string;
}

export interface Transaction {
  id: string;
  type: 'Income' | 'Expense';
  category: string; // e.g., 'Freight', 'Fuel', 'Maintenance', 'Salaries'
  amount: number;
  date: string;
  description: string;
  status: 'Pending' | 'Paid' | 'Overdue';
  document?: {
    type: 'Invoice' | 'Receipt' | 'Ticket';
    number: string;
    url?: string;
  };
  relatedId?: string; // ID of related Route or Maintenance
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  distance: string;
  estimatedPrice: string;
  vehicleType: string;
  driver?: string;
  vehicle?: string;
  timestamp: number;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export enum AppView {
  HOME = 'HOME',
  DASHBOARD = 'DASHBOARD',
  TRACKING = 'TRACKING',
  FLEET = 'FLEET',
  ROUTES = 'ROUTES',
  ROUTE_BUILDER = 'ROUTE_BUILDER',
  FINANCIALS = 'FINANCIALS',
  COMPLIANCE = 'COMPLIANCE',
  DRIVER_MOBILE = 'DRIVER_MOBILE'
}
