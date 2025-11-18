
import React, { useState, useEffect } from 'react';
import { Driver, Vehicle, MaintenancePrediction } from '../types';
import { predictMaintenance } from '../services/geminiService';
import { Search, Plus, MoreHorizontal, User, Truck, FileText, AlertTriangle, X, Save, Trash2, Edit2, CheckCircle, Zap, Activity, Thermometer } from 'lucide-react';

// Helper: Chilean RUT Formatter
const formatRut = (rut: string) => {
  const clean = rut.replace(/[^0-9kK]/g, '');
  if (clean.length <= 1) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();
  return `${body}-${dv}`;
};

// Helper: Chilean RUT Validator (Modulo 11)
const validateChileanRut = (rut: string): string | null => {
  if (!rut) return "RUT es requerido";
  const clean = rut.replace(/[^0-9kK]/g, '');
  if (clean.length < 7) return "RUT es muy corto"; 
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();
  if (!/^\d+$/.test(body)) return "Formato de RUT inválido";
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const mod = 11 - (sum % 11);
  const expectedDv = mod === 11 ? '0' : mod === 10 ? 'K' : mod.toString();
  if (dv !== expectedDv) return "Dígito Verificador (DV) inválido";
  return null;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const FleetManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'drivers'>('vehicles');
  const [searchTerm, setSearchTerm] = useState('');

  // --- STATE MANAGEMENT ---
  const [drivers, setDrivers] = useState<Driver[]>([
    { id: "D-1", name: "Carlos Mendoza", rut: "12345678-5", licenseType: "A5", licenseExpiry: "2025-03-15", status: "On Route" },
    { id: "D-2", name: "Ana Silva", rut: "15432198-K", licenseType: "A4", licenseExpiry: "2024-11-20", status: "Available" },
    { id: "D-3", name: "Jorge O'Ryan", rut: "9876543-2", licenseType: "A5", licenseExpiry: "2023-12-01", status: "Off Duty" },
  ]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: "V-001", plate: "HG-LF-99", model: "Volvo FH16", status: "Active", mileage: 120500, fuelLevel: 75, nextService: "2024-11-15" },
    { id: "V-002", plate: "JS-KK-22", model: "Scania R450", status: "Maintenance", mileage: 240100, fuelLevel: 10, nextService: "2024-10-28" },
    { id: "V-003", plate: "LK-MM-11", model: "Mercedes Actros", status: "Active", mileage: 85000, fuelLevel: 92, nextService: "2024-12-01" },
  ]);

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  // --- PREDICTIVE MAINT STATE ---
  const [predictiveData, setPredictiveData] = useState<MaintenancePrediction | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [selectedVehicleModel, setSelectedVehicleModel] = useState("");

  // --- ACTIONS ---

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData(activeTab === 'vehicles' 
      ? { plate: '', model: '', status: 'Idle', mileage: 0, fuelLevel: 100, nextService: '' }
      : { name: '', rut: '', licenseType: 'A4', licenseExpiry: '', status: 'Available' }
    );
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setModalMode('edit');
    setEditingId(item.id);
    setFormData({ ...item });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este elemento?')) {
      if (activeTab === 'vehicles') {
        setVehicles(prev => prev.filter(v => v.id !== id));
      } else {
        setDrivers(prev => prev.filter(d => d.id !== id));
      }
    }
  };

  const handleSave = () => {
    const newErrors: any = {};
    if (activeTab === 'vehicles') {
      if (!formData.plate) newErrors.plate = 'Patente es requerida';
      if (!formData.model) newErrors.model = 'Modelo es requerido';
    } else {
      if (!formData.name) newErrors.name = 'Nombre es requerido';
      const rutError = validateChileanRut(formData.rut);
      if (rutError) newErrors.rut = rutError;
      if (!formData.licenseExpiry) newErrors.licenseExpiry = 'Fecha es requerida';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (modalMode === 'create') {
      const newItem = { ...formData, id: generateId() };
      if (activeTab === 'vehicles') setVehicles([...vehicles, newItem]);
      else setDrivers([...drivers, newItem]);
    } else {
      if (activeTab === 'vehicles') {
        setVehicles(vehicles.map(v => v.id === editingId ? { ...formData, id: editingId } : v));
      } else {
        setDrivers(drivers.map(d => d.id === editingId ? { ...formData, id: editingId } : d));
      }
    }
    setIsModalOpen(false);
  };

  const runPrediction = async (vehicle: Vehicle) => {
    setSelectedVehicleModel(vehicle.model);
    setIsPredicting(true);
    setShowPredictionModal(true);
    setPredictiveData(null);
    
    const data = await predictMaintenance(vehicle);
    setPredictiveData(data);
    setIsPredicting(false);
  };

  // --- FILTERING ---
  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.rut.includes(searchTerm)
  );

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-dark-950 text-slate-200 relative">
      <div className="max-w-7xl mx-auto animate-fade-in pb-20">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Gestión del Equipo</h2>
            <p className="text-slate-500 text-sm">Administra activos, personal y documentación de cumplimiento.</p>
          </div>
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button 
                onClick={() => setActiveTab('vehicles')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'vehicles' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                Vehículos
            </button>
            <button 
                onClick={() => setActiveTab('drivers')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'drivers' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                Conductores
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`Buscar ${activeTab === 'vehicles' ? 'vehículo' : 'conductor'}...`} 
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                />
            </div>
            <button 
              onClick={handleOpenCreate}
              className="bg-white text-black px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
                <Plus className="w-4 h-4" /> Agregar {activeTab === 'vehicles' ? 'Vehículo' : 'Conductor'}
            </button>
        </div>

        <div className="glass-panel border border-white/5 rounded-xl overflow-hidden min-h-[400px] animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="overflow-x-auto">
                {activeTab === 'drivers' ? (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-xs uppercase text-slate-400 font-semibold tracking-wider">
                                <th className="p-4">Nombre / RUT</th>
                                <th className="p-4">Licencia</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4">Vencimiento</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredDrivers.map((driver) => (
                                <tr key={driver.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{driver.name}</p>
                                                <p className="text-slate-500 text-xs">{driver.rut}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-slate-800 border border-slate-700 text-white text-xs px-2 py-1 rounded">{driver.licenseType}</span>
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge status={driver.status} />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-300 text-sm">{driver.licenseExpiry}</span>
                                            {new Date(driver.licenseExpiry) < new Date() && (
                                                <span title="Vencido/Por vencer" className="text-red-500 animate-pulse">
                                                    <AlertTriangle className="w-4 h-4" />
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => handleOpenEdit(driver)} className="p-2 hover:bg-brand-500/20 rounded-lg text-slate-400 hover:text-brand-400 transition-colors">
                                              <Edit2 className="w-4 h-4" />
                                          </button>
                                          <button onClick={() => handleDelete(driver.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                                              <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="bg-white/5 border-b border-white/10 text-xs uppercase text-slate-400 font-semibold tracking-wider">
                              <th className="p-4">Patente / Modelo</th>
                              <th className="p-4">Kilometraje</th>
                              <th className="p-4">Estado</th>
                              <th className="p-4">Predicción AI</th>
                              <th className="p-4 text-right">Acciones</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                          {filteredVehicles.map((vehicle) => (
                              <tr key={vehicle.id} className="hover:bg-white/5 transition-colors group">
                                  <td className="p-4">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                                              <Truck className="w-5 h-5" />
                                          </div>
                                          <div>
                                              <p className="text-white font-medium">{vehicle.plate}</p>
                                              <p className="text-slate-500 text-xs">{vehicle.model}</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="p-4">
                                      <span className="text-sm text-slate-300 font-mono">{vehicle.mileage.toLocaleString()} km</span>
                                  </td>
                                  <td className="p-4">
                                      <StatusBadge status={vehicle.status} />
                                  </td>
                                  <td className="p-4">
                                      <button 
                                        onClick={() => runPrediction(vehicle)}
                                        className="flex items-center gap-1.5 text-xs font-bold text-accent-400 bg-accent-500/10 px-3 py-1.5 rounded-full border border-accent-500/20 hover:bg-accent-500/20 transition-colors"
                                      >
                                        <Zap className="w-3 h-3" /> Analizar
                                      </button>
                                  </td>
                                  <td className="p-4 text-right">
                                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenEdit(vehicle)} className="p-2 hover:bg-brand-500/20 rounded-lg text-slate-400 hover:text-brand-400 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(vehicle.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                )}
            </div>
        </div>
      </div>

      {/* --- CRUD MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-dark-900 border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
             <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h3 className="text-xl font-bold text-white">
                  {modalMode === 'create' ? 'Agregar' : 'Editar'} {activeTab === 'vehicles' ? 'Vehículo' : 'Conductor'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                   <X className="w-5 h-5" />
                </button>
             </div>
             <div className="p-6 space-y-4">
                {activeTab === 'vehicles' ? (
                  <>
                     <Input label="Patente" value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})} error={errors.plate} placeholder="XX-YY-12" />
                     <Input label="Modelo" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} error={errors.model} placeholder="Volvo FH16" />
                     <div className="grid grid-cols-2 gap-4">
                        <Input label="Kilometraje (km)" type="number" value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: Number(e.target.value)})} />
                        <Input label="Nivel Combustible (%)" type="number" value={formData.fuelLevel} onChange={(e) => setFormData({...formData, fuelLevel: Number(e.target.value)})} max={100} />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Estado</label>
                        <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-dark-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500 outline-none">
                          <option value="Active">Activo</option>
                          <option value="Maintenance">En Mantenimiento</option>
                          <option value="Idle">Inactivo</option>
                        </select>
                     </div>
                     <Input label="Próximo Servicio" type="date" value={formData.nextService} onChange={(e) => setFormData({...formData, nextService: e.target.value})} />
                  </>
                ) : (
                  <>
                     <Input label="Nombre Completo" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} error={errors.name} />
                     <Input label="RUT (Chile)" value={formData.rut} onChange={(e) => setFormData({...formData, rut: formatRut(e.target.value)})} error={errors.rut} />
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Tipo Licencia</label>
                          <select value={formData.licenseType} onChange={(e) => setFormData({...formData, licenseType: e.target.value})} className="w-full bg-dark-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500 outline-none">
                            <option value="A1">A1</option>
                            <option value="A4">A4</option>
                            <option value="A5">A5</option>
                          </select>
                        </div>
                        <Input label="Fecha Vencimiento" type="date" value={formData.licenseExpiry} onChange={(e) => setFormData({...formData, licenseExpiry: e.target.value})} error={errors.licenseExpiry} />
                     </div>
                  </>
                )}
             </div>
             <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium">Cancelar</button>
                <button onClick={handleSave} className="px-6 py-2 bg-white text-black rounded-lg font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"><Save className="w-4 h-4" /> Guardar</button>
             </div>
          </div>
        </div>
      )}

      {/* --- PREDICTIVE AI MODAL --- */}
      {showPredictionModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" onClick={() => setShowPredictionModal(false)}></div>
             <div className="relative bg-dark-900 border border-accent-500/30 w-full max-w-lg rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.2)] overflow-hidden animate-slide-up">
                
                {isPredicting ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <div className="relative w-20 h-20 mb-6">
                            <div className="absolute inset-0 border-4 border-accent-500/30 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-accent-400 rounded-full border-t-transparent animate-spin"></div>
                            <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-8 h-8 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Analizando Telemetría</h3>
                        <p className="text-slate-400">Consultando modelos predictivos para {selectedVehicleModel}...</p>
                    </div>
                ) : predictiveData ? (
                    <div>
                        <div className="bg-gradient-to-br from-accent-600 to-accent-900 p-6 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Activity className="w-6 h-6" /> Diagnóstico IA
                                    </h2>
                                    <p className="opacity-80 text-sm mt-1">{selectedVehicleModel} - Mantenimiento Predictivo</p>
                                </div>
                                <button onClick={() => setShowPredictionModal(false)} className="bg-black/20 p-2 rounded-full hover:bg-black/40 transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                             <div className="flex items-center gap-4">
                                 <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                                     <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                         <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                         <path className={`${predictiveData.healthScore > 70 ? 'text-green-500' : predictiveData.healthScore > 40 ? 'text-orange-500' : 'text-red-500'}`} strokeDasharray={`${predictiveData.healthScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                     </svg>
                                     <div className="absolute flex flex-col items-center">
                                         <span className="text-2xl font-bold text-white">{predictiveData.healthScore}%</span>
                                         <span className="text-[10px] text-slate-500 uppercase">SALUD</span>
                                     </div>
                                 </div>
                                 <div>
                                     <div className="mb-2">
                                         <span className="text-slate-400 text-xs uppercase tracking-wider">Riesgo Detectado</span>
                                         <h4 className="text-white font-semibold text-lg">{predictiveData.predictedFailure}</h4>
                                     </div>
                                     <div className="flex gap-2">
                                         <span className={`px-2 py-1 rounded text-xs font-bold ${predictiveData.urgency === 'Critical' || predictiveData.urgency === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                             Urgencia: {predictiveData.urgency}
                                         </span>
                                         <span className="px-2 py-1 rounded text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                             Est. {predictiveData.estimatedCost}
                                         </span>
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                 <h5 className="text-slate-300 text-sm font-bold mb-2 flex items-center gap-2">
                                    <Thermometer className="w-4 h-4 text-accent-400" /> Acción Recomendada
                                 </h5>
                                 <p className="text-slate-400 text-sm">{predictiveData.recommendedAction}</p>
                             </div>

                             <button onClick={() => setShowPredictionModal(false)} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors">
                                 Programar Taller
                             </button>
                        </div>
                    </div>
                ) : null}
             </div>
          </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const getStyles = (s: string) => {
    switch (s) {
      case 'Active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'On Route': return 'bg-brand-500/10 text-brand-400 border-brand-500/20';
      case 'Maintenance': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Available': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Idle': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
    }
  }
  const getLabel = (s: string) => {
      const labels: Record<string, string> = { 'Active': 'Activo', 'On Route': 'En Ruta', 'Maintenance': 'Mantenimiento', 'Available': 'Disponible', 'Idle': 'Inactivo', 'Off Duty': 'Fuera de Servicio' };
      return labels[s] || s;
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStyles(status)}`}>
       <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' || status === 'On Route' ? 'bg-current animate-pulse' : 'bg-current'}`}></span>
       {getLabel(status)}
    </span>
  );
};

const Input = ({ label, error, ...props }: any) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
    <input 
      {...props}
      className={`w-full bg-dark-950 border rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-colors ${error ? 'border-red-500/50' : 'border-white/10'}`}
    />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

export default FleetManager;
