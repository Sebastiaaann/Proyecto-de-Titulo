import React from 'react';
import { Check, Clock, Package } from 'lucide-react';
import { VEHICLE_OPTIONS, calculateFareEstimate, type VehicleOption } from '@/types/vehicle-options';

interface VehicleSelectorProps {
    distance: number;
    selectedVehicle: VehicleOption | null;
    onSelectVehicle: (vehicle: VehicleOption) => void;
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({
    distance,
    selectedVehicle,
    onSelectVehicle,
}) => {
    if (distance === 0) {
        return (
            <div className="text-center py-8 text-slate-400">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Ingresa origen y destino para ver opciones de vehículos</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Selecciona tipo de vehículo
            </h3>

            {VEHICLE_OPTIONS.map((option) => {
                const estimate = calculateFareEstimate(distance, option);
                const isSelected = selectedVehicle?.id === option.id;

                return (
                    <button
                        key={option.id}
                        onClick={() => onSelectVehicle(option)}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${isSelected
                                ? 'border-brand-500 bg-brand-500/10 shadow-glow-brand'
                                : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center justify-between gap-4">
                            {/* Left: Icon and Info */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-4xl flex-shrink-0">{option.icon}</span>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-white text-base">{option.name}</h4>
                                        {isSelected && (
                                            <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-slate-400 mb-2">{option.description}</p>

                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Package className="w-3 h-3" />
                                            {option.capacity}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {option.estimatedTime}
                                        </span>
                                    </div>

                                    {/* Features */}
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {option.features.map((feature, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-0.5 bg-white/5 rounded-full text-[10px] text-slate-400 border border-white/10"
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Price */}
                            <div className="text-right flex-shrink-0">
                                <p className="text-2xl font-bold text-white">
                                    ${estimate.total.toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">{estimate.duration}</p>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default VehicleSelector;
