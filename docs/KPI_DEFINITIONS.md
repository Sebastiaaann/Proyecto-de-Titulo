# Definición de KPIs y Métricas - FletesM

## 1. Tasa de Errores (Error Rate)

**Objetivo:** Mantener la tasa de errores de la aplicación por debajo del 20% (según auditoría, aunque el estándar de industria es <1%).
**Meta del Proyecto:** < 5% de solicitudes fallidas.

### Método de Medición Técnico
Se implementará un monitoreo a nivel de API y Cliente:

*   **Fórmula:** `(Total Solicitudes Fallidas (5xx + 4xx inesperados) / Total Solicitudes) * 100`
*   **Herramienta:** `databaseService` interceptores y `showToast.error` tracking.
*   **Frecuencia:** Mensual.

### Plan de Acción
1.  Registro automático de excepciones en tabla `system_logs` (propuesta).
2.  Monitoreo de "Crash-Free Users" mediante logs de cliente.

## 2. Tiempo de Actividad (Uptime)

**Objetivo:** Garantizar disponibilidad operativa para gestión de flota.
**Meta:** 99.9% (SLA Estándar).

### Método de Medición Técnico
*   **Fórmula:** `(Tiempo Total - Tiempo Caída) / Tiempo Total * 100`
*   **Herramienta:** Pingdom / UptimeRobot apuntando a la URL del Login.
*   **Verificación:** Health Check endpoint `/api/health` (simulado en Supabase `select count(*) from vehicles`).

## 3. Ahorro de Costos

**Objetivo:** Reducir costos operativos en un 15%.
**Meta:** 15% reducción vs línea base histórica.

### Método de Medición
Comparativa mensual automática en módulo Financiero:
*   **Fórmula:** `(Gasto_Mes_Anterior - Gasto_Mes_Actual) / Gasto_Mes_Anterior * 100`
*   **Fuente de Datos:** Tabla `Transactions` (Unified Income/Expense).
*   **Reporte:** Dashboard Financiero > Reporte IA "Oportunidad de Ahorro".
