
import React, { useState, useEffect } from 'react';
import type { MaintenanceLog, Vehicle } from '@/types';
import { maintenanceService, transactionService } from '@services/databaseService';
import { showToast } from '@components/common/Toast';
import { X, Wrench, Calendar, DollarSign, FileText, CheckCircle, AlertCircle, Plus, Save, Clock, ArrowRight } from 'lucide-react';
import LoadingButton from '@components/common/LoadingButton';

interface MaintenanceManagerProps {
    vehicle: Vehicle;
    onClose: () => void;
}

const MaintenanceManager: React.FC<MaintenanceManagerProps> = ({ vehicle, onClose }) => {
    const [logs, setLogs] = useState<MaintenanceLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<MaintenanceLog>>({
        type: 'Preventive',
        status: 'Scheduled',
        date: new Date().toISOString().split('T')[0],
        guarantee: false,
        cost: 0,
        provider: '',
        description: ''
    });

    useEffect(() => {
        loadLogs();
    }, [vehicle.id]);

    const loadLogs = async () => {
        try {
            setIsLoading(true);
            const data = await maintenanceService.getByVehicle(vehicle.id);
            setLogs(data);
        } catch (error) {
            showToast.error('Error al cargar historial', 'No se pudieron obtener los mantenimientos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description || !formData.provider || !formData.cost) {
            showToast.warning('Faltan datos', 'Por favor completa descripción, proveedor y costo');
            return;
        }

        try {
            setIsSaving(true);
            const newMaintenance = await maintenanceService.create({
                vehicleId: vehicle.id,
                type: formData.type as any,
                description: formData.description!,
                cost: Number(formData.cost),
                provider: formData.provider!,
                date: formData.date!,
                status: formData.status as any,
                guarantee: formData.guarantee
            });

            // If created as Completed, generate transaction immediately
            if (formData.status === 'Completed' && !formData.guarantee) {
                try {
                    await transactionService.create({
                        type: 'Expense',
                        category: 'Mantenimiento',
                        amount: Number(formData.cost),
                        date: formData.date!,
                        description: `Mantenimiento ${formData.type}: ${formData.description} (${vehicle.plate})`,
                        status: 'Paid',
                        relatedId: newMaintenance.id // Use the ID from the newly created log
                    });
                    showToast.success('Registrado y procesado', 'Se generó el egreso financiero automáticamente');
                } catch (txError) {
                    console.error('Error creating transaction:', txError);
                    showToast.warning('Guardado', 'Pero hubo un error al crear el registro financiero');
                }
            } else {
                showToast.success('Mantenimiento registrado', 'El registro se ha guardado correctamente');
            }

            setShowForm(false);
            loadLogs();
            // Reset form
            setFormData({
                type: 'Preventive',
                status: 'Scheduled',
                date: new Date().toISOString().split('T')[0],
                guarantee: false,
                cost: 0,
                provider: '',
                description: ''
            });
        } catch (error) {
            showToast.error('Error al guardar', 'Intenta nuevamente');
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusChange = async (log: MaintenanceLog, newStatus: string) => {
        if (log.status === newStatus) return;

        setUpdatingId(log.id);
        try {
            await maintenanceService.update(log.id, { status: newStatus as any });

            // If completed, create transaction automatically
            if (newStatus === 'Completed' && !log.guarantee) {
                try {
                    await transactionService.create({
                        type: 'Expense',
                        category: 'Mantenimiento',
                        amount: log.cost,
                        date: new Date().toISOString().split('T')[0],
                        description: `Mantenimiento ${log.type}: ${log.description} (${vehicle.plate})`,
                        status: 'Paid',
                        relatedId: log.id // We might need to handle this relation if schema permits, otherwise just description
                    });
                    showToast.success('Mantenimiento completado', 'Se ha generado el egreso financiero automáticamente');
                } catch (txError) {
                    console.error('Error creating transaction:', txError);
                    showToast.warning('Mantenimiento actualizado', 'Pero hubo un error al crear el registro financiero');
                }
            } else {
                showToast.success('Estado actualizado', `Mantenimiento marcado como ${newStatus === 'In Progress' ? 'En Progreso' : newStatus}`);
            }

            loadLogs();
        } catch (error) {
            console.error(error);
            showToast.error('Error al actualizar', 'No se pudo cambiar el estado');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-dark-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-500/10 rounded-lg border border-brand-500/20">
                            <Wrench className="w-6 h-6 text-brand-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Historial de Mantenimiento</h3>
                            <p className="text-slate-400 text-sm">{vehicle.model} - {vehicle.plate}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-white font-bold">Registros ({logs.length})</h4>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Registrar Mantenimiento
                        </button>
                    </div>

                    {/* Form */}
                    {showForm && (
                        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 animate-fade-in">
                            <h5 className="text-white font-bold mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-brand-400" /> Nuevo Registro
                            </h5>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Tipo</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    >
                                        <option value="Preventive">Preventivo</option>
                                        <option value="Corrective">Correctivo</option>
                                        <option value="Emergency">Emergencia</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Estado</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    >
                                        <option value="Scheduled">Programado</option>
                                        <option value="In Progress">En Progreso</option>
                                        <option value="Completed">Completado</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Descripción</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Ej: Cambio de aceite y filtros"
                                        className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Proveedor / Taller</label>
                                    <input
                                        type="text"
                                        value={formData.provider}
                                        onChange={e => setFormData({ ...formData, provider: e.target.value })}
                                        placeholder="Ej: Taller Mecánico Central"
                                        className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Costo (CLP)</label>
                                    <input
                                        type="number"
                                        value={formData.cost}
                                        onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
                                        className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Fecha</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.guarantee}
                                            onChange={e => setFormData({ ...formData, guarantee: e.target.checked })}
                                            className="w-4 h-4 rounded border-white/10 bg-dark-950 text-brand-600 focus:ring-brand-500"
                                        />
                                        <span className="text-sm text-slate-300">Cobertura por Garantía</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 border-t border-white/5 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium"
                                >
                                    Cancelar
                                </button>
                                <LoadingButton
                                    loading={isSaving}
                                    loadingText="Guardando..."
                                    icon={<Save className="w-4 h-4" />}
                                >
                                    Guardar Registro
                                </LoadingButton>
                            </div>
                        </form>
                    )}

                    {/* List */}
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-slate-500 text-sm">Cargando registros...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400">No hay registros de mantenimiento</p>
                            <p className="text-slate-600 text-sm">Crea el primero usando el botón superior.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map(log => (
                                <div key={log.id} className="bg-dark-950 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 hover:border-brand-500/30 transition-colors">

                                    {/* Info Section */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                                ${log.type === 'Emergency' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                                    log.type === 'Corrective' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' :
                                                        'bg-blue-500/20 text-blue-400 border border-blue-500/20'}`}>
                                                {log.type === 'Preventive' ? 'Preventivo' : log.type === 'Corrective' ? 'Correctivo' : 'Emergencia'}
                                            </span>
                                            <span className="text-slate-500 text-xs flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {new Date(log.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h5 className="text-white font-medium text-lg leading-tight">{log.description}</h5>
                                        <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
                                            <Wrench className="w-3 h-3" /> {log.provider}
                                        </p>
                                    </div>

                                    {/* Controls & Cost */}
                                    <div className="flex flex-col md:items-end justify-between gap-3 border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-4 min-w-[180px]">

                                        <div className="text-right">
                                            <div className="text-white font-mono font-bold text-xl flex items-center justify-end gap-1">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                {log.cost.toLocaleString('es-CL')}
                                            </div>
                                            {log.guarantee && (
                                                <div className="flex items-center justify-end gap-1 mt-1">
                                                    <span className="text-[10px] bg-emerald-900/40 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Garantía
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-end gap-2">
                                            {updatingId === log.id ? (
                                                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <div className="relative group">
                                                    <select
                                                        value={log.status}
                                                        onChange={(e) => handleStatusChange(log, e.target.value)}
                                                        disabled={log.status === 'Completed'}
                                                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer transition-colors
                                                            ${log.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20 cursor-default' :
                                                                log.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20' :
                                                                    'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                                            }`}
                                                    >
                                                        <option value="Scheduled">Programado</option>
                                                        <option value="In Progress">En Taller</option>
                                                        <option value="Completed">Completado</option>
                                                    </select>

                                                    {/* Custom Arrow because appearance-none removes it but we want custom styling or relying on default but styled */}
                                                    {log.status !== 'Completed' && (
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                                            <ArrowRight className="w-3 h-3 opacity-50" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default MaintenanceManager;
