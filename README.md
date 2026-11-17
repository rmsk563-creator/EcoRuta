# EcoRuta

Aplicación de movilidad sostenible para Lima, construida con React, TypeScript, Vite y Capacitor.

## Estado

La Fase 2 implementa una interfaz responsive con navegación, temas, configuración local y canales oficiales. Mapas, GPS, rutas, favoritos, historial y estadísticas permanecen ocultos hasta contar con implementación y pruebas reales.

La versión publicada en GitHub Pages continúa en `main`. El desarrollo de la aplicación vive en `develop/mobile-app` y no está publicado.

## Requisitos

- Node.js 22 o superior.
- npm 11 o superior recomendado.

## Ejecutar localmente

```bash
npm install
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
├── components/    shell, marca y navegación
├── pages/         Inicio, Acerca y Ajustes
├── state/         preferencias persistentes
├── test/          entorno de pruebas
├── App.tsx
├── main.tsx
└── styles.css
```

## Mapas

Geoapify es el proveedor inicial aprobado y MapLibre será el renderer. Sus condiciones y alternativas están documentadas en [`GEOAPIFY_EVALUATION.md`](./GEOAPIFY_EVALUATION.md). La integración comienza en Fase 3 y requerirá una clave restringida que nunca debe añadirse al repositorio.

## Preparación nativa

Capacitor ya dispone de CLI y configuración base. Los proyectos `ios/` y `android/` se crearán en el gate nativo posterior, cuando puedan abrirse y validarse con Xcode y Android Studio; todavía no forman parte de esta fase.

## Documentación

- [`PROJECT_PROFILE.md`](./PROJECT_PROFILE.md)
- [`ROADMAP.md`](./ROADMAP.md)
- [`DECISIONS.md`](./DECISIONS.md)
- [`MARCA.md`](./MARCA.md)
- [`QA.md`](./QA.md)
