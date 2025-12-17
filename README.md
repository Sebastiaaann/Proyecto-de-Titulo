# Proyecto con Google Gemini y Supabase

Este proyecto es una plantilla básica que integra Google Gemini para generación de texto e imágenes, y Supabase como base de datos y autenticación.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Scripts Disponibles](#scripts-disponibles)
- [Inicio Rápido](#inicio-rápido)
- [Tecnologías Usadas](#tecnologías-usadas)
- [Configuración del Proyecto](#configuración-del-proyecto)
- [Solución de Problemas](#solución-de-problemas)
- [Seguridad](#seguridad)

## Descripción

Este proyecto utiliza Google Gemini para ofrecer capacidades avanzadas de IA, como generación de texto e imágenes a partir de descripciones. Supabase se utiliza para manejar la base de datos y la autenticación de usuarios.

## Características

- Generación de texto e imágenes con Google Gemini
- Autenticación de usuarios
- Almacenamiento de datos en tiempo real
- Interfaz de usuario receptiva

## Scripts Disponibles

Para iniciar el proyecto, usa los siguientes comandos:

```bash
# Iniciar el servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar en modo producción
npm run start
```

## Inicio Rápido

1. Asegúrate de tener [Node.js](https://nodejs.org/) y [npm](https://www.npmjs.com/) instalados.
2. Clona este repositorio.
3. Ejecuta `npm install` para instalar las dependencias.
4. Configura tus claves de API en un archivo `.env.local` (ver [Configuración del Proyecto](#configuración-del-proyecto)).
5. Ejecuta `npm run dev` para iniciar el servidor de desarrollo.
6. Abre tu navegador y ve a `http://localhost:3000`.

## Tecnologías Usadas

- **Google Gemini**: Para generación de texto e imágenes.
- **Supabase**: Como base de datos y servicio de autenticación.
- **Vite**: Como empaquetador de módulos y servidor de desarrollo.
- **TypeScript**: Para un desarrollo más seguro y escalable.

## Configuración del Proyecto

Antes de instalar, asegúrate de tener:
- **Node.js** (versión 18 o superior) - [Descargar aquí](https://nodejs.org/)
- **npm** (incluido con Node.js)
- **API Key de Google Gemini** - [Obtener gratis aquí](https://aistudio.google.com/app/apikey)

Instalar dependencias

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

**Nota para Windows**: Si usas PowerShell y tienes problemas, ejecuta:
```powershell
npm install --legacy-peer-deps
```
### Paso 3: Configurar las API Keys

#### 3.1 Google Gemini AI

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la clave generada

#### 3.2 Supabase (Base de Datos)

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Crea un nuevo proyecto (o usa uno existente)
3. Ve a **Settings → API**
4. Copia:
   - **Project URL** (ejemplo: `https://abcdefgh.supabase.co`)
   - **anon/public key** (comienza con `eyJ...`)

#### 3.3 Configurar .env.local

En la carpeta del proyecto, abre el archivo `.env.local` y configura todas las variables:

```env
# Google Gemini AI
GEMINI_API_KEY=tu_gemini_api_key_aqui

# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

**⚠️ IMPORTANTE**: No compartas tus API keys públicamente.

Ejecutar el proyecto

Una vez instalado todo, ejecuta:

```bash
npm run dev
```

La aplicación se abrirá automáticamente en tu navegador en:
```
http://localhost:3001
```

Si el puerto 3000 está ocupado, Vite automáticamente usará el 3001 o siguiente disponible


## Solución de Problemas

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Port 3000 is already in use"
La aplicación automáticamente usará otro puerto (3001, 3002, etc.). Revisa la terminal para ver el puerto asignado.

### Error: "GEMINI_API_KEY is not defined" o "Supabase configuration missing"
Verifica que:
1. El archivo `.env.local` existe en la raíz del proyecto
2. Las API keys están configuradas correctamente
3. No hay espacios extras en las líneas
4. Las variables de Supabase empiezan con `VITE_`

### Error de compilación de TypeScript
```bash
npm install typescript --save-dev
```

### Error: "Supabase connection failed"
1. Verifica que la URL de Supabase sea correcta
2. Asegúrate de usar la **anon key** (no la service_role key)
3. Verifica que tu proyecto de Supabase esté activo
4. Revisa que las tablas estén creadas en Supabase


## Seguridad

- **Nunca** compartas tu API key públicamente
- **No subas** el archivo `.env.local` a GitHub
- Usa variables de entorno en producción

