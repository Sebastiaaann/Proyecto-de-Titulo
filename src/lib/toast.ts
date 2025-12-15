/**
 * Toast Notification Helpers
 * Wrapper around react-hot-toast with consistent styling and error handling
 */

import toast from 'react-hot-toast';
import { getErrorMessage, logError } from './errors';

/**
 * Toast configuration
 */
const TOAST_CONFIG = {
    duration: 4000,
    position: 'top-right' as const,
    style: {
        borderRadius: '8px',
        fontSize: '14px',
    },
};

/**
 * Success toast
 */
export function showSuccess(message: string, description?: string): void {
    const fullMessage = description ? `${message}\n${description}` : message;

    toast.success(fullMessage, {
        ...TOAST_CONFIG,
        icon: '✅',
        style: {
            ...TOAST_CONFIG.style,
            background: '#10b981',
            color: '#fff',
        },
    });
}

/**
 * Error toast with automatic error message extraction
 */
export function showError(error: unknown, context?: string): void {
    const message = getErrorMessage(error);
    logError(error, context);

    toast.error(message, {
        ...TOAST_CONFIG,
        duration: 5000,
        icon: '❌',
        style: {
            ...TOAST_CONFIG.style,
            background: '#ef4444',
            color: '#fff',
        },
    });
}

/**
 * Warning toast
 */
export function showWarning(message: string, description?: string): void {
    const fullMessage = description ? `${message}\n${description}` : message;

    toast(fullMessage, {
        ...TOAST_CONFIG,
        icon: '⚠️',
        style: {
            ...TOAST_CONFIG.style,
            background: '#f59e0b',
            color: '#fff',
        },
    });
}

/**
 * Info toast
 */
export function showInfo(message: string, description?: string): void {
    const fullMessage = description ? `${message}\n${description}` : message;

    toast(fullMessage, {
        ...TOAST_CONFIG,
        icon: 'ℹ️',
        style: {
            ...TOAST_CONFIG.style,
            background: '#3b82f6',
            color: '#fff',
        },
    });
}

/**
 * Loading toast (returns toast id for dismissal)
 */
export function showLoading(message: string = 'Cargando...'): string {
    return toast.loading(message, {
        ...TOAST_CONFIG,
        duration: Infinity,
    });
}

/**
 * Dismiss a specific toast
 */
export function dismissToast(toastId: string): void {
    toast.dismiss(toastId);
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts(): void {
    toast.dismiss();
}

/**
 * Promise toast - shows loading, then success or error
 */
export async function showPromise<T>(
    promise: Promise<T>,
    messages: {
        loading: string;
        success: string;
        error?: string;
    }
): Promise<T> {
    return toast.promise(
        promise,
        {
            loading: messages.loading,
            success: messages.success,
            error: (err) => messages.error || getErrorMessage(err),
        },
        TOAST_CONFIG
    );
}

// Export default object for convenience
export default {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    loading: showLoading,
    dismiss: dismissToast,
    dismissAll: dismissAllToasts,
    promise: showPromise,
};
