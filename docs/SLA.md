# Acuerdo de Nivel de Servicio (SLA) - FletesM

## 1. Introducción
Este documento define los niveles de servicio garantizados para la plataforma FletesM, asegurando la calidad y disponibilidad para la gestión de flotas y transporte.

## 2. Disponibilidad del Servicio

### 2.1 Compromiso de Uptime
FletesM se compromete a una disponibilidad mensual del **99.9%** durante el horario comercial (Lunes a Viernes, 08:00 - 19:00 hrs).

*   **Uptime 99.9%**: Permite aprox. 43 minutos de inactividad mensual.
*   **Mantenimiento Programado**: Se notificará con 48 horas de antelación y se realizará fuera de horario comercial (Sábados 22:00 - Domingo 06:00).

### 2.2 Monitoreo
La disponibilidad se mide mediante pings automáticos cada 5 minutos al endpoint de Health Check.

## 3. Rendimiento y Tiempos de Respuesta

*   **Carga de Pantalla**: < 2 segundos para el 90% de las solicitudes.
*   **Procesamiento de Transacciones**: < 1 segundo para creación de registros (CRUD).
*   **Generación de Reportes IA**: < 10 segundos.

## 4. Soporte Técnico

### 4.1 Canales de Atención
*   Email: soporte@fletesm.cl
*   Teléfono: +56 9 1234 5678 (Solo Emergencias)

### 4.2 Tiempos de Respuesta por Severidad

| Severidad | Descripción | Tiempo de Respuesta (Primer Contacto) | Tiempo de Resolución Objetivo |
| :--- | :--- | :--- | :--- |
| **Crítica** | Sistema caído, pérdida de datos, imposibilidad de facturar. | < 1 hora | < 4 horas |
| **Alta** | Funcionalidad principal degradada (ej. GPS lento). | < 4 horas | < 24 horas |
| **Media** | Errores menores, dudas funcionales. | < 24 horas | < 48 horas |
| **Baja** | Solicitudes de mejora, cambios estéticos. | < 48 horas | Próximo Release |

## 5. Penalizaciones
En caso de incumplimiento del Uptime garantizado, se aplicarán créditos de servicio proporcionales al tiempo de inactividad excedente.
