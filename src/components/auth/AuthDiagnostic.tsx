/**
 * Diagnóstico de Autenticación
 * 
 * Componente temporal para debugging del estado de auth
 * Muestra información detallada sobre la inicialización
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';

export const AuthDiagnostic: React.FC = () => {
  const [status, setStatus] = useState<string>('Inicializando...');
  const [details, setDetails] = useState<any[]>([]);

  useEffect(() => {
    const runDiagnostic = async () => {
      const logs: any[] = [];

      // 1. Verificar variables de entorno
      logs.push({
        step: '1. Variables de entorno',
        status: import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌',
        details: {
          url: import.meta.env.VITE_SUPABASE_URL || 'MISSING',
          hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      });

      // 2. Verificar conexión a Supabase
      try {
        const { data, error } = await supabase.auth.getSession();
        logs.push({
          step: '2. Conexión Supabase',
          status: error ? '❌' : '✅',
          details: error ? error.message : 'Conexión exitosa',
        });
      } catch (error: any) {
        logs.push({
          step: '2. Conexión Supabase',
          status: '❌',
          details: error.message || 'Error desconocido',
        });
      }

      // 3. Verificar tabla profiles
      try {
        const { error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        logs.push({
          step: '3. Tabla profiles',
          status: error ? '❌' : '✅',
          details: error ? `${error.message} (Code: ${error.code})` : 'Tabla existe',
        });
      } catch (error: any) {
        logs.push({
          step: '3. Tabla profiles',
          status: '❌',
          details: error.message || 'Error verificando tabla',
        });
      }

      setDetails(logs);
      setStatus('Diagnóstico completado');
    };

    runDiagnostic();
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-dark-900 border border-white/10 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-4">
          🔍 Diagnóstico de Autenticación
        </h1>
        
        <div className="mb-6">
          <p className="text-slate-400">{status}</p>
        </div>

        <div className="space-y-4">
          {details.map((log, idx) => (
            <div
              key={idx}
              className="bg-dark-950 border border-white/5 rounded p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{log.status}</span>
                <span className="font-semibold text-white">{log.step}</span>
              </div>
              <pre className="text-xs text-slate-400 overflow-auto">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded">
          <h3 className="text-yellow-400 font-semibold mb-2">
            Si ves errores arriba:
          </h3>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>1. Verifica que .env.local tenga las credenciales correctas</li>
            <li>2. Ejecuta el SQL: supabase-auth-setup.sql en Supabase</li>
            <li>3. Verifica que el proyecto de Supabase esté activo</li>
            <li>4. Recarga la página después de arreglar</li>
          </ul>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 w-full px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded transition-colors"
        >
          🔄 Recargar Página
        </button>
      </div>
    </div>
  );
};
