/**
 * useAuth Hook
 * 
 * Hook personalizado para acceder al contexto de autenticación.
 * Lanza un error si se usa fuera del AuthProvider.
 */

import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';
import { AuthContextType } from '../types/auth.types';

/**
 * Hook para acceder al contexto de autenticación
 * 
 * @throws Error si se usa fuera del AuthProvider
 * @returns AuthContextType con el estado y métodos de autenticación
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, profile, signOut } = useAuth();
 *   
 *   if (!user) return <LoginForm />;
 *   
 *   return (
 *     <div>
 *       <h1>Welcome {profile?.full_name}</h1>
 *       <p>Role: {profile?.role}</p>
 *       <button onClick={signOut}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Wrap your app with <AuthProvider> to use this hook.'
    );
  }

  return context;
};

export default useAuth;
