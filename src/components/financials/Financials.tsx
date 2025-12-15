
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '@store/useStore';
import { analyzeFinancials } from '@services/geminiService';
import { FinancialReport } from '@/types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { TrendingUp, DollarSign, Award, ArrowRight, Zap, Loader2, MapPin, FileText, CheckCircle2, UploadCloud, Printer, Filter, Download, Trash2, X } from 'lucide-react';

import { driverService, vehicleService, financialReportService, transactionService } from '@services/databaseService';
import TransactionManager from './TransactionManager';
const Financials: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profit' | 'invoicing' | 'transactions'>('profit');
    const [report, setReport] = useState<FinancialReport | null>(null);
    const [loading, setLoading] = useState(false);
    const registeredRoutes = useStore((state) => state.registeredRoutes);

    // Filters State
    const [dateRange, setDateRange] = useState('30'); // days
    const [selectedDriver, setSelectedDriver] = useState('all');
    const [selectedVehicle, setSelectedVehicle] = useState('all');

    // Invoicing State
    const [invoices, setInvoices] = useState([
        { id: 1, client: "Logística Sur SpA", route: "Stgo - Valpo", amount: 450000, status: "Pending", dte: null },
        { id: 2, client: "Constructora Andina", route: "Puerto Montt - Osorno", amount: 180000, status: "DTE Generated", dte: "F-3392" },
        { id: 3, client: "Retail Chile Ltd", route: "Antofagasta - Calama", amount: 850000, status: "Pending", dte: null },
    ]);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Delete confirmation state
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const registeredRouteData = useMemo(() => {
        return registeredRoutes.map(route => {
            const revenue = parseInt(route.estimatedPrice.replace(/[^0-9]/g, '')) || 0;
            const cost = Math.round(revenue * 0.6); // Est. 60% cost
            const margin = Math.round(((revenue - cost) / revenue) * 100);

            return {
                id: route.id,
                route: `${route.origin.split(',')[0]} - ${route.destination.split(',')[0]}`,
                driver: route.driver || "Asignación Pendiente",
                vehicle: route.vehicleType,
                revenue,
                cost,
                margin,
                fuel: Math.round(cost * 0.4),
                maintenance: Math.round(cost * 0.2),
                wages: Math.round(cost * 0.3),
                tolls: Math.round(cost * 0.1)
            };
        });
    }, [registeredRoutes]);

    // Use only registered route data
    const rawRouteData = useMemo(() => {
        return registeredRouteData;
    }, [registeredRouteData]);

    // Filtered Data
    const filteredData = useMemo(() => {
        return rawRouteData.filter(item => {
            const driverMatch = selectedDriver === 'all' || item.driver === selectedDriver;
            const vehicleMatch = selectedVehicle === 'all' || item.vehicle === selectedVehicle;
            return driverMatch && vehicleMatch;
        });
    }, [selectedDriver, selectedVehicle, rawRouteData]);

    // Delete route handler
    const handleDeleteRoute = (routeId: string) => {
        const removeRoute = useStore.getState().removeRoute;
        removeRoute(routeId);
        setDeleteConfirm(null);
    };

    // Aggregated Data for Charts
    const costBreakdown = useMemo(() => {
        const total = filteredData.reduce((acc, curr) => ({
            fuel: acc.fuel + curr.fuel,
            maintenance: acc.maintenance + curr.maintenance,
            wages: acc.wages + curr.wages,
            tolls: acc.tolls + curr.tolls
        }), { fuel: 0, maintenance: 0, wages: 0, tolls: 0 });

        return [
            { name: 'Combustible', value: total.fuel, color: '#ef4444' },
            { name: 'Mantenimiento', value: total.maintenance, color: '#f59e0b' },
            { name: 'Sueldos', value: total.wages, color: '#3b82f6' },
            { name: 'Peajes', value: total.tolls, color: '#10b981' },
        ];
    }, [filteredData]);

    const routeComparison = useMemo(() => {
        return filteredData.map(item => ({
            name: item.route,
            Ingresos: item.revenue,
            Costos: item.cost,
            Utilidad: item.revenue - item.cost
        }));
    }, [filteredData]);

    // Real Balance State
    const [realBalance, setRealBalance] = useState({ income: 0, expenses: 0, net: 0 });

    useEffect(() => {
        const loadBalance = async () => {
            const bal = await transactionService.getBalance();
            setRealBalance(bal);
        };
        loadBalance();
    }, [activeTab]);

    // KPIs linked to Real Balance
    const kpis = useMemo(() => {
        const totalRevenue = realBalance.income;
        const totalCost = realBalance.expenses;
        const netProfit = realBalance.net;
        const roi = totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(1) : '0';
        const ebitda = (netProfit * 1.15).toFixed(0);

        return { totalRevenue, totalCost, netProfit, roi, ebitda };
    }, [realBalance]);


    // Load latest report on mount
    React.useEffect(() => {
        const loadReport = async () => {
            try {
                const latest = await financialReportService.getLatest();
                if (latest) {
                    setReport(latest);
                }
            } catch (error) {
                console.error('Error loading saved report:', error);
            }
        };
        loadReport();
    }, []);

    const handleGenerateReport = async () => {
        setLoading(true);
        try {
            const data = await analyzeFinancials(filteredData);
            setReport(data);

            // Save to database
            try {
                await financialReportService.create(data);
            } catch (err) {
                console.error('Failed to save report to DB:', err);
            }

        } catch (error) {
            console.error('Error generating report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        // Map data to Spanish headers
        const dataToExport = filteredData.map(item => ({
            "Ruta": item.route,
            "Conductor": item.driver,
            "Vehículo": item.vehicle,
            "Ingresos": item.revenue,
            "Costos": item.cost,
            "Margen (%)": `${item.margin}%`,
            "Combustible": item.fuel,
            "Mantenimiento": item.maintenance,
            "Sueldos": item.wages,
            "Peajes": item.tolls
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Finanzas");
        XLSX.writeFile(wb, "Reporte_Financiero_FletesM.xlsx");
    };

    const handleGenerateDTE = (id: number) => {
        setProcessingId(id);
        setTimeout(() => {
            setInvoices(prev => prev.map(inv =>
                inv.id === id ? { ...inv, status: "DTE Generated", dte: `F-${Math.floor(Math.random() * 10000)}` } : inv
            ));
            setProcessingId(null);
        }, 2000);
    };

    const uniqueDrivers = [...new Set(rawRouteData.map(item => item.driver))];
    const uniqueVehicles = [...new Set(rawRouteData.map(item => item.vehicle))];

    return (
        <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-10 bg-dark-950 text-slate-200">
            <div className="max-w-7xl mx-auto animate-fade-in">

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex gap-1">
                        <button
                            onClick={() => setActiveTab('profit')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'profit' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <TrendingUp className="w-4 h-4" /> Rentabilidad
                        </button>
                        <button
                            onClick={() => setActiveTab('invoicing')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'invoicing' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <UploadCloud className="w-4 h-4" /> Facturación SII
                        </button>
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'transactions' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <DollarSign className="w-4 h-4" /> Movimientos
                        </button>
                    </div>
                </div>

                {activeTab === 'transactions' ? (
                    <TransactionManager />
                ) : activeTab === 'profit' ? (
                    // --- PROFITABILITY VIEW ---
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-end mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">Análisis de Rentabilidad</h2>
                                <p className="text-slate-500">Inteligencia financiera para maximizar márgenes operativos.</p>
                            </div>
                            <div className="flex gap-3 mt-4 md:mt-0">
                                <button
                                    onClick={handleExport}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-all flex items-center gap-2 border border-white/10"
                                >
                                    <Download className="w-4 h-4" /> Exportar Excel
                                </button>
                                <button
                                    onClick={handleGenerateReport}
                                    disabled={loading}
                                    className="px-6 py-2 bg-white text-black hover:bg-slate-200 font-bold rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-brand-600" />}
                                    {loading ? 'Analizando...' : 'Generar Reporte IA'}
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-slate-400 font-bold uppercase">Periodo</label>
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                                >
                                    <option value="7">Últimos 7 días</option>
                                    <option value="30">Últimos 30 días</option>
                                    <option value="90">Últimos 3 meses</option>
                                    <option value="365">Último año</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-slate-400 font-bold uppercase">Conductor</label>
                                <select
                                    value={selectedDriver}
                                    onChange={(e) => setSelectedDriver(e.target.value)}
                                    className="bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                                >
                                    <option value="all">Todos</option>
                                    {uniqueDrivers.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-slate-400 font-bold uppercase">Vehículo</label>
                                <select
                                    value={selectedVehicle}
                                    onChange={(e) => setSelectedVehicle(e.target.value)}
                                    className="bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                                >
                                    <option value="all">Todos</option>
                                    {uniqueVehicles.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <div className="w-full bg-brand-900/20 border border-brand-500/20 rounded-lg px-4 py-2 flex justify-between items-center">
                                    <span className="text-xs text-brand-400 font-bold uppercase">ROI Actual</span>
                                    <span className="text-xl font-bold text-brand-400">{kpis.roi}%</span>
                                </div>
                            </div>
                        </div>

                        {/* KPIs & Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* KPI Cards */}
                            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-dark-800/50 p-4 rounded-xl border border-white/5">
                                    <p className="text-slate-400 text-xs font-bold uppercase">Ingresos Totales</p>
                                    <p className="text-2xl font-bold text-white mt-1">${kpis.totalRevenue.toLocaleString()}</p>
                                </div>
                                <div className="bg-dark-800/50 p-4 rounded-xl border border-white/5">
                                    <p className="text-slate-400 text-xs font-bold uppercase">Costos Operativos</p>
                                    <p className="text-2xl font-bold text-red-400 mt-1">${kpis.totalCost.toLocaleString()}</p>
                                </div>
                                <div className="bg-dark-800/50 p-4 rounded-xl border border-white/5">
                                    <p className="text-slate-400 text-xs font-bold uppercase">Utilidad Neta</p>
                                    <p className="text-2xl font-bold text-emerald-400 mt-1">${kpis.netProfit.toLocaleString()}</p>
                                </div>
                                <div className="bg-dark-800/50 p-4 rounded-xl border border-white/5">
                                    <p className="text-slate-400 text-xs font-bold uppercase">EBITDA (Est.)</p>
                                    <p className="text-2xl font-bold text-blue-400 mt-1">${Number(kpis.ebitda).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Cost Breakdown Chart */}
                            <div className="bg-dark-900/50 border border-white/5 rounded-xl p-6">
                                <h3 className="text-white font-bold mb-4">Desglose de Costos</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={costBreakdown}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {costBreakdown.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                                formatter={(value: number) => `$${value.toLocaleString()}`}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Route Comparison Chart */}
                            <div className="lg:col-span-2 bg-dark-900/50 border border-white/5 rounded-xl p-6">
                                <h3 className="text-white font-bold mb-4">Comparativa por Ruta</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={routeComparison}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                                formatter={(value: number) => `$${value.toLocaleString()}`}
                                            />
                                            <Legend />
                                            <Bar dataKey="Ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Costos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Utilidad" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* AI Insights (Existing) */}
                        {report && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-slide-up">
                                <div className="bg-gradient-to-br from-emerald-900/50 to-dark-900 border border-emerald-500/30 p-6 rounded-2xl relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl"></div>
                                    <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">Top Performer</h3>
                                    <div className="flex items-center gap-3">
                                        <Award className="w-8 h-8 text-white" />
                                        <div>
                                            <p className="text-2xl font-bold text-white">{report.topDriver}</p>
                                            <p className="text-xs text-slate-400">Conductor Más Rentable</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-900/50 to-dark-900 border border-blue-500/30 p-6 rounded-2xl relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
                                    <h3 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">Ruta Dorada</h3>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-8 h-8 text-white" />
                                        <div>
                                            <p className="text-xl font-bold text-white leading-tight">{report.mostProfitableRoute}</p>
                                            <p className="text-xs text-slate-400">Mayor Margen Registrado</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-900/50 to-dark-900 border border-purple-500/30 p-6 rounded-2xl relative overflow-hidden">
                                    <h3 className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">Oportunidad de Ahorro</h3>
                                    <p className="text-white font-medium text-sm leading-relaxed">{report.costSavingOpportunity}</p>
                                </div>
                            </div>
                        )}

                        {/* Main Data Table */}
                        <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                <h3 className="font-bold text-white">Desglose por Ruta</h3>
                                <span className="text-xs text-slate-500 font-mono">DATOS FILTRADOS</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[800px]">
                                    <thead>
                                        <tr className="bg-white/5 text-xs uppercase text-slate-400 font-semibold">
                                            <th className="p-4">Ruta</th>
                                            <th className="p-4">Conductor</th>
                                            <th className="p-4 text-right">Ingresos</th>
                                            <th className="p-4 text-right">Costos</th>
                                            <th className="p-4 text-right">Margen</th>
                                            <th className="p-4">Estado</th>
                                            <th className="p-4 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredData.map((r) => (
                                            <tr key={r.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-white font-medium">{r.route}</td>
                                                <td className="p-4 text-slate-400">{r.driver}</td>
                                                <td className="p-4 text-right text-slate-300">${r.revenue.toLocaleString()}</td>
                                                <td className="p-4 text-right text-slate-400">${r.cost.toLocaleString()}</td>
                                                <td className="p-4 text-right">
                                                    <span className={`font-bold ${r.margin > 40 ? 'text-green-400' : r.margin < 20 ? 'text-red-400' : 'text-yellow-400'}`}>
                                                        {r.margin}%
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {r.margin > 40 ? (
                                                        <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded font-bold border border-green-500/20">Optimo</span>
                                                    ) : r.margin < 20 ? (
                                                        <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded font-bold border border-red-500/20">Revisar</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded border border-slate-700">Normal</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {deleteConfirm === r.id ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleDeleteRoute(r.id)}
                                                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors flex items-center gap-1"
                                                            >
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Confirmar
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors flex items-center gap-1"
                                                            >
                                                                <X className="w-3 h-3" />
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center">
                                                            <button
                                                                onClick={() => setDeleteConfirm(r.id)}
                                                                className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded transition-colors group"
                                                                title="Eliminar ruta"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'invoicing' ? (
                    // --- INVOICING VIEW ---
                    <div className="animate-slide-up">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                                    <UploadCloud className="w-8 h-8 text-blue-500" /> Portal SII
                                </h2>
                                <p className="text-slate-500">Emisión automática de Documentos Tributarios Electrónicos.</p>
                            </div>
                            <div className="text-right">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/30 border border-green-500/30">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-bold text-green-400">CONEXION SII ESTABLE</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/5 bg-slate-900/50">
                                <h3 className="text-lg font-bold text-white">Servicios Pendientes de Facturación</h3>
                            </div>
                            <table className="w-full text-left min-w-[900px]">
                                <thead className="bg-white/5 text-xs uppercase text-slate-400">
                                    <tr>
                                        <th className="p-6">Cliente</th>
                                        <th className="p-6">Servicio / Ruta</th>
                                        <th className="p-6 text-right">Monto Neto</th>
                                        <th className="p-6 text-right">Estado DTE</th>
                                        <th className="p-6 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {invoices.map(inv => (
                                        <tr key={inv.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="p-6 font-medium text-white">{inv.client}</td>
                                            <td className="p-6 text-slate-400">{inv.route}</td>
                                            <td className="p-6 text-right font-mono text-lg text-slate-200">${inv.amount.toLocaleString()}</td>
                                            <td className="p-6 text-right">
                                                {inv.status === 'DTE Generated' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
                                                        <CheckCircle2 className="w-3 h-3" /> Aceptado {inv.dte}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold">
                                                        Pendiente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-6 text-right">
                                                {inv.status === 'Pending' ? (
                                                    <button
                                                        onClick={() => handleGenerateDTE(inv.id)}
                                                        disabled={processingId === inv.id}
                                                        className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 ml-auto disabled:opacity-50"
                                                    >
                                                        {processingId === inv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                                                        {processingId === inv.id ? 'Enviando...' : 'Emitir Factura'}
                                                    </button>
                                                ) : (
                                                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ml-auto border border-white/10">
                                                        <Printer className="w-3 h-3" /> PDF
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : null
                }

            </div >
        </div >
    );
};

export default Financials;
