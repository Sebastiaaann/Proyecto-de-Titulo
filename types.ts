
export interface QuoteResult {
  estimatedPrice: string;
  vehicleType: string;
  timeEstimate: string;
  logisticsAdvice: string[];
  confidenceScore: number;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  status: 'Active' | 'Maintenance' | 'Idle';
  mileage: number;
  fuelLevel: number;
  nextService: string; // Date string
}

export interface Driver {
  id: string;
  name: string;
  rut: string; // Chilean ID
  licenseType: string;
  licenseExpiry: string;
  status: 'Available' | 'On Route' | 'Off Duty';
}

export interface MaintenancePrediction {
  healthScore: number;
  predictedFailure: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendedAction: string;
  estimatedCost: string;
}

export interface FinancialReport {
  topDriver: string;
  mostProfitableRoute: string;
  costSavingOpportunity: string;
  efficiencyTrend: string;
  netProfitMargin: string;
}

export enum AppView {
  HOME = 'HOME',
  DASHBOARD = 'DASHBOARD',
  TRACKING = 'TRACKING',
  FLEET = 'FLEET',
  ROUTES = 'ROUTES',
  ROUTE_BUILDER = 'ROUTE_BUILDER',
  FINANCIALS = 'FINANCIALS',
  COMPLIANCE = 'COMPLIANCE'
}
