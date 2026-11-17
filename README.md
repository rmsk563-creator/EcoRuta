# EcoRuta

Aplicación de movilidad sostenible para Lima, construida con React, TypeScript, Vite y Capacitor.

## Estado

La Fase 3 incorpora el planificador real de EcoRuta: mapa MapLibre, búsqueda limitada a Lima, selección de puntos, GPS con permiso explícito y comparación de rutas Geoapify para caminar y bicicleta.

El planificador solo se activa cuando existe una API key configurada. Sin clave, EcoRuta muestra instrucciones y no genera mapas, rutas, distancias ni tiempos ficticios. Favoritos, historial y estadísticas continúan fuera de la interfaz hasta fases posteriores.

La versión publicada en GitHub Pages continúa en `main`. El desarrollo de la aplicación vive en `develop/mobile-app` y no está publicado.

## Requisitos

- Node.js 22 o superior.
- npm 11 o superior recomendado.

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
├── hooks/         geolocalización con Capacitor
├── pages/         Inicio, Mapa, Acerca y Ajustes
├── services/      adaptador Geoapify y control de solicitudes
├── state/         preferencias persistentes
├── test/          entorno de pruebas
├── App.tsx
├── main.tsx
└── styles.css
```

## Mapas

Geoapify es el proveedor inicial y MapLibre GL JS el renderer. La integración usa debounce, cancelación, caché temporal en memoria, un máximo aproximado de 3,8 solicitudes por segundo y un límite de seguridad de 240 solicitudes por sesión para geocodificación/routing. Los tiles son gestionados directamente por MapLibre y consumen cuota adicional de Geoapify.

Consulta [`GEOAPIFY_SETUP.md`](./GEOAPIFY_SETUP.md) para crear y restringir la clave. Las condiciones del proveedor están documentadas en [`GEOAPIFY_EVALUATION.md`](./GEOAPIFY_EVALUATION.md).

## Preparación nativa

Capacitor ya dispone de CLI y configuración base. Los proyectos `ios/` y `android/` se crearán en el gate nativo posterior, cuando puedan abrirse y validarse con Xcode y Android Studio; todavía no forman parte de esta fase.

## Documentación

- [`PROJECT_PROFILE.md`](./PROJECT_PROFILE.md)
- [`ROADMAP.md`](./ROADMAP.md)
- [`DECISIONS.md`](./DECISIONS.md)
- [`MARCA.md`](./MARCA.md)
- [`QA.md`](./QA.md)
- [`GEOAPIFY_SETUP.md`](./GEOAPIFY_SETUP.md)
- [`NATIVE_TESTING.md`](./NATIVE_TESTING.md)
