# Gestión de Cambios y Mejoras - FletesM

## 1. Objetivo
Definir el flujo de trabajo para abordar cambios en el software, asegurando que las modificaciones, correcciones de errores o nuevas funcionalidades se implementen de manera controlada y segura.

## 2. Tipos de Cambios
*   **Correctivo (Bug):** Error en el código que afecta la operación (Crítico/Alto).
*   **Evolutivo (Mejora):** Nueva funcionalidad o mejora estética (Medio/Bajo).
*   **Adaptativo:** Cambios por actualizaciones de terceros o normativas.

## 3. Flujo del Proceso (Diagrama)

```mermaid
graph TD
    A[Inicio: Solicitud de Cambio/Reporte Bug] --> B{¿Es un Error Crítico?}
    
    B -- SI --> C[Clasificación: PRIORIDAD ALTA]
    B -- NO --> D[Clasificación: Mejora / Backlog]
    
    C --> E[Análisis y Reproducción del Error]
    D --> F[Evaluación de Impacto y Esfuerzo]
    
    E --> G[Desarrollo de Hotfix (Rama fix/)]
    F --> H[Planificación en Sprint (Rama feature/)]
    
    G --> I[Pruebas Unitarias y QA]
    H --> I
    
    I --> J{¿Pruebas Aprobadas?}
    
    J -- NO --> K[Corregir y Reintentar]
    K --> I
    
    J -- SI --> L[Merge a Rama Principal (Main)]
    
    L --> M[Despliegue a Producción]
    M --> N[Verificación Post-Deploy]
    N --> O[Cierre del Ticket]
```

## 4. Descripción del Flujo

1.  **Solicitud:** Se origina por un usuario (ticket soporte) o el equipo técnico.
2.  **Clasificación:** Se decide si requiere acción inmediata (Hotfix) o planificación.
3.  **Desarrollo:** Se utiliza Gitflow (ramas separadas) para no afectar producción.
4.  **Pruebas:** Ningún cambio pasa a producción sin validación (Test Plan).
5.  **Despliegue:** Actualización del entorno productivo.
