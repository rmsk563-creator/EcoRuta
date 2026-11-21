# Publicación web en GitHub Pages

EcoRuta tiene un build web separado para publicarse en:

<https://rmsk563-creator.github.io/EcoRuta/>

La publicación no es automática. El workflow solo admite ejecución manual desde `develop/mobile-app`, por lo que subir la rama no reemplaza por sí solo la web pública existente.

## Separación de builds

| Destino | Comando | Base Vite | Salida |
| --- | --- | --- | --- |
| Capacitor iOS/Android | `npm run build` | `./` | `dist/` |
| GitHub Pages | `npm run build:pages` | `/EcoRuta/` | `dist-pages/` |

`capacitor.config.ts` continúa leyendo exclusivamente `dist/`. El build web no sobrescribe el paquete nativo.

EcoRuta usa `HashRouter`, por lo que las pantallas se abren como `/EcoRuta/#/map`, `/EcoRuta/#/favorites` o `/EcoRuta/#/statistics`. GitHub Pages siempre sirve el mismo `index.html` y la navegación interna no produce errores 404.

## Servicios públicos del cliente

### Clave web de Geoapify

Antes de publicar, crea una clave exclusiva para la web pública. No reutilices la clave móvil ni la de desarrollo.

En Geoapify configura y prueba:

- **Allowed HTTP referrers:** `^https://rmsk563-creator\.github\.io/EcoRuta(?:/.*)?$`
- **Allowed origins:** `https://rmsk563-creator.github.io`
- **CORS Access-Control-Allow-Origin:** `https://rmsk563-creator.github.io`

El referrer permite limitar el uso al subdirectorio de EcoRuta. El origin no incluye rutas. CORS permite que el navegador lea las respuestas, pero no sustituye las restricciones de acceso.

En GitHub crea el secreto del repositorio:

```text
GEOAPIFY_WEB_API_KEY
```

El workflow lo transforma en `VITE_GEOAPIFY_API_KEY` solo durante el build. El valor no se confirma en Git, aunque cualquier clave usada por JavaScript seguirá siendo visible para quien use el navegador. Por eso debe estar restringida, monitorizada y separada por entorno.

### Firebase Authentication

Completa primero [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md) y añade `rmsk563-creator.github.io` a los dominios autorizados de Authentication. Después crea estos secretos de Actions con los valores públicos de la app Web registrada en Firebase:

```text
FIREBASE_WEB_API_KEY
FIREBASE_WEB_AUTH_DOMAIN
FIREBASE_WEB_PROJECT_ID
FIREBASE_WEB_APP_ID
FIREBASE_WEB_STORAGE_BUCKET
FIREBASE_WEB_MESSAGING_SENDER_ID
```

Los cuatro primeros son obligatorios y el workflow se detiene si falta alguno. Los dos últimos son opcionales para Authentication. No añadas una cuenta de servicio, una clave Admin ni un archivo privado.

### Eco IA

El build de Pages configura únicamente la URL pública del Worker mediante `.env.github-pages`:

```text
https://ecoruta-eco-ai.rmsk563.workers.dev
```

La URL no es una credencial. Las solicitudes siguen requiriendo una sesión Firebase válida y correo verificado; la inferencia y los límites permanecen en Cloudflare Workers Free. El Worker permite el origen exacto `https://rmsk563-creator.github.io` y no utiliza un comodín CORS.

## Comprobar localmente sin publicar

```bash
npm run build:pages
npm run preview:pages
```

Abre la URL indicada por Vite añadiendo `/EcoRuta/`. Este preview usa el contenido de `dist-pages/` y no modifica `dist/`.

## Publicar cuando exista autorización

1. Sincronizar `develop/mobile-app` después de revisar los commits.
2. Crear `GEOAPIFY_WEB_API_KEY` y los secretos `FIREBASE_WEB_*` indicados arriba en **Settings → Secrets and variables → Actions**.
3. En **Settings → Pages**, seleccionar **GitHub Actions** como fuente.
4. En **Actions**, abrir **Deploy EcoRuta to GitHub Pages**.
5. Seleccionar `develop/mobile-app` y pulsar **Run workflow**.
6. Verificar la URL pública, assets, mapas, rutas, IndexedDB, consola y navegación.

No ejecutar estos pasos hasta contar con autorización expresa para reemplazar la versión pública actual.

## Persistencia web

Favoritos, historial y estadísticas funcionan en GitHub Pages mediante IndexedDB. Permanecen en ese navegador y dispositivo. No se sincronizan con el SQLite del iPhone ni con otros navegadores. La cuenta de Firebase autentica identidad y sesión, pero no incorpora una base de datos ni sincronización de actividad.
