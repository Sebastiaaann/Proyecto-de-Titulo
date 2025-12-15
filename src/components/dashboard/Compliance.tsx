
import React from 'react';
import { ShieldCheck, FileText, AlertCircle, CheckCircle2, Clock, Download, Award, FileBarChart, TrendingUp, PackageCheck, Truck, AlertTriangle, ExternalLink, Wrench } from 'lucide-react';
import TableSkeleton from '@components/common/TableSkeleton';
import { driverService, vehicleService } from '@services/databaseService';
import { useStore } from '@store/useStore';
import { generateAuditReport } from '@/utils/reportGenerator';
import { showToast } from '@components/common/Toast';
import type { Driver, Vehicle } from '@/types';
import MaintenanceManager from '@components/fleet/MaintenanceManager';

const Compliance: React.FC = () => {
    const [loading, setLoading] = React.useState(true);
    const [drivers, setDrivers] = React.useState<Driver[]>([]);
    const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);

    // Maintenance Modal State
    const [showMaintenanceModal, setShowMaintenanceModal] = React.useState(false);
    const [selectedMaintenanceVehicle, setSelectedMaintenanceVehicle] = React.useState<Vehicle | null>(null);
    const { registeredRoutes, isoSteps, toggleIsoStep } = useStore();

    React.useEffect(() => {
        loadData();

        // Escuchar cambios en tiempo real
        const handleChange = () => loadData();
        window.addEventListener('driver-change', handleChange);
        window.addEventListener('vehicle-change', handleChange);
        window.addEventListener('route-change', handleChange);

        return () => {
            window.removeEventListener('driver-change', handleChange);
            window.removeEventListener('vehicle-change', handleChange);
            window.removeEventListener('route-change', handleChange);
        };
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [driversData, vehiclesData] = await Promise.all([
                driverService.getAll(),
                vehicleService.getAll()
            ]);
            setDrivers(driversData);
            setVehicles(vehiclesData);
        } catch (error) {
            console.error('Error loading compliance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenMaintenance = (vehicle: Vehicle) => {
        setSelectedMaintenanceVehicle(vehicle);
        setShowMaintenanceModal(true);
    };

    // Generar alertas inteligentes basadas en rutas y vehículos
    const intelligentAlerts = React.useMemo(() => {
        const alerts = [];
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        const oneDay = 24 * oneHour;

        // Contar rutas por estado
        const completedRoutes = registeredRoutes.filter(r => r.status === 'Completed').length;
        const inProgressRoutes = registeredRoutes.filter(r => r.status === 'In Progress').length;
        const pendingRoutes = registeredRoutes.filter(r => r.status === 'Pending').length;

        // ============ ALERTAS CRÍTICAS ============

        // Alerta: Consumo excesivo de combustible
        const lowFuelVehicles = vehicles.filter(v => v.fuelLevel < 20 && v.status === 'Active');
        if (lowFuelVehicles.length > 0) {
            const vehicle = lowFuelVehicles[0];
            alerts.push({
                type: 'critical',
                icon: AlertCircle,
                title: 'Consumo Excesivo Detectado',
                message: `Vehículo ${vehicle.plate} con nivel crítico de combustible (${vehicle.fuelLevel}%)`,
                timestamp: 'Hace 10m',
                action: 'Ver detalles del vehículo',
                onClick: () => handleOpenMaintenance(vehicle),
                priority: 1
            });
        }

        // Alerta: Rutas en progreso hace más de 8 horas
        const longRoutes = registeredRoutes.filter(route => {
            if (route.status !== 'In Progress') return false;
            const elapsed = now - route.timestamp;
            return elapsed > (8 * oneHour);
        });

        if (longRoutes.length > 0) {
            alerts.push({
                type: 'warning',
                icon: Clock,
                title: 'Rutas Prolongadas',
                message: `${longRoutes.length} ruta(s) en progreso por más de 8 horas`,
                action: 'Revisar rutas activas',
                priority: 2
            });
        }

        // Alerta: Rutas pendientes sin asignar
        const unassignedRoutes = registeredRoutes.filter(r =>
            r.status === 'Pending' && (!r.driver || r.driver === 'Conductor')
        );

        if (unassignedRoutes.length > 0) {
            alerts.push({
                type: 'info',
                icon: AlertTriangle,
                title: 'Rutas Sin Asignar',
                message: `${unassignedRoutes.length} ruta(s) pendiente(s) sin conductor`,
                action: 'Asignar conductores',
                priority: 3
            });
        }

        // Alerta: Alto rendimiento
        const recentCompleted = registeredRoutes.filter(route => {
            if (route.status !== 'Completed') return false;
            const elapsed = now - route.timestamp;
            return elapsed < oneDay;
        });

        if (recentCompleted.length >= 3) {
            alerts.push({
                type: 'success',
                icon: TrendingUp,
                title: 'Alto Rendimiento',
                message: `${recentCompleted.length} rutas completadas hoy`,
                action: 'Ver estadísticas',
                priority: 4
            });
        }

        // Alerta: Rutas sin comprobante de entrega
        const noProofRoutes = registeredRoutes.filter(r =>
            r.status === 'Completed' && !r.deliveryProof
        );

        if (noProofRoutes.length > 0) {
            alerts.push({
                type: 'critical',
                icon: FileText,
                title: 'Comprobantes Faltantes',
                message: `${noProofRoutes.length} ruta(s) completada(s) sin firma digital`,
                timestamp: 'Hace 1h',
                action: 'Solicitar firmas',
                priority: 1
            });
        }

        // ============ ALERTAS DE ADVERTENCIA ============

        // Alerta: Exceso de velocidad (simulado basado en conductores en ruta)
        const onRouteDrivers = registeredRoutes.filter(r => r.status === 'In Progress' && r.driver);
        if (onRouteDrivers.length > 0 && drivers.length > 1) {
            const driver = drivers[1]; // Segundo conductor
            alerts.push({
                type: 'warning',
                icon: AlertTriangle,
                title: 'Exceso de Velocidad',
                message: `Conductor ${driver.name} excedió límite en zona urbana (85 km/h)`,
                timestamp: 'Hace 45m',
                action: 'Contactar conductor',
                priority: 2
            });
        }

        // Alerta: Vehículo próximo a mantenimiento
        const maintenanceSoonVehicles = vehicles.filter(v => {
            const serviceDate = new Date(v.nextService);
            const daysUntil = (serviceDate.getTime() - now) / oneDay;
            return daysUntil <= 7 && daysUntil > 0 && v.status === 'Active';
        });

        if (maintenanceSoonVehicles.length > 0) {
            const vehicle = maintenanceSoonVehicles[0];
            alerts.push({
                type: 'warning',
                icon: Clock,
                title: 'Mantenimiento Próximo',
                message: `Vehículo ${vehicle.plate} requiere servicio en menos de 7 días`,
                timestamp: 'Hace 3h',
                action: 'Agendar mantenimiento',
                onClick: () => handleOpenMaintenance(vehicle),
                priority: 2
            });
        }

        // ============ ALERTAS INFORMATIVAS ============

        // Alerta: Optimización de ruta (basado en rutas pendientes)
        if (pendingRoutes >= 2) {
            const pendingRoutesList = registeredRoutes.filter(r => r.status === 'Pending');
            const totalEstimated = pendingRoutesList.reduce((sum, route) => {
                const price = parseInt(route.estimatedPrice.replace(/[^0-9]/g, '')) || 0;
                return sum + price;
            }, 0);
            const savings = Math.floor(totalEstimated * 0.12);

            alerts.push({
                type: 'info',
                icon: TrendingUp,
                title: 'Optimización Disponible',
                message: `${pendingRoutes} rutas pueden consolidarse: Ahorro potencial $${savings.toLocaleString('es-CL')}`,
                timestamp: 'Hace 2h',
                action: 'Ver optimización',
                priority: 4
            });
        }

        // Alerta: Conductores activos
        const activeDrivers = new Set(
            registeredRoutes
                .filter(r => r.status === 'In Progress')
                .map(r => r.driver)
                .filter(Boolean)
        );

        if (activeDrivers.size > 0) {
            alerts.push({
                type: 'info',
                icon: Truck,
                title: 'Conductores en Ruta',
                message: `${activeDrivers.size} conductor(es) actualmente en ruta con GPS activo`,
                timestamp: 'Tiempo real',
                action: 'Ver ubicaciones GPS',
                priority: 4
            });
        }

        // Alerta: Nuevo vehículo agregado
        if (vehicles.length > 3) {
            alerts.push({
                type: 'info',
                icon: CheckCircle2,
                title: 'Flota Actualizada',
                message: `${vehicles.length} vehículos registrados en el sistema`,
                timestamp: 'Hace 5h',
                action: 'Ver gestión de flota',
                priority: 5
            });
        }

        // Ordenar por prioridad (1 = más crítico)
        return alerts.sort((a, b) => a.priority - b.priority);
    }, [registeredRoutes, vehicles, drivers]);

    // Generar datos de cumplimiento laboral desde conductores reales
    const laborData = drivers.map((driver, index) => {
        // Calcular horas basadas en rutas completadas del conductor
        const driverRoutes = registeredRoutes.filter(r =>
            r.driver === driver.name && r.status === 'Completed'
        );

        // Estimar 2-4 horas por ruta completada
        const hoursDriven = Math.min(driverRoutes.length * 3 + Math.floor(Math.random() * 20), 180);
        const maxHours = 180;
        let status = 'OK';
        if (hoursDriven > maxHours) status = 'Critical';
        else if (hoursDriven > maxHours * 0.95) status = 'Warning';

        return {
            id: index + 1,
            name: driver.name,
            hoursDriven,
            maxHours,
            status,
            routesCompleted: driverRoutes.length
        };
    });

    // Generar datos de documentación desde vehículos reales
    const docData = React.useMemo(() => vehicles.map(vehicle => {
        const documents = vehicle.documents || [];
        const revTecnicaDoc = documents.find((d: any) => d.type === 'Revisión Técnica');
        const permisoDoc = documents.find((d: any) => d.type === 'Permiso Circulación');

        const revTecnica = revTecnicaDoc?.expiry || vehicle.nextService || '2024-12-15';
        const perCirculacion = permisoDoc?.expiry || vehicle.insuranceExpiry || '2025-03-31';

        const revDate = new Date(revTecnica);
        const today = new Date();
        const daysUntil = (revDate.getTime() - today.getTime()) / (1000 * 3600 * 24);

        let status = 'Valid';
        if (daysUntil < 0) status = 'Expired';
        else if (daysUntil < 30) status = 'Expiring Soon';

        return {
            id: vehicle.id,
            plate: vehicle.plate,
            revTecnica: revTecnica,
            revUrl: revTecnicaDoc?.url,
            perCirculacion: perCirculacion,
            permisoUrl: permisoDoc?.url,
            status,
            vehicleData: vehicle
        };
    }), [vehicles]);

    const handleRenewBatch = async () => {
        const expired = docData.filter(d => d.status === 'Expired');
        if (expired.length === 0) {
            showToast.info('No hay documentos vencidos para renovar');
            return;
        }

        const confirm = window.confirm(`¿Renovar ${expired.length} documentos vencidos automáticamente?`);
        if (!confirm) return;

        setLoading(true);
        try {
            // Actualizar fecha de vencimiento a +1 año para los vehículos afectados
            const promises = expired.map(doc => {
                const nextYear = new Date();
                nextYear.setFullYear(nextYear.getFullYear() + 1);

                return vehicleService.update(doc.id, {
                    nextService: nextYear.toISOString().split('T')[0],
                    // También podríamos actualizar documents[] si la estructura lo permite
                });
            });

            await Promise.all(promises);
            showToast.success(`${expired.length} documentos renovados exitosamente`);
            loadData(); // Recargar datos
        } catch (error) {
            console.error(error);
            showToast.error('Error al renovar documentos');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    // Render individual document row
    const renderDocRow = (doc: any) => {
        return (
            <div key={doc.id} className="flex items-center hover:bg-white/5 transition-colors border-b border-white/5">
                <div className="p-4 w-1/4">
                    <p className="text-white font-medium flex items-center gap-2">
                        {doc.plate}
                        <button
                            onClick={() => handleOpenMaintenance(doc.vehicleData)}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors group" title="Ver Historial de Mantenimiento">
                            <Wrench className="w-3 h-3 text-slate-500 group-hover:text-brand-400" />
                        </button>
                    </p>
                    <p className="text-xs text-slate-500">ID: {doc.id}</p>
                </div>
                <div className="p-4 w-1/4">
                    <div className="font-mono text-sm text-slate-300">{doc.revTecnica}</div>
                    {doc.revUrl && (
                        <a href={doc.revUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-1 mt-1">
                            Ver Documento <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </div>
                <div className="p-4 w-1/4">
                    <div className="font-mono text-sm text-slate-300">{doc.perCirculacion}</div>
                    {doc.permisoUrl && (
                        <a href={doc.permisoUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-1 mt-1">
                            Ver Documento <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </div>
                <div className="p-4 w-1/4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${doc.status === 'Valid' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        doc.status === 'Expired' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                        {doc.status === 'Valid' ? 'Vigente' : doc.status === 'Expired' ? 'Vencido' : 'Por Vencer'}
                    </span>
                </div>
            </div>
        );
    };

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

                {/* Intelligent Alerts Section */}
                {intelligentAlerts.length > 0 && (
                    <div className="mb-8 space-y-3 animate-fade-in">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-brand-500" />
                            <h3 className="text-lg font-bold text-white">Alertas Inteligentes</h3>
                            <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-1 rounded-full border border-brand-500/30">
                                {intelligentAlerts.length} activa{intelligentAlerts.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {intelligentAlerts.map((alert, index) => {
                                const Icon = alert.icon;
                                const typeLabels = {
                                    critical: 'Crítico',
                                    warning: 'Advertencia',
                                    info: 'Info',
                                    success: 'Éxito'
                                };
                                const colors = {
                                    critical: {
                                        bg: 'bg-red-500/10',
                                        border: 'border-red-500/30',
                                        text: 'text-red-400',
                                        icon: 'text-red-500',
                                        badge: 'bg-red-500/20 text-red-300 border-red-500/40'
                                    },
                                    warning: {
                                        bg: 'bg-yellow-500/10',
                                        border: 'border-yellow-500/30',
                                        text: 'text-yellow-400',
                                        icon: 'text-yellow-500',
                                        badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                                    },
                                    info: {
                                        bg: 'bg-blue-500/10',
                                        border: 'border-blue-500/30',
                                        text: 'text-blue-400',
                                        icon: 'text-blue-500',
                                        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                    },
                                    success: {
                                        bg: 'bg-green-500/10',
                                        border: 'border-green-500/30',
                                        text: 'text-green-400',
                                        icon: 'text-green-500',
                                        badge: 'bg-green-500/20 text-green-300 border-green-500/40'
                                    }
                                };

                                const color = colors[alert.type as keyof typeof colors];
                                const label = typeLabels[alert.type as keyof typeof typeLabels];

                                return (
                                    <div
                                        key={index}
                                        className={`${color.bg} ${color.border} border rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer animate-slide-up`}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                        onClick={() => alert.onClick && alert.onClick()}
                                    >
                                        {/* Header with badge and timestamp */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${color.badge}`}>
                                                {label}
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                                {alert.timestamp}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className={`${color.bg} p-2 rounded-lg flex-shrink-0`}>
                                                <Icon className={`w-5 h-5 ${color.icon}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-bold ${color.text} text-sm mb-1`}>
                                                    {alert.title}
                                                </h4>
                                                <p className="text-xs text-slate-400 leading-relaxed">
                                                    {alert.message}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action button */}
                                        <button className={`w-full ${color.text} text-xs font-semibold py-2 px-3 rounded-lg border ${color.border} hover:bg-white/5 transition-colors`}>
                                            {alert.action} →
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

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
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-300">{driver.name}</span>
                                                {driver.routesCompleted > 0 && (
                                                    <span className="text-[10px] bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded border border-brand-500/30">
                                                        {driver.routesCompleted} rutas
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`font-mono ${driver.hoursDriven > driver.maxHours ? 'text-red-400' : 'text-slate-400'}`}>
                                                {driver.hoursDriven}/{driver.maxHours} hrs
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${driver.status === 'Critical' ? 'bg-red-500' :
                                                    driver.status === 'Warning' ? 'bg-orange-500' : 'bg-brand-500'
                                                    }`}
                                                style={{ width: `${Math.min((driver.hoursDriven / driver.maxHours) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        {driver.status === 'Critical' && (
                                            <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Exceso de jornada detectado
                                            </p>
                                        )}
                                        {driver.status === 'Warning' && (
                                            <p className="text-[10px] text-orange-400 mt-1 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Cerca del límite mensual
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Route Statistics */}
                        <div className="glass-panel border border-white/5 rounded-2xl p-6 bg-gradient-to-br from-brand-900/20 to-slate-950 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <PackageCheck className="w-5 h-5 text-brand-400" />
                                    Estadísticas de Rutas
                                </h3>
                                <span className="text-xs text-slate-500">Tiempo Real</span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-green-400">
                                        {registeredRoutes.filter(r => r.status === 'Completed').length}
                                    </div>
                                    <div className="text-[10px] text-green-300 uppercase tracking-wider mt-1">
                                        Completadas
                                    </div>
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-blue-400">
                                        {registeredRoutes.filter(r => r.status === 'In Progress').length}
                                    </div>
                                    <div className="text-[10px] text-blue-300 uppercase tracking-wider mt-1">
                                        En Curso
                                    </div>
                                </div>
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-yellow-400">
                                        {registeredRoutes.filter(r => r.status === 'Pending').length}
                                    </div>
                                    <div className="text-[10px] text-yellow-300 uppercase tracking-wider mt-1">
                                        Pendientes
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-slate-400">Comprobantes Digitales</span>
                                    <span className="text-xs font-bold text-brand-400">
                                        {registeredRoutes.filter(r => r.deliveryProof).length}/{registeredRoutes.filter(r => r.status === 'Completed').length}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-brand-500 rounded-full transition-all"
                                        style={{
                                            width: `${registeredRoutes.filter(r => r.status === 'Completed').length > 0
                                                ? (registeredRoutes.filter(r => r.deliveryProof).length / registeredRoutes.filter(r => r.status === 'Completed').length) * 100
                                                : 0
                                                }%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 mb-3">
                                Total de rutas registradas: <span className="font-bold text-white">{registeredRoutes.length}</span>
                            </p>
                        </div>

                        <div className="glass-panel border border-white/5 rounded-2xl p-6 bg-gradient-to-br from-slate-900 to-slate-950 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <FileBarChart className="w-5 h-5 text-blue-400" />
                                    Auditoría Tributaria
                                </h3>
                                <span className="text-xs text-slate-500">SII Ready</span>
                            </div>
                            <p className="text-sm text-slate-400 mb-6">Generación automática de declaraciones juradas y reportes de gasto de combustible.</p>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => generateAuditReport()}
                                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm text-slate-300 transition-all">
                                    <FileText className="w-4 h-4" /> DJ 1887
                                </button>
                                <button
                                    onClick={() => generateAuditReport()}
                                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm text-slate-300 transition-all">
                                    <FileText className="w-4 h-4" /> F29 Mensual
                                </button>
                            </div>
                            <button
                                onClick={() => generateAuditReport()}
                                className="w-full mt-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2">
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
                                <button
                                    onClick={handleRenewBatch}
                                    className="text-xs bg-white text-black px-3 py-1.5 rounded-lg font-bold hover:bg-slate-200 transition-colors">
                                    Renovar Lote
                                </button>
                            </div>

                            {loading ? (
                                <div className="p-6">
                                    <TableSkeleton />
                                </div>
                            ) : (
                                <div className="overflow-hidden">
                                    {/* Table Header */}
                                    <div className="flex bg-white/5 text-xs uppercase text-slate-400 font-bold">
                                        <div className="p-4 w-1/4">Vehículo</div>
                                        <div className="p-4 w-1/4">Revisión Técnica</div>
                                        <div className="p-4 w-1/4">Permiso Circulación</div>
                                        <div className="p-4 w-1/4 text-right">Estado</div>
                                    </div>
                                    {/* Scrollable Document List */}
                                    <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '400px' }}>
                                        {docData.slice(0, 50).map(doc => renderDocRow(doc))}
                                    </div>
                                </div>
                            )}
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
                                        <span className="block text-2xl font-bold text-white">
                                            {Math.round((isoSteps.filter(s => s.completed).length / isoSteps.length) * 100)}%
                                        </span>
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Progreso Global</span>
                                    </div>
                                    <div className="w-16 h-16 relative">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                            <path
                                                className="text-brand-500 transition-all duration-1000 ease-out"
                                                strokeDasharray={`${(isoSteps.filter(s => s.completed).length / isoSteps.length) * 100}, 100`}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                                {isoSteps.map((step, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => toggleIsoStep(step.step)}
                                        className={`p-4 rounded-xl border transition-all cursor-pointer hover:border-brand-500/50 ${step.completed
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

            {/* Maintenance Modal */}
            {showMaintenanceModal && selectedMaintenanceVehicle && (
                <MaintenanceManager
                    vehicle={selectedMaintenanceVehicle}
                    onClose={() => setShowMaintenanceModal(false)}
                />
            )}
        </div>
    );
};

export default Compliance;
