import React from 'react';
import { DollarSign, MapPin, Clock, TrendingUp } from 'lucide-react';
import type { FareEstimate, VehicleOption } from '@/types/vehicle-options';

interface FareEstimatorProps {
    estimate: FareEstimate;
    vehicle: VehicleOption;
    distance: number;
}

const FareEstimator: React.FC<FareEstimatorProps> = ({ estimate, vehicle, distance }) => {
    return (
        <div className="glass-card border border-white/10 rounded-2xl p-6 space-y-4 animate-slide-in-bottom">
            <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-brand-500" />
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Estimación de Tarifa
                </h3>
            </div>

            {/* Desglose de costos */}
            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Tarifa base
                    </span>
                    <span className="text-white font-semibold">
                        ${estimate.basePrice.toLocaleString()} CLP
                    </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Distancia ({distance} km)
                    </span>
                    <span className="text-white font-semibold">
                        ${estimate.distancePrice.toLocaleString()} CLP
                    </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Tiempo ({estimate.duration})
                    </span>
                    <span className="text-white font-semibold">
                        ${estimate.timePrice.toLocaleString()} CLP
                    </span>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Total */}
            <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-white">Total Estimado</span>
                <div className="text-right">
                    <span className="text-3xl font-bold text-brand-400">
                        ${estimate.total.toLocaleString()}
                    </span>
                    <span className="text-sm text-slate-400 ml-1">CLP</span>
                </div>
            </div>

            {/* Info adicional */}
            <div className="pt-4 border-t border-white/10">
                <div className="flex items-start gap-2 text-xs text-slate-500">
                    <span className="text-brand-400">ℹ️</span>
                    <p>
                        Duración estimada: <span className="text-white font-semibold">{estimate.duration}</span>
                        {' · '}
                        Vehículo: <span className="text-white font-semibold">{vehicle.name}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FareEstimator;
