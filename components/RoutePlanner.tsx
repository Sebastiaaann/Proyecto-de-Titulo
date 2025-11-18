import React, { useState } from 'react';
import { generateSmartQuote } from '../services/geminiService';
import { QuoteResult } from '../types';
import { Send, Package, Clock, DollarSign, AlertCircle, CheckCircle2, Loader2, Truck, Map } from 'lucide-react';

const RoutePlanner: React.FC = () => {
  const [description, setDescription] = useState('');
  const [distance, setDistance] = useState('');
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    if (!description || !distance) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const data = await generateSmartQuote(description, distance);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center relative overflow-hidden bg-dark-950">
      
      {/* Header */}
      <div className="w-full max-w-6xl mb-8 animate-fade-in">
         <h2 className="text-3xl font-bold text-white">Optimizador de Rutas</h2>
         <p className="text-slate-500">Cálculo de rutas impulsado por IA, estimación de costos y planificación de carga.</p>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-2 space-y-6 animate-slide-up">
           <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Manifiesto de Carga</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-32 bg-dark-900 border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                    placeholder="ej: 12 Pallets de Electrónicos, aprox 4.5 toneladas. Frágil."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detalles de Ruta</label>
                  <div className="relative">
                    <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                        type="text"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        className="w-full bg-dark-900 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                        placeholder="Origen -> Destino (ej: Santiago a Puerto Montt, 1032km)"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleOptimize}
                  disabled={loading || !description || !distance}
                  className="w-full group relative flex items-center justify-center gap-2 bg-white text-black hover:bg-slate-200 px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Calculando Ruta...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Generar Plan</span>
                    </>
                  )}
                </button>
              </div>
           </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-3 relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 border border-dashed border-white/10 rounded-2xl p-8 bg-white/[0.02]">
                <Map className="w-16 h-16 mb-4 opacity-20" />
                <p>Ingresa la carga y detalles de ruta para comenzar el análisis.</p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center bg-white/[0.02] rounded-2xl border border-white/5 backdrop-blur-sm min-h-[400px]">
                 <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                 <p className="mt-4 text-brand-400 font-mono text-sm animate-pulse">ANALIZANDO TOPOLOGÍA Y COSTOS...</p>
              </div>
            )}

            {result && (
              <div className="glass-panel rounded-2xl p-8 h-full border border-brand-500/30 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                    <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        Optimización Completa
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">Generado por modelo Gemini Pro</p>
                    </div>
                    <div className="text-right">
                         <span className="block text-xs text-slate-500 uppercase font-bold">Confianza</span>
                         <span className="text-xl font-mono text-brand-400">{result.confidenceScore}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-dark-900/50 p-5 rounded-xl border border-white/5">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Costo Operativo Est.</p>
                      <p className="text-3xl font-bold text-white flex items-center gap-1">
                        {result.estimatedPrice}
                      </p>
                    </div>
                    <div className="bg-dark-900/50 p-5 rounded-xl border border-white/5">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Tiempo Tránsito</p>
                      <p className="text-3xl font-bold text-white flex items-center gap-1">
                        {result.timeEstimate}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">Activo Recomendado</p>
                        <div className="bg-gradient-to-r from-brand-900/50 to-dark-800 text-white p-4 rounded-lg font-medium flex items-center justify-between border border-brand-500/20">
                        <span className="font-mono text-lg">{result.vehicleType}</span>
                        <Truck className="w-5 h-5 text-brand-400" />
                        </div>
                    </div>

                    <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">Consejo Estratégico IA</p>
                        <ul className="space-y-3">
                        {result.logisticsAdvice.map((advice, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5">
                            <CheckCircle2 className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                            {advice}
                            </li>
                        ))}
                        </ul>
                    </div>
                  </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;