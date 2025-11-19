
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
 Configurar la API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la clave generada

5. En la carpeta del proyecto, abre el archivo `.env.local` y reemplaza:

```env
GEMINI_API_KEY=tu_api_key_aqui
```

Por tu clave real:

```env
GEMINI_API_KEY=AIzaSyCmMd6y1ulJ5P5MXjziGdhQf02xIdu5IXs
```

**⚠️ IMPORTANTE**: No compartas tu API key públicamente.

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


## 🔧 Solución de Problemas

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Port 3000 is already in use"
La aplicación automáticamente usará otro puerto (3001, 3002, etc.). Revisa la terminal para ver el puerto asignado.

### Error: "GEMINI_API_KEY is not defined"
Verifica que:
1. El archivo `.env.local` existe en la raíz del proyecto
2. La API key está configurada correctamente
3. No hay espacios extras en la línea

### Error de compilación de TypeScript
```bash
npm install typescript --save-dev
```


## 🔐 Seguridad

- **Nunca** compartas tu API key públicamente
- **No subas** el archivo `.env.local` a GitHub
- Usa variables de entorno en producción

