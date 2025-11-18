
import React from 'react';
import { ShieldCheck, FileText, AlertCircle, CheckCircle2, Clock, Download, Award, FileBarChart } from 'lucide-react';

const Compliance: React.FC = () => {
  // Mock Data
  const laborData = [
    { id: 1, name: 'Carlos Mendoza', hoursDriven: 165, maxHours: 180, status: 'OK' },
    { id: 2, name: 'Ana Silva', hoursDriven: 178, maxHours: 180, status: 'Warning' },
    { id: 3, name: 'Jorge O\'Ryan', hoursDriven: 140, maxHours: 180, status: 'OK' },
    { id: 4, name: 'Luis Toro', hoursDriven: 182, maxHours: 180, status: 'Critical' },
  ];

  const docData = [
    { id: 'V-001', plate: 'HG-LF-99', revTecnica: '2024-12-15', perCirculacion: '2025-03-31', status: 'Valid' },
    { id: 'V-002', plate: 'JS-KK-22', revTecnica: '2024-10-01', perCirculacion: '2025-03-31', status: 'Expiring Soon' },
    { id: 'V-003', plate: 'LK-MM-11', revTecnica: '2023-09-15', perCirculacion: '2024-03-31', status: 'Expired' },
  ];

  const isoSteps = [
    { step: 'Auditoría Interna', completed: true },
    { step: 'Gestión de No Conformidades', completed: true },
    { step: 'Revisión por Dirección', completed: false },
    { step: 'Certificación Externa', completed: false },
  ];

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-10 bg-dark-950 text-slate-200">
      <div className="max-w-7xl mx-auto animate-fade-in">
        
        <div className="mb-10">
           <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
             <ShieldCheck className="w-8 h-8 text-brand-500" />
             Cumplimiento y Legal
           </h2>
           <p className="text-slate-500">Gestión centralizada de normativa laboral, tributaria y certificaciones.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Column 1: Labor Compliance */}
            <div className="lg:col-span-1 space-y-6">
                <div className="glass-panel border border-white/5 rounded-2xl p-6 animate-slide-up">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-accent-500" />
                            Control Jornada
                        </h3>
                        <span className="text-[10px] uppercase bg-accent-500/10 text-accent-400 px-2 py-1 rounded border border-accent-500/20">Art. 25 Bis</span>
                    </div>
                    <div className="space-y-5">
                        {laborData.map(driver => (
                            <div key={driver.id}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-300">{driver.name}</span>
                                    <span className={`font-mono ${driver.hoursDriven > driver.maxHours ? 'text-red-400' : 'text-slate-400'}`}>
                                        {driver.hoursDriven}/{driver.maxHours} hrs
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${
                                            driver.status === 'Critical' ? 'bg-red-500' : 
                                            driver.status === 'Warning' ? 'bg-orange-500' : 'bg-brand-500'
                                        }`}
                                        style={{ width: `${(driver.hoursDriven / driver.maxHours) * 100}%` }}
                                    ></div>
                                </div>
                                {driver.status === 'Critical' && (
                                    <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Exceso de jornada detectado
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel border border-white/5 rounded-2xl p-6 bg-gradient-to-br from-slate-900 to-slate-950 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <FileBarChart className="w-5 h-5 text-blue-400" />
                            Auditoría Tributaria
                        </h3>
                        <span className="text-xs text-slate-500">SII Ready</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-6">Generación automática de declaraciones juradas y reportes de gasto de combustible.</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm text-slate-300 transition-all">
                            <FileText className="w-4 h-4" /> DJ 1887
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm text-slate-300 transition-all">
                            <FileText className="w-4 h-4" /> F29 Mensual
                        </button>
                    </div>
                    <button className="w-full mt-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Descargar Pack Auditoría
                    </button>
                </div>
            </div>

            {/* Column 2 & 3: Documents & ISO */}
            <div className="lg:col-span-2 space-y-6">
                {/* Document Management */}
                <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-brand-500" /> Certificados Digitales
                        </h3>
                        <button className="text-xs bg-white text-black px-3 py-1.5 rounded-lg font-bold hover:bg-slate-200 transition-colors">
                            Renovar Lote
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-xs uppercase text-slate-400">
                                <tr>
                                    <th className="p-4">Vehículo</th>
                                    <th className="p-4">Revisión Técnica</th>
                                    <th className="p-4">Permiso Circulación</th>
                                    <th className="p-4 text-right">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {docData.map(doc => (
                                    <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <p className="text-white font-medium">{doc.plate}</p>
                                            <p className="text-xs text-slate-500">ID: {doc.id}</p>
                                        </td>
                                        <td className="p-4 font-mono text-sm text-slate-300">{doc.revTecnica}</td>
                                        <td className="p-4 font-mono text-sm text-slate-300">{doc.perCirculacion}</td>
                                        <td className="p-4 text-right">
                                            <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                                doc.status === 'Valid' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                doc.status === 'Expired' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                                {doc.status === 'Valid' ? 'Vigente' : doc.status === 'Expired' ? 'Vencido' : 'Por Vencer'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ISO Certification Tracker */}
                <div className="glass-panel border border-white/5 rounded-2xl p-8 relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Award className="w-6 h-6 text-yellow-500" /> 
                                Gestión de Calidad ISO
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Seguimiento de implementación ISO 9001:2015</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="block text-2xl font-bold text-white">50%</span>
                                <span className="text-xs text-slate-500 uppercase tracking-wider">Progreso Global</span>
                            </div>
                            <div className="w-16 h-16 relative">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path className="text-brand-500" strokeDasharray="50, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 relative z-10">
                        {isoSteps.map((step, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border transition-all ${
                                step.completed 
                                ? 'bg-brand-900/20 border-brand-500/30' 
                                : 'bg-white/5 border-white/5 opacity-60'
                            }`}>
                                <div className="mb-3">
                                    {step.completed ? (
                                        <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-black">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 border border-slate-700">
                                            <span className="text-xs font-bold">{idx + 1}</span>
                                        </div>
                                    )}
                                </div>
                                <p className={`text-sm font-medium ${step.completed ? 'text-white' : 'text-slate-400'}`}>
                                    {step.step}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Compliance;
