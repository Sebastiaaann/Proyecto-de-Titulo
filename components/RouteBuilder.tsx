import React, { useState } from 'react';
import { generateSmartQuote } from '../services/geminiService';
import { MapPin, Truck, DollarSign, Save, Calculator, Zap, AlertCircle, CheckCircle2, Loader2, PieChart, Fuel } from 'lucide-react';

interface RouteFormData {
  origin: string;
  destination: string;
  distance: number;
  cargoDescription: string;
  cargoWeight: number;
  driver: string;
  vehicle: string;
  fuelCostPerKm: number;
  tollCosts: number;
  driverWage: number;
  insuranceCost: number;
  maintenanceCost: number;
  clientQuote: number;
}

interface RouteAnalysis {
  totalCosts: number;
  revenue: number;
  profit: number;
  profitMargin: number;
  breakdownCosts: {
    fuel: number;
    tolls: number;
    driver: number;
    insurance: number;
    maintenance: number;
  };
  aiRecommendations: string[];
  riskScore: number;
}

const RouteBuilder: React.FC = () => {
  const [formData, setFormData] = useState<RouteFormData>({
    origin: '',
    destination: '',
    distance: 0,
    cargoDescription: '',
    cargoWeight: 0,
    driver: '',
    vehicle: '',
    fuelCostPerKm: 450,
    tollCosts: 0,
    driverWage: 0,
    insuranceCost: 0,
    maintenanceCost: 0,
    clientQuote: 0,
  });

  const [analysis, setAnalysis] = useState<RouteAnalysis | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);

  const availableDrivers = ['Carlos Mendoza', 'Ana Silva', 'Jorge O\'Ryan', 'Luis Toro'];
  const availableVehicles = ['HG-LF-99 (Volvo FH16)', 'JS-KK-22 (Scania R450)', 'LK-MM-11 (Mercedes Actros)'];

  const handleInputChange = (field: keyof RouteFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const calculateRoute = async () => {
    if (!formData.origin || !formData.destination || formData.distance === 0 || formData.clientQuote === 0) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    
    const fuelCost = formData.distance * formData.fuelCostPerKm;
    const totalCosts = fuelCost + formData.tollCosts + formData.driverWage + formData.insuranceCost + formData.maintenanceCost;
    const revenue = formData.clientQuote;
    const profit = revenue - totalCosts;
    const profitMargin = ((profit / revenue) * 100).toFixed(2);

    const newAnalysis: RouteAnalysis = {
      totalCosts,
      revenue,
      profit,
      profitMargin: parseFloat(profitMargin),
      breakdownCosts: {
        fuel: fuelCost,
        tolls: formData.tollCosts,
        driver: formData.driverWage,
        insurance: formData.insuranceCost,
        maintenance: formData.maintenanceCost,
      },
      aiRecommendations: [],
      riskScore: 0,
    };

    setAnalysis(newAnalysis);

    try {
      const aiQuote = await generateSmartQuote(
        formData.cargoDescription,
        `${formData.origin} a ${formData.destination}, ${formData.distance}km`
      );
      
      setAiInsight(`Gemini AI sugiere: ${aiQuote.logisticsAdvice.join(' | ')}`);
      newAnalysis.aiRecommendations = aiQuote.logisticsAdvice;
      newAnalysis.riskScore = 100 - aiQuote.confidenceScore;
      setAnalysis({...newAnalysis});
    } catch (error) {
      console.error('AI Analysis failed', error);
    }

    setLoading(false);
  };

  const saveRoute = () => {
    if (!analysis) return;
    
    const newRoute = {
      id: Date.now(),
      ...formData,
      ...analysis,
      createdAt: new Date().toISOString(),
    };
    
    setSavedRoutes([newRoute, ...savedRoutes]);
    alert('✅ Ruta guardada exitosamente');
  };

  const resetForm = () => {
    setFormData({
      origin: '',
      destination: '',
      distance: 0,
      cargoDescription: '',
      cargoWeight: 0,
      driver: '',
      vehicle: '',
      fuelCostPerKm: 450,
      tollCosts: 0,
      driverWage: 0,
      insuranceCost: 0,
      maintenanceCost: 0,
      clientQuote: 0,
    });
    setAnalysis(null);
    setAiInsight('');
  };

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-10 bg-dark-950 text-slate-200">
      <div className="max-w-7xl mx-auto animate-fade-in">
        
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-brand-500" />
            Constructor de Rutas con Análisis Financiero
          </h2>
          <p className="text-slate-400">Crea rutas optimizadas y analiza rentabilidad en tiempo real con Gemini AI.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            <div className="glass-panel border border-white/5 rounded-2xl p-6 animate-slide-up">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-500" /> Detalles de Ruta
              </h3>
              
              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Origen *" value={formData.origin} onChange={(e) => handleInputChange('origin', e.target.value)} placeholder="Santiago Centro" />
                <Input label="Destino *" value={formData.destination} onChange={(e) => handleInputChange('destination', e.target.value)} placeholder="Valparaíso Puerto" />
                <Input label="Distancia (km) *" type="number" value={formData.distance} onChange={(e) => handleInputChange('distance', parseFloat(e.target.value) || 0)} placeholder="120" />
                <Input label="Peso Carga (ton)" type="number" value={formData.cargoWeight} onChange={(e) => handleInputChange('cargoWeight', parseFloat(e.target.value) || 0)} placeholder="8.5" />
              </div>
              
              <div className="mt-5">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Descripción de Carga</label>
                <textarea 
                  value={formData.cargoDescription}
                  onChange={(e) => handleInputChange('cargoDescription', e.target.value)}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-brand-500 outline-none resize-none h-24"
                  placeholder="Ej: 12 pallets de electrodomésticos, frágil, requiere refrigeración"
                />
              </div>
            </div>

            <div className="glass-panel border border-white/5 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-accent-500" /> Asignación de Recursos
              </h3>
              
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Conductor</label>
                  <select 
                    value={formData.driver}
                    onChange={(e) => handleInputChange('driver', e.target.value)}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="">Seleccionar...</option>
                    {availableDrivers.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Vehículo</label>
                  <select 
                    value={formData.vehicle}
                    onChange={(e) => handleInputChange('vehicle', e.target.value)}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="">Seleccionar...</option>
                    {availableVehicles.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="glass-panel border border-white/5 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" /> Estructura de Costos
              </h3>
              
              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Costo Combustible (CLP/km)" type="number" value={formData.fuelCostPerKm} onChange={(e) => handleInputChange('fuelCostPerKm', parseFloat(e.target.value) || 0)} />
                <Input label="Peajes Totales (CLP)" type="number" value={formData.tollCosts} onChange={(e) => handleInputChange('tollCosts', parseFloat(e.target.value) || 0)} />
                <Input label="Salario Conductor (CLP)" type="number" value={formData.driverWage} onChange={(e) => handleInputChange('driverWage', parseFloat(e.target.value) || 0)} />
                <Input label="Seguro (CLP)" type="number" value={formData.insuranceCost} onChange={(e) => handleInputChange('insuranceCost', parseFloat(e.target.value) || 0)} />
                <Input label="Mantención (CLP)" type="number" value={formData.maintenanceCost} onChange={(e) => handleInputChange('maintenanceCost', parseFloat(e.target.value) || 0)} />
                <Input label="Cotización Cliente (CLP) *" type="number" value={formData.clientQuote} onChange={(e) => handleInputChange('clientQuote', parseFloat(e.target.value) || 0)} />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={calculateRoute}
                disabled={loading}
                className="flex-1 bg-white text-black font-bold py-4 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
                {loading ? 'Analizando...' : 'Calcular Rentabilidad'}
              </button>
              
              {analysis && (
                <button 
                  onClick={saveRoute}
                  className="px-6 bg-brand-600 text-white font-bold py-4 rounded-xl hover:bg-brand-500 transition-all flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> Guardar Ruta
                </button>
              )}
              
              <button 
                onClick={resetForm}
                className="px-6 bg-white/5 text-slate-400 font-medium py-4 rounded-xl hover:bg-white/10 transition-all border border-white/10"
              >
                Limpiar
              </button>
            </div>

          </div>

          <div className="lg:col-span-1 space-y-6">
            
            {!analysis && !loading && (
              <div className="glass-panel border border-white/5 rounded-2xl p-8 text-center h-[400px] flex flex-col items-center justify-center">
                <PieChart className="w-16 h-16 text-slate-700 mb-4" />
                <p className="text-slate-500">Completa el formulario y presiona "Calcular Rentabilidad" para ver el análisis financiero.</p>
              </div>
            )}

            {loading && (
              <div className="glass-panel border border-white/5 rounded-2xl p-8 h-[400px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-brand-400 font-mono text-sm animate-pulse">PROCESANDO CON GEMINI AI...</p>
              </div>
            )}

            {analysis && (
              <>
                <div className="glass-panel border border-white/5 rounded-2xl p-6 animate-slide-up relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${analysis.profit > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Resultado Financiero</h3>
                  
                  <div className="mb-6">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Utilidad Neta</span>
                    <div className={`text-4xl font-bold mt-1 ${analysis.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${analysis.profit.toLocaleString()} CLP
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <p className="text-xs text-slate-500 uppercase">Ingresos</p>
                      <p className="text-lg font-bold text-white">${analysis.revenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <p className="text-xs text-slate-500 uppercase">Costos</p>
                      <p className="text-lg font-bold text-white">${analysis.totalCosts.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-brand-900/20 rounded-lg border border-brand-500/30">
                    <span className="text-sm font-bold text-brand-400">Margen de Utilidad</span>
                    <span className={`text-2xl font-bold ${analysis.profitMargin > 20 ? 'text-green-400' : analysis.profitMargin > 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {analysis.profitMargin}%
                    </span>
                  </div>
                </div>

                <div className="glass-panel border border-white/5 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Desglose de Costos</h3>
                  
                  <div className="space-y-3">
                    {Object.entries(analysis.breakdownCosts).map(([key, value]) => {
                      const percentage = ((value / analysis.totalCosts) * 100).toFixed(1);
                      const icons: any = {
                        fuel: <Fuel className="w-4 h-4" />,
                        tolls: <MapPin className="w-4 h-4" />,
                        driver: <Truck className="w-4 h-4" />,
                        insurance: <AlertCircle className="w-4 h-4" />,
                        maintenance: <CheckCircle2 className="w-4 h-4" />,
                      };
                      const labels: any = {
                        fuel: 'Combustible',
                        tolls: 'Peajes',
                        driver: 'Conductor',
                        insurance: 'Seguro',
                        maintenance: 'Mantención',
                      };
                      
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="flex items-center gap-2 text-slate-300">
                              {icons[key]}
                              {labels[key]}
                            </span>
                            <span className="font-mono text-white">${value.toLocaleString()}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {analysis.aiRecommendations.length > 0 && (
                  <div className="glass-panel border border-accent-500/30 rounded-2xl p-6 animate-slide-up bg-gradient-to-br from-accent-900/20 to-dark-900" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-sm font-bold text-accent-400 uppercase mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Recomendaciones Gemini AI
                    </h3>
                    <ul className="space-y-2">
                      {analysis.aiRecommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

          </div>
        </div>

        {savedRoutes.length > 0 && (
          <div className="mt-12 glass-panel border border-white/5 rounded-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Rutas Guardadas ({savedRoutes.length})</h3>
              <span className="text-xs text-slate-500 font-mono">ULTIMAS 10 RUTAS</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="p-4">Ruta</th>
                    <th className="p-4">Conductor</th>
                    <th className="p-4 text-right">Ingreso</th>
                    <th className="p-4 text-right">Costo</th>
                    <th className="p-4 text-right">Utilidad</th>
                    <th className="p-4 text-right">Margen</th>
                    <th className="p-4">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {savedRoutes.slice(0, 10).map((route) => (
                    <tr key={route.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <p className="text-white font-medium">{route.origin} → {route.destination}</p>
                        <p className="text-xs text-slate-500">{route.distance} km</p>
                      </td>
                      <td className="p-4 text-slate-400">{route.driver}</td>
                      <td className="p-4 text-right font-mono text-slate-300">${route.revenue.toLocaleString()}</td>
                      <td className="p-4 text-right font-mono text-slate-300">${route.totalCosts.toLocaleString()}</td>
                      <td className="p-4 text-right font-mono">
                        <span className={route.profit > 0 ? 'text-green-400' : 'text-red-400'}>
                          ${route.profit.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`font-bold ${
                          route.profitMargin > 20 ? 'text-green-400' : 
                          route.profitMargin > 10 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {route.profitMargin}%
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 text-sm">
                        {new Date(route.createdAt).toLocaleDateString('es-CL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const Input = ({ label, error, ...props }: any) => (
  <div>
    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
    <input 
      {...props}
      className={`w-full bg-dark-900 border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-colors placeholder-slate-600 ${error ? 'border-red-500/50' : 'border-white/10'}`}
    />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

export default RouteBuilder;
