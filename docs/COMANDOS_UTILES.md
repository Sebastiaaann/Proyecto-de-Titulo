# 🛠️ Comandos Útiles - Sistema de Autenticación

## 📦 Instalación

```bash
# Instalar dependencias necesarias
npm install @supabase/supabase-js

# Verificar instalación
npm list @supabase/supabase-js
```

## 🔧 Configuración

```bash
# Crear archivo de variables de entorno
cp .env.example .env.local

# Editar variables (usa tu editor favorito)
code .env.local
```

## 🚀 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Iniciar y abrir en navegador
npm run dev -- --open

# Limpiar caché si hay problemas
rm -rf node_modules/.vite
npm run dev
```

## 🧪 Testing de Conexión

```bash
# En la consola del navegador (F12):
import { testSupabaseConnection } from './src/lib/supabase';
await testSupabaseConnection();
```

## 🗄️ Comandos SQL en Supabase

### Verificar Tabla Profiles

```sql
-- Ver todos los perfiles
SELECT * FROM public.profiles;

-- Ver perfiles con roles específicos
SELECT * FROM public.profiles WHERE role = 'admin';

-- Contar usuarios por rol
SELECT role, COUNT(*) as total
FROM public.profiles
GROUP BY role;
```

### Crear Usuario Admin Manualmente

```sql
-- 1. Primero, registra el usuario normalmente desde la UI
-- 2. Luego, actualiza su rol a admin:

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@ejemplo.com';
```

### Migrar Usuarios Existentes

```sql
-- Crear perfiles para usuarios existentes sin perfil
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'driver'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
```

### Ver Políticas RLS

```sql
-- Ver políticas de la tabla profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';
```

### Verificar Trigger

```sql
-- Ver información del trigger
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

## 🐛 Debugging

### Ver logs de autenticación

```bash
# En la consola del navegador, el sistema ya incluye logs:
# 🔐 Initializing auth...
# ✅ Session found
# 🔍 Fetching user profile
# etc.
```

### Verificar variables de entorno

```javascript
// En la consola del navegador:
console.log({
  url: import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
});
```

### Limpiar sesión local

```javascript
// En la consola del navegador:
localStorage.removeItem('fletesm-auth-token');
location.reload();
```

### Ver sesión actual

```javascript
import { supabase } from './src/lib/supabase';
const { data } = await supabase.auth.getSession();
console.log(data);
```

## 🔄 Git

```bash
# Ignorar .env.local (ya debe estar en .gitignore)
echo ".env.local" >> .gitignore

# Commit de los nuevos archivos
git add src/
git add supabase-auth-setup.sql
git add .env.example
git add AUTH_SETUP_SUMMARY.md
git commit -m "feat: implementar sistema de autenticación con Supabase"
git push
```

## 📊 Monitoreo en Supabase Dashboard

### Ver usuarios registrados
1. Dashboard > Authentication > Users

### Ver logs de autenticación
2. Dashboard > Authentication > Logs

### Ver datos de profiles
3. Dashboard > Table Editor > profiles

### Ver políticas RLS
4. Dashboard > Authentication > Policies

## 🔐 Seguridad

### Rotar claves de Supabase

```bash
# 1. En Dashboard > Settings > API
# 2. Generar nueva anon key
# 3. Actualizar .env.local
# 4. Reiniciar servidor
npm run dev
```

### Backup de base de datos

```bash
# Desde Supabase Dashboard:
# Database > Backups > Create backup
```

## 🚀 Despliegue

### Vercel

```bash
# Instalar CLI de Vercel
npm i -g vercel

# Deploy
vercel

# Configurar variables de entorno:
# Dashboard > Settings > Environment Variables
# Agregar: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

### Netlify

```bash
# Instalar CLI de Netlify
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Configurar variables de entorno:
# Dashboard > Site settings > Environment variables
```

## 📝 Scripts Útiles NPM

Agrega estos scripts a tu `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

## 🔍 Queries Útiles de Supabase

### JavaScript/TypeScript

```typescript
// Obtener perfil del usuario actual
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

// Obtener todos los usuarios (solo admin)
const { data: profiles } = await supabase
  .from('profiles')
  .select('*')
  .order('created_at', { ascending: false });

// Buscar por email
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('email', 'user@example.com')
  .single();

// Actualizar perfil
const { error } = await supabase
  .from('profiles')
  .update({ full_name: 'Nuevo Nombre' })
  .eq('id', user.id);
```

## 🎯 Testing

```bash
# Instalar dependencias de testing
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Ejecutar tests
npm test

# Tests con UI
npm run test:ui

# Coverage
npm test -- --coverage
```

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Vite Docs](https://vitejs.dev)

---

**Tip:** Guarda este archivo como referencia rápida. Contiene todos los comandos que necesitarás usar frecuentemente.
