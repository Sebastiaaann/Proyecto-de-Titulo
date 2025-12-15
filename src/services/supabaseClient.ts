import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 1. VALIDACIÓN FAIL-SAFE
// Si faltan las keys, lanzamos un error que detenga la ejecución del módulo
// para evitar comportamientos impredecibles.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '🚨 Supabase Critical Error: Missing Environment Variables. ' +
    'Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// 2. CREACIÓN DEL CLIENTE
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // Importante para flujos de OAuth o Magic Link
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'FleetTech-Client', // Útil para logs en el backend
    },
  },
});

// 3. HEALTH CHECK SEGURO (RLS AGNOSTIC)
// No consultamos tablas de negocio. Verificamos si el servicio de Auth responde.
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    // getSession es ligero, no requiere permisos de tabla y verifica
    // que la conexión HTTPS con Supabase API funciona.
    const { error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase Auth Check Failed:', error.message);
      return false;
    }
    
    // Solo en desarrollo mostramos el log de éxito para no ensuciar consola en prod
    if (import.meta.env.DEV) {
      console.log('✅ Supabase connection (Auth) established.');
    }
    return true;
  } catch (error) {
    console.error('❌ Supabase unexpected connection error:', error);
    return false;
  }
};

export default supabase;