// Error Messages Centralized

export const ERROR_MESSAGES = {
    // Required Fields
    REQUIRED: (field: string) => `${field} es requerido`,

    // RUT Errors
    RUT_REQUIRED: "RUT es requerido. Formato: 12345678-9",
    RUT_TOO_SHORT: "RUT es muy corto. Debe tener al menos 7 dígitos",
    RUT_INVALID_FORMAT: "Formato de RUT inválido. Use: 12345678-9",
    RUT_INVALID_DV: (expected: string) => `Dígito Verificador inválido. Debería ser ${expected}`,

    // Plate Errors
    PLATE_REQUIRED: "Patente es requerida",
    PLATE_INVALID: "Formato de patente inválido. Use: XX-YY-12 o XXXX-12",

    // Email Errors
    EMAIL_REQUIRED: "Email es requerido",
    EMAIL_INVALID: "Email inválido. Ejemplo: usuario@ejemplo.com",

    // Number Errors
    NUMBER_REQUIRED: (field: string) => `${field} es requerido`,
    NUMBER_INVALID: (field: string) => `${field} debe ser un número`,
    NUMBER_POSITIVE: (field: string) => `${field} debe ser positivo`,
    NUMBER_RANGE: (field: string, min: number, max: number) =>
        `${field} debe estar entre ${min} y ${max}`,

    // Date Errors
    DATE_REQUIRED: (field: string) => `${field} es requerida`,
    DATE_PAST: (field: string) => `${field} no puede ser en el pasado`,
    DATE_FUTURE: (field: string) => `${field} no puede ser en el futuro`,

    // Phone Errors
    PHONE_REQUIRED: "Teléfono es requerido",
    PHONE_INVALID: "Teléfono inválido. Debe tener 8 o 9 dígitos",
    PHONE_MOBILE_FORMAT: "Número móvil debe comenzar con 9",

    // Length Errors
    MIN_LENGTH: (field: string, length: number) =>
        `${field} debe tener al menos ${length} caracteres`,
    MAX_LENGTH: (field: string, length: number) =>
        `${field} no debe exceder ${length} caracteres`,

    // Vehicle Errors
    VEHICLE_MODEL_REQUIRED: "Modelo de vehículo es requerido",
    VEHICLE_MILEAGE_INVALID: "Kilometraje debe ser un número positivo",
    VEHICLE_FUEL_RANGE: "Nivel de combustible debe estar entre 0 y 100%",

    // Driver Errors
    DRIVER_NAME_REQUIRED: "Nombre del conductor es requerido",
    DRIVER_LICENSE_REQUIRED: "Tipo de licencia es requerido",
    DRIVER_LICENSE_EXPIRY_REQUIRED: "Fecha de vencimiento de licencia es requerida",
    DRIVER_LICENSE_EXPIRED: "La licencia está vencida",

    // Route Errors
    ROUTE_ORIGIN_REQUIRED: "Origen es requerido",
    ROUTE_DESTINATION_REQUIRED: "Destino es requerido",
    ROUTE_DISTANCE_REQUIRED: "Distancia es requerida",
    ROUTE_DISTANCE_POSITIVE: "Distancia debe ser mayor a 0",
    ROUTE_QUOTE_REQUIRED: "Cotización del cliente es requerida",
    ROUTE_QUOTE_POSITIVE: "Cotización debe ser mayor a 0",
    ROUTE_LOW_MARGIN: (margin: number) =>
        `⚠️ Margen de utilidad bajo: ${margin}%. Se recomienda al menos 15%`,

    // Cargo Errors
    CARGO_DESCRIPTION_REQUIRED: "Descripción de carga es requerida",
    CARGO_DESCRIPTION_MIN: "Descripción debe tener al menos 10 caracteres para mejor análisis",
    CARGO_WEIGHT_POSITIVE: "Peso de carga debe ser positivo",

    // General Errors
    FORM_INCOMPLETE: "Por favor completa todos los campos requeridos",
    SAVE_ERROR: "Error al guardar. Por favor intenta nuevamente",
    DELETE_CONFIRM: "¿Estás seguro de que deseas eliminar este elemento?",
    NETWORK_ERROR: "Error de conexión. Verifica tu internet",
    AI_ERROR: "Error al consultar Gemini AI. Intenta nuevamente",
};

export const SUCCESS_MESSAGES = {
    // Vehicle Messages
    VEHICLE_CREATED: "✅ Vehículo creado exitosamente",
    VEHICLE_UPDATED: "✅ Vehículo actualizado exitosamente",
    VEHICLE_DELETED: "🗑️ Vehículo eliminado",

    // Driver Messages
    DRIVER_CREATED: "✅ Conductor creado exitosamente",
    DRIVER_UPDATED: "✅ Conductor actualizado exitosamente",
    DRIVER_DELETED: "🗑️ Conductor eliminado",

    // Route Messages
    ROUTE_CALCULATED: "✅ Ruta calculada exitosamente",
    ROUTE_SAVED: "✅ Ruta guardada exitosamente",

    // Quote Messages
    QUOTE_GENERATED: "✅ Cotización generada exitosamente",

    // General Messages
    SAVE_SUCCESS: "✅ Guardado exitosamente",
    UPDATE_SUCCESS: "✅ Actualizado exitosamente",
    DELETE_SUCCESS: "🗑️ Eliminado exitosamente",
};

export const WARNING_MESSAGES = {
    LOW_FUEL: (level: number) => `⚠️ Nivel de combustible bajo: ${level}%`,
    LICENSE_EXPIRING: (days: number) => `⚠️ Licencia vence en ${days} días`,
    MAINTENANCE_DUE: "⚠️ Mantenimiento próximo",
    LOW_PROFIT_MARGIN: (margin: number) => `⚠️ Margen de utilidad bajo: ${margin}%`,
    INCOMPLETE_FORM: "⚠️ Completa todos los campos requeridos",
};

export const INFO_MESSAGES = {
    LOADING: "Cargando...",
    SAVING: "Guardando...",
    CALCULATING: "Calculando...",
    ANALYZING: "Analizando con Gemini AI...",
    PROCESSING: "Procesando...",
};

export default {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    WARNING_MESSAGES,
    INFO_MESSAGES,
};
