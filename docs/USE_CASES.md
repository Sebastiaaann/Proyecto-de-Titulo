# Casos de Uso del Sistema - FletesM

## 1. Introducción
Este documento detalla los Casos de Uso (CU) principales del sistema, definiendo la interacción entre los actores y la plataforma FletesM.

## 2. Actores
*   **Administrador (Dueño de Flota):** Acceso total al sistema.
*   **Conductor:** Acceso limitado a sus rutas asignadas y registro de gastos.

## 3. Detalle de Casos de Uso

### CU-01: Acceso al Sistema (Login)
**Descripción:** Permite a los usuarios autenticarse para acceder a las funcionalidades del sistema según su rol.

*   **Actores:** Administrador, Conductor.
*   **Precondiciones:** El usuario debe estar registrado en la base de datos (Auth).
*   **Flujo Principal:**
    1.  El usuario accede a la página de inicio.
    2.  El sistema solicita Credenciales (Correo Electrónico y Contraseña).
    3.  El usuario ingresa los datos.
    4.  El sistema valida las credenciales contra el servicio de identidad (Supabase Auth).
    5.  Si son correctas, el sistema genera un Token (JWT) de sesión.
    6.  El sistema redirige al usuario al Dashboard principal.
*   **Flujo Alternativo (Credenciales Inválidas):**
    *   En el paso 4, si la validación falla, el sistema muestra un mensaje de error: "Correo o contraseña incorrectos".
    *   El usuario permanece en la pantalla de Login para reintentar.
*   **Postcondiciones:** El usuario tiene una sesión activa y acceso a los menús correspondientes a su perfil.

### CU-02: Asignación de Ruta
*(Detalle disponible en documentación previa...)*

### CU-03: Registro de Mantenimiento
*(Detalle disponible en documentación previa...)*
