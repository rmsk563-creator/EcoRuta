# EcoRuta

Aplicación de movilidad sostenible para Lima, construida con React, TypeScript, Vite y Capacitor.

## Estado

La Fase 7 convierte el mapa en la pantalla principal, concentra configuración y cuenta dentro de Perfil, organiza favoritos, historial y estadísticas en Actividad y añade cinco colores de énfasis persistentes. Firebase Authentication está preparado para correo, contraseña, recuperación y cierre, pero continúa inactivo hasta configurar y probar un proyecto real. El proyecto iOS mantiene permisos de ubicación, privacidad, SQLite, enlaces externos y exportación mediante la hoja de compartir.

El planificador solo se activa cuando existe una API key configurada. Sin clave, EcoRuta muestra instrucciones y no genera mapas, rutas, distancias ni tiempos ficticios. Una ruta consultada tampoco se guarda como realizada: el usuario debe confirmarla explícitamente.

La versión publicada en GitHub Pages continúa en `main`. El desarrollo de la aplicación vive en `develop/mobile-app` y no está publicado.

## Requisitos

- Node.js 22 o superior.
- npm 11 o superior recomendado.
- Para iOS: macOS con Xcode compatible con Capacitor 8 e iOS 15 o superior.

## Ejecutar localmente

```bash
npm install
npm run dev
```

Para activar Geoapify, crea primero `.env.local`:

```bash
cp .env.example .env.local
```

Completa la variable sin comillas y reinicia Vite:

```dotenv
VITE_GEOAPIFY_API_KEY=tu_clave_restringida
```

Para activar las cuentas reales, completa también las variables públicas de Firebase siguiendo [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md). Sin ellas, el acceso al mapa y los datos locales continúa funcionando sin cuenta y los formularios no se ofrecen como una función disponible.

```bash
npm run dev
```

Abre la URL que muestre Vite, normalmente <http://localhost:5173/>.

Para verla desde un teléfono conectado a la misma red, usa la URL `Network` que imprime Vite. El firewall de macOS debe permitir conexiones entrantes a Node.

## Verificar

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

`npm run preview` sirve el build de producción, normalmente en <http://localhost:4173/>.

## Estructura

```text
src/
├── components/    shell, navegación, búsqueda y mapa
├── config/        entorno y límites geográficos
├── data/          repositorios, esquemas, migraciones, validación y estadísticas
├── hooks/         geolocalización con Capacitor
├── navigation/    estado tipado para reutilizar favoritos e historial
├── pages/         Mapa, Actividad, Perfil, Ajustes internos, colecciones y cuenta
├── services/      adaptador Geoapify y control de solicitudes
├── state/         preferencias y datos locales persistentes
├── test/          entorno de pruebas
├── App.tsx
├── main.tsx
└── styles.css
```

## Mapas

Geoapify es el proveedor inicial y MapLibre GL JS el renderer. La integración usa debounce, cancelación, caché temporal en memoria, un máximo aproximado de 3,8 solicitudes por segundo y un límite de seguridad de 240 solicitudes por sesión para geocodificación/routing. Los tiles son gestionados directamente por MapLibre y consumen cuota adicional de Geoapify.

Consulta [`GEOAPIFY_SETUP.md`](./GEOAPIFY_SETUP.md) para crear y restringir la clave. Las condiciones del proveedor están documentadas en [`GEOAPIFY_EVALUATION.md`](./GEOAPIFY_EVALUATION.md).

## Datos locales

La web usa IndexedDB mediante `idb`. En un contenedor Capacitor nativo, el repositorio selecciona SQLite mediante `@capacitor-community/sqlite`. Capacitor Preferences se reserva para alias, tema, color, movimiento, modalidad, unidades y privacidad.

Consulta [`LOCAL_DATA.md`](./LOCAL_DATA.md) para conocer el esquema, los datos enviados a Geoapify, la importación/exportación y la metodología ambiental.

## Ejecutar en iOS

El proyecto `ios/` ya está generado y usa Swift Package Manager. Después de cada cambio web:

```bash
npm run build
npx cap sync ios
npx cap open ios
```

En Xcode selecciona el target **App**, configura tu equipo en **Signing & Capabilities**, elige un simulador o tu iPhone y pulsa **Run**. Si Apple no acepta `com.ecoruta.app` para tu equipo, cambia el identificador por uno único y actualiza también `appId` en `capacitor.config.ts` antes de sincronizar.

La prueba en simulador confirmó SQLite, GPS simulado, mapas, rutas y exportación nativa. No sustituye la validación en un iPhone físico. Consulta [`NATIVE_TESTING.md`](./NATIVE_TESTING.md) para la instalación y la lista de aceptación.

Android no fue generado porque este entorno todavía no dispone de Android Studio, JDK ni SDK/ADB. No hay pruebas Android aprobadas.

## Preparar la versión web pública

GitHub Pages usa un build independiente para el subdirectorio `/EcoRuta/`:

```bash
npm run build:pages
npm run preview:pages
```

La salida se genera en `dist-pages/`; Capacitor continúa usando `dist/`. La publicación está preparada mediante un workflow manual y no se ejecuta al hacer push. Consulta [`GITHUB_PAGES.md`](./GITHUB_PAGES.md) para configurar la clave web, revisar localmente y publicar cuando exista autorización.

## Seguridad de Geoapify en iOS

`.env.local` permanece fuera de Git. Sin embargo, cualquier variable `VITE_` se incorpora al paquete de la aplicación y debe considerarse pública. Usa una clave Geoapify distinta para móvil, controla cuota y uso, y rótala si detectas abuso. Las restricciones de origen/referrer del navegador no protegen de la misma forma una aplicación nativa; una protección fuerte requeriría un servicio backend autorizado.

## Documentación

- [`PROJECT_PROFILE.md`](./PROJECT_PROFILE.md)
- [`ROADMAP.md`](./ROADMAP.md)
- [`DECISIONS.md`](./DECISIONS.md)
- [`MARCA.md`](./MARCA.md)
- [`QA.md`](./QA.md)
- [`GEOAPIFY_SETUP.md`](./GEOAPIFY_SETUP.md)
- [`NATIVE_TESTING.md`](./NATIVE_TESTING.md)
- [`LOCAL_DATA.md`](./LOCAL_DATA.md)
- [`GITHUB_PAGES.md`](./GITHUB_PAGES.md)
- [`AUTH_EVALUATION.md`](./AUTH_EVALUATION.md)
- [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md)
