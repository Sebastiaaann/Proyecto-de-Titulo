/**
 * Custom Error Classes for FleetM
 * Provides user-friendly error messages and structured error handling
 */

/**
 * Base error class for all FleetM errors
 */
export class FleetMError extends Error {
    constructor(
        message: string,
        public code: string,
        public userMessage: string,
        public details?: unknown
    ) {
        super(message);
        this.name = this.constructor.name;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Database operation errors (Supabase)
 */
export class DatabaseError extends FleetMError {
    constructor(
        message: string,
        code: string = 'DATABASE_ERROR',
        details?: unknown
    ) {
        const userMessage = DatabaseError.getUserMessage(code, message);
        super(message, code, userMessage, details);
    }

    private static getUserMessage(code: string, fallback: string): string {
        const messages: Record<string, string> = {
            '23505': 'Este registro ya existe en la base de datos',
            '23503': 'No se puede eliminar porque está siendo usado por otros registros',
            '42P01': 'Error de configuración de base de datos',
            'PGRST116': 'No se encontró el registro solicitado',
            'PGRST301': 'No tienes permisos para realizar esta operación',
            'DATABASE_ERROR': 'Error al comunicarse con la base de datos',
            'NETWORK_ERROR': 'Error de conexión. Verifica tu internet',
        };

        return messages[code] || fallback || 'Ocurrió un error inesperado en la base de datos';
    }
}

/**
 * Validation errors for form inputs and data
 */
export class ValidationError extends FleetMError {
    constructor(
        message: string,
        public field?: string,
        details?: unknown
    ) {
        super(
            message,
            'VALIDATION_ERROR',
            message, // Validation messages are already user-friendly
            details
        );
    }
}

/**
 * Authentication and authorization errors
 */
export class AuthenticationError extends FleetMError {
    constructor(
        message: string,
        code: string = 'AUTH_ERROR',
        details?: unknown
    ) {
        const userMessage = AuthenticationError.getUserMessage(code);
        super(message, code, userMessage, details);
    }

    private static getUserMessage(code: string): string {
        const messages: Record<string, string> = {
            'invalid_credentials': 'Usuario o contraseña incorrectos',
            'email_not_confirmed': 'Por favor confirma tu email antes de iniciar sesión',
            'user_not_found': 'Usuario no encontrado',
            'session_expired': 'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
            'unauthorized': 'No tienes permisos para realizar esta acción',
            'AUTH_ERROR': 'Error de autenticación',
        };

        return messages[code] || 'Error de autenticación';
    }
}

/**
 * Network and API errors
 */
export class NetworkError extends FleetMError {
    constructor(
        message: string,
        code: string = 'NETWORK_ERROR',
        details?: unknown
    ) {
        super(
            message,
            code,
            'Error de conexión. Por favor verifica tu internet e intenta nuevamente',
            details
        );
    }
}

/**
 * AI Service errors (Gemini)
 */
export class AIServiceError extends FleetMError {
    constructor(
        message: string,
        code: string = 'AI_ERROR',
        details?: unknown
    ) {
        const userMessage = AIServiceError.getUserMessage(code);
        super(message, code, userMessage, details);
    }

    private static getUserMessage(code: string): string {
        const messages: Record<string, string> = {
            'RATE_LIMIT': 'Demasiadas solicitudes. Por favor espera un momento',
            'INVALID_REQUEST': 'Solicitud inválida al servicio de IA',
            'AI_ERROR': 'Error al consultar el servicio de IA. Intenta nuevamente',
        };

        return messages[code] || 'Error en el servicio de IA';
    }
}

/**
 * Type guard to check if error is a FleetM error
 */
export function isFleetMError(error: unknown): error is FleetMError {
    return error instanceof FleetMError;
}

/**
 * Extract user-friendly message from any error
 */
export function getErrorMessage(error: unknown): string {
    if (isFleetMError(error)) {
        return error.userMessage;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'Ocurrió un error inesperado';
}

/**
 * Log error for debugging (can be extended to send to error tracking service)
 */
export function logError(error: unknown, context?: string): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';

    if (isFleetMError(error)) {
        console.error(
            `${timestamp} ${contextStr} ${error.name}:`,
            {
                code: error.code,
                message: error.message,
                userMessage: error.userMessage,
                details: error.details,
                stack: error.stack,
            }
        );
    } else if (error instanceof Error) {
        console.error(`${timestamp} ${contextStr} Error:`, error.message, error.stack);
    } else {
        console.error(`${timestamp} ${contextStr} Unknown error:`, error);
    }
}
