# Proyecto FletesM

FletesM es una aplicación diseñada para optimizar la gestión de flotas y entregas, integrando tecnologías modernas como Supabase para la gestión de datos y autenticación, y TailwindCSS para una interfaz de usuario responsiva. Este proyecto incluye funcionalidades avanzadas como seguimiento GPS en tiempo real, alertas inteligentes y una experiencia optimizada para dispositivos móviles.

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

FletesM es una solución integral para la gestión de flotas, diseñada para empresas que buscan optimizar sus operaciones logísticas. La aplicación permite el seguimiento en tiempo real de vehículos, la generación de alertas inteligentes basadas en el estado de las rutas y la integración con Supabase para almacenamiento y autenticación segura.

## Características

- **Seguimiento GPS en tiempo real**: Visualiza la ubicación de los vehículos en un mapa interactivo.
- **Alertas inteligentes**: Recibe notificaciones sobre el estado de las rutas y vehículos.
- **Interfaz optimizada para móviles**: Diseñada para ser utilizada fácilmente en dispositivos móviles.
- **Gestión de flotas**: Herramientas para administrar vehículos, conductores y rutas.
- **Integración con Supabase**: Almacenamiento seguro y autenticación de usuarios.

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

- **React**: Biblioteca para construir interfaces de usuario.
- **Supabase**: Base de datos y autenticación en tiempo real.
- **TailwindCSS**: Framework de CSS para diseño responsivo.
- **TypeScript**: Lenguaje para un desarrollo más seguro y escalable.
- **Vite**: Herramienta para desarrollo y construcción rápida de proyectos.

## Configuración del Proyecto

Antes de instalar, asegúrate de tener:
- **Node.js** (versión 18 o superior) - [Descargar aquí](https://nodejs.org/)
- **npm** (incluido con Node.js)
- **API Key de Supabase** - [Obtener aquí](https://supabase.com/dashboard)

Instalar dependencias:

```bash
npm install
```

Configurar las variables de entorno en un archivo `.env.local`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

## Solución de Problemas

Consulta la sección de solución de problemas en este archivo para resolver errores comunes relacionados con dependencias, configuración de entorno y conexión a Supabase.

## Seguridad

- **Nunca** compartas tus claves de API públicamente.
- **No subas** el archivo `.env.local` a repositorios públicos.
- Usa variables de entorno en producción para proteger información sensible.

## 👤 Autor
Fletes Marcelo

GitHub: [@Sebastiaaann](https://github.com/Sebastiaaann)
