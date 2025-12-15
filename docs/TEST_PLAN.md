# Plan de Pruebas - FletesM

## 1. Alcance
Validación de los módulos críticos y correcciones implementadas post-auditoría:
*   Gestión de Conductores y Vehículos (Nuevos campos).
*   Módulo de Mantenimiento (Bitácora).
*   Módulo Financiero (Transacciones unificadas).
*   Seguridad (Login).

## 2. Estrategia de Pruebas
Dada la naturaleza del proyecto, se realizarán pruebas manuales funcionales (Black Box) y pruebas de integración de servicios.

## 3. Casos de Prueba

### 3.1 Módulo de Conductores (Generalización)
| ID | Caso de Prueba | Pasos | Resultado Esperado | Prioridad |
| :--- | :--- | :--- | :--- | :--- |
| TC-01 | Crear Conductor | 1. Ir a Gestión de Equipo > Conductores.<br>2. Click "Agregar".<br>3. Llenar Nombre, RUT, Licencia.<br>4. Guardar. | Conductor creado exitosamente. Se asocia estructura interna correcta. | Alta |
| TC-02 | Validar RUT | 1. Ingresar RUT inválido (ej. 123). | Sistema muestra error de formato. | Media |

### 3.2 Módulo de Vehículos (Activos)
| ID | Caso de Prueba | Pasos | Resultado Esperado | Prioridad |
| :--- | :--- | :--- | :--- | :--- |
| TC-03 | Registrar Seguro | 1. Editar Vehículo.<br>2. Ingresar "Vencimiento Seguro".<br>3. Guardar. | Fecha se persiste y muestra alerta si está próximo a vencer. | Alta |

### 3.3 Módulo de Mantenimiento (Nuevo)
| ID | Caso de Prueba | Pasos | Resultado Esperado | Prioridad |
| :--- | :--- | :--- | :--- | :--- |
| TC-04 | Registrar Mantenimiento | 1. Click ícono herramienta en Vehículo.<br>2. "Registrar Mantenimiento".<br>3. Llenar costo, proveedor, tipo.<br>4. Guardar. | Mantenimiento aparece en historial. Costo se refleja en métricas. | Crítica |

### 3.4 Módulo Financiero (Transacciones)
| ID | Caso de Prueba | Pasos | Resultado Esperado | Prioridad |
| :--- | :--- | :--- | :--- | :--- |
| TC-05 | Registrar Egreso | 1. Ir a Finanzas > Movimientos.<br>2. "Nuevo Movimiento" > Egreso.<br>3. Ingresar monto y categoría.<br>4. Guardar. | Egreso registrado. Balance neto disminuye. | Alta |
| TC-06 | Balance Correcto | 1. Registrar Ingreso $1000.<br>2. Registrar Egreso $400. | Balance muestra +$600. | Alta |

### 3.5 Seguridad
| ID | Caso de Prueba | Pasos | Resultado Esperado | Prioridad |
| :--- | :--- | :--- | :--- | :--- |
| TC-07 | Login Exitoso | 1. Ingresar email/pass correctos. | Redirección a Home. | Crítica |
| TC-08 | Login Fallido | 1. Ingresar pass incorrecto. | Mensaje "Credenciales inválidas". No permite acceso. | Alta |

## 4. Ambiente de Pruebas
*   **Browser:** Chrome (Latest), Edge.
*   **Backend:** Supabase (Dev/Staging en `proyectos/FLETM`).
*   **Dispositivos:** Desktop (1920x1080), Mobile (Simulado).

## 5. Criterios de Aceptación
*   100% de Casos de Prueba Críticos aprobados.
*   0 Errores bloqueantes en el flujo principal.
