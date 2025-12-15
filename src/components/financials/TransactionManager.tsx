import React, { useState, useEffect } from 'react';
import type { Transaction, Route } from '@/types';
import { transactionService, routeService } from '@services/databaseService';
import { showToast } from '@components/common/Toast';
import { X, DollarSign, Calendar, FileText, TrendingUp, TrendingDown, Plus, Save, Filter, MapPin, Eye, Truck, ExternalLink } from 'lucide-react';
import LoadingButton from '@components/common/LoadingButton';

const TransactionManager: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [balance, setBalance] = useState({ income: 0, expenses: 0, net: 0 });

    // Detail Modal State
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    // Filter State
    const [filterType, setFilterType] = useState<'All' | 'Income' | 'Expense'>('All');

    // Form State
    const [formData, setFormData] = useState<Partial<Transaction>>({
        type: 'Expense',
        category: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        status: 'Paid',
        document: { type: 'Invoice', number: '' },
        relatedId: undefined
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load types in parallel
            const [txData, routesData] = await Promise.all([
                transactionService.getAll(),
                routeService.getAll()
            ]);

            setTransactions(txData);
            setRoutes(routesData as Route[]);

            // Calculate Balance
            const inc = txData.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
            const exp = txData.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
            setBalance({ income: inc, expenses: exp, net: inc - exp });
        } catch (error) {
            console.error(error);
            showToast.error('Error loading data', 'No se pudieron cargar los datos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description || !formData.amount || !formData.category) {
            showToast.warning('Campos incompletos', 'Por favor completa descripción, monto y categoría');
            return;
        }

        try {
            setIsSaving(true);
            await transactionService.create({
                type: formData.type as 'Income' | 'Expense',
                category: formData.category!,
                amount: Number(formData.amount),
                date: formData.date!,
                description: formData.description!,
                status: formData.status as any,
                document: formData.document,
                relatedId: formData.relatedId
            });

            showToast.success('Movimiento registrado', 'El registro se guardó correctamente');
            setShowForm(false);
            loadData();
            // Reset form
            setFormData({
                type: 'Expense',
                category: '',
                amount: 0,
                date: new Date().toISOString().split('T')[0],
                description: '',
                status: 'Paid',
                document: { type: 'Invoice', number: '' },
                relatedId: undefined
            });
        } catch (error: any) {
            console.error('Error saving transaction:', error);
            showToast.error('Error al guardar', error.message || 'Intenta nuevamente');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredTransactions = transactions.filter(t => filterType === 'All' || t.type === filterType);

    const getLinkedRoute = (id?: string) => routes.find(r => r.id === id);

    return (
        <div className="animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Balance Cards */}
                <div className="bg-dark-800/50 p-6 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">Ingresos Totales</p>
                        <p className="text-2xl font-bold text-emerald-400">${balance.income.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                    </div>
                </div>
                <div className="bg-dark-800/50 p-6 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">Egresos Totales</p>
                        <p className="text-2xl font-bold text-red-400">${balance.expenses.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-lg">
                        <TrendingDown className="w-6 h-6 text-red-500" />
                    </div>
                </div>
                <div className="bg-dark-800/50 p-6 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">Balance Neto</p>
                        <p className={`text-2xl font-bold ${balance.net >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                            ${balance.net.toLocaleString()}
                        </p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                        <DollarSign className="w-6 h-6 text-blue-500" />
                    </div>
                </div>
            </div>

            <div className="glass-panel border border-white/5 rounded-xl overflow-hidden min-h-[500px]">
                <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h3 className="font-bold text-white text-lg">Movimientos Financieros</h3>
                        <div className="flex bg-dark-900 rounded-lg p-1 border border-white/10">
                            {(['All', 'Income', 'Expense'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filterType === type ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    {type === 'All' ? 'Todos' : type === 'Income' ? 'Ingresos' : 'Egresos'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Movimiento
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="p-6 bg-white/5 border-b border-white/10 animate-fade-in">
                        <form onSubmit={handleSubmit}>
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-brand-400" /> Registrar Movimiento
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Tipo</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    >
                                        <option value="Income">Ingreso</option>
                                        <option value="Expense">Egreso</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Descripción</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Descripción del movimiento..."
                                        className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Monto</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                        className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Categoría</label>
                                    <input
                                        type="text"
                                        value={formData.category} // Could be a select based on type
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="Ej: Combustible, Flete..."
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
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">N° Documento</label>
                                    <input
                                        type="text"
                                        value={formData.document?.number}
                                        onChange={e => setFormData({ ...formData, document: { ...formData.document!, number: e.target.value, type: formData.document?.type || 'Invoice' } })}
                                        placeholder="Opcional"
                                        className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                {/* Route Selection */}
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Asociar a Ruta (Opcional)</label>
                                    <select
                                        value={formData.relatedId || ''}
                                        onChange={e => setFormData({ ...formData, relatedId: e.target.value || undefined })}
                                        className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    >
                                        <option value="">Ninguna</option>
                                        {routes.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.origin.split(',')[0]} → {r.destination.split(',')[0]} ({new Date(r.timestamp).toLocaleDateString()}) - {r.estimatedPrice}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
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
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-white/5 text-xs uppercase text-slate-400 font-semibold border-b border-white/5">
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Descripción</th>
                                <th className="p-4">Categoría</th>
                                <th className="p-4">Ruta</th>
                                <th className="p-4 text-right">Monto</th>
                                <th className="p-4 text-center">Estado</th>
                                <th className="p-4 text-center">Detalle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-500">
                                        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        Cargando datos...
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-500">No hay movimientos registrados.</td>
                                </tr>
                            ) : (
                                filteredTransactions.map(t => {
                                    const linkedRoute = getLinkedRoute(t.relatedId);
                                    return (
                                        <tr key={t.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedTransaction(t)}>
                                            <td className="p-4 text-slate-400 text-sm whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.type === 'Income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {t.type === 'Income' ? 'Ingreso' : 'Egreso'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-white font-medium">{t.description}</td>
                                            <td className="p-4 text-slate-400 text-sm">
                                                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{t.category}</span>
                                            </td>
                                            <td className="p-4 text-slate-500 text-xs">
                                                {linkedRoute ? (
                                                    <div className="flex items-center gap-1 text-brand-400">
                                                        <Truck className="w-3 h-3" />
                                                        {linkedRoute.origin.split(',')[0]} → {linkedRoute.destination.split(',')[0]}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className={`p-4 text-right font-mono font-bold ${t.type === 'Income' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {t.type === 'Income' ? '+' : '-'}${t.amount.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`text-[10px] uppercase font-bold ${t.status === 'Paid' ? 'text-blue-400' : t.status === 'Overdue' ? 'text-red-500' : 'text-yellow-500'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTransaction(t);
                                                    }}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transaction Details Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedTransaction(null)}>
                    <div className="relative w-full max-w-2xl glass-panel border border-white/10 rounded-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-brand-500/10 to-accent-500/10">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    {selectedTransaction.type === 'Income' ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
                                    Detalle del Movimiento
                                </h2>
                                <p className="text-xs text-slate-400 font-mono mt-1">ID: {selectedTransaction.id}</p>
                            </div>
                            <button onClick={() => setSelectedTransaction(null)} className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Monto</span>
                                    <p className={`text-2xl font-bold ${selectedTransaction.type === 'Income' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        ${selectedTransaction.amount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Fecha</span>
                                    <p className="text-xl font-bold text-white">
                                        {new Date(selectedTransaction.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Descripción</span>
                                    <p className="text-white bg-dark-900/50 p-3 rounded-lg border border-white/5">
                                        {selectedTransaction.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Categoría</span>
                                        <span className="inline-block px-3 py-1 rounded bg-slate-800 border border-slate-700 text-sm text-slate-300">
                                            {selectedTransaction.category}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Documento</span>
                                        <p className="text-sm text-slate-300">
                                            {selectedTransaction.document?.number ? (
                                                <span className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    {selectedTransaction.document.type} {selectedTransaction.document.number}
                                                </span>
                                            ) : 'No adjunto'}
                                        </p>
                                    </div>
                                </div>

                                {selectedTransaction.relatedId && getLinkedRoute(selectedTransaction.relatedId) && (
                                    <div className="mt-4 p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl">
                                        <h4 className="text-sm font-bold text-brand-400 uppercase mb-3 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" /> Ruta Asociada
                                        </h4>
                                        {(() => {
                                            const route = getLinkedRoute(selectedTransaction.relatedId)!;
                                            return (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-xs text-slate-500 uppercase">Origen</span>
                                                        <p className="text-white font-medium truncate">{route.origin}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-slate-500 uppercase">Destino</span>
                                                        <p className="text-white font-medium truncate">{route.destination}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-slate-500 uppercase">Distancia</span>
                                                        <p className="text-slate-300">{route.distance}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-slate-500 uppercase">Valor Ruta</span>
                                                        <p className="text-slate-300">{route.estimatedPrice}</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end">
                            <button
                                onClick={() => setSelectedTransaction(null)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-bold"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionManager;
