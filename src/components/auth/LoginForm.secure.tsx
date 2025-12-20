/**
 * LoginForm Component - Versión Mejorada con Seguridad Reforzada
 * 
 * Mejoras implementadas según auditoría de seguridad:
 * - Validación robusta de email
 * - Validación de contraseña fuerte
 * - Rate limiting frontend
 * - Mensajes de error genéricos
 * - Logs solo en desarrollo
 */

import React, { useState, useEffect } from 'react';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { showToast } from '@components/common/Toast';

// Constantes de seguridad
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos
const MIN_PASSWORD_LENGTH = 8;

// Utilidades de validación
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePasswordStrength = (password: string): {
  isValid: boolean;
  message?: string;
} => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      isValid: false,
      message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
    };
  }

  // Verificar complejidad: al menos 1 mayúscula, 1 minúscula, 1 número
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return {
      isValid: false,
      message: 'La contraseña debe contener mayúsculas, minúsculas y números',
    };
  }

  return { isValid: true };
};

// Hook personalizado para rate limiting
const useRateLimiting = () => {
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);

  useEffect(() => {
    // Recuperar del localStorage
    const stored = localStorage.getItem('login_attempts');
    if (stored) {
      const { attempts, lockout } = JSON.parse(stored);
      setFailedAttempts(attempts);
      if (lockout) {
        setLockoutUntil(new Date(lockout));
      }
    }
  }, []);

  const isLockedOut = (): boolean => {
    if (!lockoutUntil) return false;
    const now = new Date();
    return now < lockoutUntil;
  };

  const recordFailedAttempt = () => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockout = new Date(Date.now() + LOCKOUT_DURATION_MS);
      setLockoutUntil(lockout);
      localStorage.setItem(
        'login_attempts',
        JSON.stringify({ attempts: newAttempts, lockout: lockout.toISOString() })
      );
    } else {
      localStorage.setItem(
        'login_attempts',
        JSON.stringify({ attempts: newAttempts, lockout: null })
      );
    }
  };

  const resetAttempts = () => {
    setFailedAttempts(0);
    setLockoutUntil(null);
    localStorage.removeItem('login_attempts');
  };

  const getRemainingTime = (): string => {
    if (!lockoutUntil) return '';
    const now = new Date();
    const diff = lockoutUntil.getTime() - now.getTime();
    const minutes = Math.ceil(diff / 60000);
    return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
  };

  return {
    failedAttempts,
    isLockedOut: isLockedOut(),
    recordFailedAttempt,
    resetAttempts,
    getRemainingTime,
  };
};

export const LoginFormSecure: React.FC = () => {
  const { signInWithEmail, loading } = useAuth();
  const {
    failedAttempts,
    isLockedOut,
    recordFailedAttempt,
    resetAttempts,
    getRemainingTime,
  } = useRateLimiting();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Validación en tiempo real
  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Por favor ingresa un email válido');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordBlur = () => {
    if (password) {
      const validation = validatePasswordStrength(password);
      if (!validation.isValid) {
        setPasswordError(validation.message || '');
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar lockout
    if (isLockedOut) {
      showToast.error(
        'Cuenta temporalmente bloqueada',
        `Demasiados intentos fallidos. Intenta en ${getRemainingTime()}`
      );
      return;
    }

    // Validaciones pre-submit
    if (!email || !password) {
      showToast.error('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }

    if (!validateEmail(email)) {
      showToast.error('Email inválido', 'Por favor ingresa un email válido');
      return;
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      showToast.error('Contraseña inválida', passwordValidation.message || '');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signInWithEmail(email, password);

      if (error) {
        // Registro de intento fallido
        recordFailedAttempt();

        // Log solo en desarrollo
        if (import.meta.env.DEV) {
          console.error('Login failed:', error.code);
        }

        // Mensaje genérico de error (no revela información)
        showToast.error(
          'Error de autenticación',
          'Email o contraseña incorrectos. Por favor verifica tus credenciales.'
        );

        // Warning después de varios intentos
        if (failedAttempts >= 3) {
          showToast.warning(
            'Atención',
            `Te quedan ${MAX_LOGIN_ATTEMPTS - failedAttempts - 1} intentos antes del bloqueo temporal`
          );
        }

        return;
      }

      // Login exitoso - resetear contador
      resetAttempts();
      showToast.success('¡Bienvenido!', 'Iniciando sesión...');

      // Limpiar formulario
      setEmail('');
      setPassword('');
      setEmailError('');
      setPasswordError('');
    } catch (err) {
      // Log solo en desarrollo
      if (import.meta.env.DEV) {
        console.error('Unexpected error:', err);
      }

      // En producción, enviar a servicio de logging (Sentry, etc.)
      if (import.meta.env.PROD) {
        // logToSentry({ level: 'error', message: 'Login error' });
      }

      showToast.error('Error del sistema', 'Por favor intenta nuevamente más tarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Warning de intentos fallidos */}
      {failedAttempts > 0 && !isLockedOut && (
        <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-300">
            <span className="font-semibold">Atención:</span> Has tenido {failedAttempts}{' '}
            intento{failedAttempts > 1 ? 's' : ''} fallido
            {failedAttempts > 1 ? 's' : ''}. Te quedan{' '}
            {MAX_LOGIN_ATTEMPTS - failedAttempts} antes del bloqueo temporal.
          </div>
        </div>
      )}

      {/* Lockout warning */}
      {isLockedOut && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-300">
            <span className="font-semibold">Cuenta bloqueada temporalmente.</span> Por
            seguridad, debes esperar {getRemainingTime()} antes de intentar nuevamente.
          </div>
        </div>
      )}

      {/* Email Input */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
          Correo Electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-slate-500" />
          </div>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            onBlur={handleEmailBlur}
            className={`block w-full pl-12 pr-4 py-3 bg-dark-900 border ${emailError ? 'border-red-500' : 'border-white/10'
              } rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 ${emailError ? 'focus:ring-red-500' : 'focus:ring-brand-500'
              } focus:border-transparent transition-all duration-200 hover:border-white/20`}
            placeholder="tu@email.com"
            disabled={isSubmitting || loading || isLockedOut}
            autoComplete="email"
          />
        </div>
        {emailError && <p className="mt-2 text-sm text-red-400">{emailError}</p>}
      </div>

      {/* Password Input */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-300 mb-2"
        >
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-slate-500" />
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError('');
            }}
            onBlur={handlePasswordBlur}
            className={`block w-full pl-12 pr-4 py-3 bg-dark-900 border ${passwordError ? 'border-red-500' : 'border-white/10'
              } rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 ${passwordError ? 'focus:ring-red-500' : 'focus:ring-brand-500'
              } focus:border-transparent transition-all duration-200 hover:border-white/20`}
            placeholder="••••••••"
            disabled={isSubmitting || loading || isLockedOut}
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="current-password"
          />
        </div>
        {passwordError && <p className="mt-2 text-sm text-red-400">{passwordError}</p>}
      </div>

      {/* Remember me & Forgot password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 bg-dark-900 border-white/10 rounded text-brand-500 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
            disabled={isLockedOut}
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-slate-400 cursor-pointer"
          >
            Recordarme
          </label>
        </div>

        <button
          type="button"
          className="text-sm text-brand-500 hover:text-brand-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() =>
            showToast.info(
              'Función próximamente',
              'La recuperación de contraseña estará disponible pronto'
            )
          }
          disabled={isLockedOut}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || loading || isLockedOut}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold rounded-xl hover:from-brand-700 hover:to-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-dark-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30"
      >
        {isSubmitting || loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Iniciando sesión...</span>
          </>
        ) : (
          <span>Iniciar Sesión</span>
        )}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-dark-900 text-slate-500">¿No tienes cuenta?</span>
        </div>
      </div>

      {/* Register Link */}
      <div className="text-center">
        <button
          type="button"
          className="text-sm text-slate-400 hover:text-brand-500 transition-colors disabled:opacity-50"
          onClick={() =>
            showToast.info(
              'Registro próximamente',
              'La funcionalidad de registro estará disponible pronto'
            )
          }
          disabled={isLockedOut}
        >
          Crear cuenta nueva
        </button>
      </div>
    </form>
  );
};

export default LoginFormSecure;
