import React, { useState } from 'react';
import { generateSmartQuote } from '@services/geminiService';
import { QuoteResult } from '@/types';
import { Send, Package, Clock, DollarSign, AlertCircle, CheckCircle2, Loader2, Truck } from 'lucide-react';
import { showToast } from '@components/common/Toast';
import { ERROR_MESSAGES } from '@utils/errorMessages';

const AIQuote: React.FC = () => {
  const [description, setDescription] = useState('');
  const [distance, setDistance] = useState('');
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    if (!description || !distance) {
      showToast.warning(ERROR_MESSAGES.FORM_INCOMPLETE);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await generateSmartQuote(description, distance);
      setResult(data);
      showToast.success("Optimización completada");
    } catch (e) {
      console.error(e);
      showToast.error(ERROR_MESSAGES.SAVE_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center animate-slide-up">
          <h2 className="text-brand-500 font-semibold tracking-wide uppercase text-sm mb-2">AI Automation</h2>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Instant Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-500">Quoting</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Describe your cargo and route. Our Gemini-powered engine analyzes volume, weight, and complexity to generate an instant logistics plan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* Input Section */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-2xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cargo Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                  placeholder="e.g., 2 bedroom apartment, heavy oak furniture, 20 boxes, and a piano."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Route Distance / Locations</label>
                <input
                  type="text"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="e.g., New York to Boston, approx 215 miles"
                />
              </div>

              <button
                onClick={handleOptimize}
                disabled={loading || !description || !distance}
                className="w-full group relative flex items-center justify-center gap-2 bg-white text-slate-950 hover:bg-brand-50 px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span>Generate Optimization</span>
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-400/20 to-transparent w-full h-full translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </div>
          </div>

          {/* Result Section */}
          <div className="relative">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl p-8">
                <Package className="w-16 h-16 mb-4 opacity-20" />
                <p>AI Analysis will appear here</p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center bg-slate-900/30 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 border-t-4 border-brand-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-b-4 border-accent-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <p className="mt-6 text-brand-400 font-mono text-sm animate-pulse">OPTIMIZING ROUTE & CARGO...</p>
              </div>
            )}

            {result && (
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl animate-slide-up flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="text-green-500 w-6 h-6" />
                      Optimization Complete
                    </h3>
                    <span className="px-3 py-1 bg-brand-900/50 text-brand-300 text-xs rounded-full border border-brand-800 font-mono">
                      CONFIDENCE: {result.confidenceScore}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Estimated Cost</p>
                      <p className="text-2xl font-bold text-white flex items-center gap-1">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        {result.estimatedPrice}
                      </p>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Est. Time</p>
                      <p className="text-2xl font-bold text-white flex items-center gap-1">
                        <Clock className="w-5 h-5 text-brand-400" />
                        {result.timeEstimate}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Recommended Vehicle</p>
                    <div className="bg-brand-600 text-white p-3 rounded-lg font-medium flex items-center justify-between shadow-lg shadow-brand-900/50">
                      <span>{result.vehicleType}</span>
                      <Truck className="w-5 h-5 opacity-80" />
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Smart Logistics Advice</p>
                    <ul className="space-y-3">
                      {result.logisticsAdvice.map((advice, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                          <AlertCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                          {advice}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700 text-center">
                  <button className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors">
                    Book this fleet now &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIQuote;