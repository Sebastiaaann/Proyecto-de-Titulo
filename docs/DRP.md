# Plan de Recuperación ante Desastres (DRP) - FletesM

## 1. Objetivo
Establecer los procedimientos para recuperar la operatividad de FletesM ante incidentes graves, minimizando el tiempo de inactividad (RTO) y la pérdida de datos (RPO).

### Métricas DRP
*   **RTO (Recovery Time Objective):** 4 horas.
*   **RPO (Recovery Point Objective):** 1 hora (pérdida máxima de datos aceptable).

## 2. Escenarios de Riesgo

1.  **Caída de Base de Datos (Supabase outage):** Pérdida de conexión o corrupción de datos.
2.  **Error Crítico de Aplicación (Bug en Deploy):** La aplicación no carga o rompe flujos críticos.
3.  **Ataque Cibernético:** Acceso no autorizado o ransomware.

## 3. Estrategias de Respaldo (Backup)

*   **Base de Datos:**
    *   **Automático:** Point-in-Time Recovery (PITR) activado en Supabase (retención 7 días). Backups diarios completos.
    *   **Manual:** Exportación semnaal de esquemas críticos (JSON/SQL) a almacenamiento en frío (Google Drive Seguro).

*   **Código Fuente:**
    *   Repositorio GitHub con protección de ramas `main`.

## 4. Procedimientos de Recuperación

### 4.1 Recuperación de Base de Datos
En caso de corrupción o pérdida de datos:
1.  **Detección:** Alerta de monitoreo o reporte de usuario.
2.  **Evaluación:** Verificar integridad en Dashboard de Supabase.
3.  **Restauración:**
    *   Ir a Supabase Dashboard > Database > Backups.
    *   Seleccionar punto de restauración (PITR) justo antes del incidente.
    *   Ejecutar Restore.
    *   Verificar integridad de datos clave (Usuarios, Vehículos).

### 4.2 Rollback de Aplicación (Frontend)
En caso de bug crítico en producción:
1.  Identificar commit estable anterior en GitHub.
2.  Ejecutar `git revert [commit-hash]` o volver a desplegar la versión anterior.
3.  Limpiar caché de CDN/Service Workers si es necesario.

## 5. Simulacros y Pruebas
*   Se realizará un simulacro de restauración de base de datos semestralmente.
*   Se verificará la integridad de los backups semanalmente.

## 6. Equipo de Respuesta
*   **Líder de DRP:** CTO / Lead Dev.
*   **Soporte Infraestructura:** DevOps Team.
