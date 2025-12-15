/**
 * LoginForm Component
 * 
 * Formulario de autenticación con diseño dark mode profesional.
 * Integra con useAuth y sistema de notificaciones Toast.
 */

import React, { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { showToast } from '@components/common/Toast';

export const LoginForm: React.FC = () => {
  const { signInWithEmail, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!email || !password) {
      showToast.error('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signInWithEmail(email, password);

      if (error) {
        // Mensajes de error más amigables
        let errorMessage = 'Credenciales incorrectas';
        let errorDetails = 'Verifica tu email y contraseña';

        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Credenciales inválidas';
          errorDetails = 'El email o la contraseña son incorrectos';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email no confirmado';
          errorDetails = 'Por favor confirma tu email antes de iniciar sesión';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Demasiados intentos';
          errorDetails = 'Por favor espera unos minutos antes de reintentar';
        }

        showToast.error(errorMessage, errorDetails);
        return;
      }

      // Login exitoso
      showToast.success('¡Bienvenido!', 'Iniciando sesión...');
      
      // Limpiar formulario
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Error inesperado en login:', err);
      showToast.error('Error inesperado', 'Por favor intenta nuevamente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Input */}
      <div>
        <label 
          htmlFor="email" 
          className="block text-sm font-medium text-slate-300 mb-2"
        >
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
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 hover:border-white/20"
            placeholder="tu@email.com"
            disabled={isSubmitting || loading}
          />
        </div>
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
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 hover:border-white/20"
            placeholder="••••••••"
            disabled={isSubmitting || loading}
            minLength={6}
          />
        </div>
      </div>

      {/* Forgot Password Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 bg-dark-900 border-white/10 rounded text-brand-500 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400 cursor-pointer">
            Recordarme
          </label>
        </div>

        <button
          type="button"
          className="text-sm text-brand-500 hover:text-brand-400 transition-colors"
          onClick={() => showToast.info('Función próximamente', 'La recuperación de contraseña estará disponible pronto')}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || loading}
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
          className="text-sm text-slate-400 hover:text-brand-500 transition-colors"
          onClick={() => showToast.info('Registro próximamente', 'La funcionalidad de registro estará disponible pronto')}
        >
          Crear cuenta nueva
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
