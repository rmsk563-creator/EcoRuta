# QA — EcoRuta

## Fase 8C — preparación local de Workers AI

**Estado:** backend y cliente preparados localmente; inferencia real, despliegue e iPhone no probados porque la cuenta Cloudflare Free aún requiere intervención del propietario.

- ✅ TypeScript del Worker sin errores.
- ✅ 13 pruebas del Worker en 4 archivos: mensaje único, rechazo de datos extra, claims Firebase, límites, JSON Mode y errores de capacidad.
- ✅ TypeScript, 70 pruebas en 19 archivos y build de producción de la aplicación.
- ✅ Flujo automatizado: respuesta en español, propuesta de Parque Kennedy, confirmación y búsqueda posterior mediante Geoapify.
- ✅ Historial remoto inexistente; persistencia local desactivada por defecto y cuerpo limitado al mensaje actual.
- ✅ `wrangler deploy --dry-run`: paquete de 49,75 KiB / 13,91 KiB gzip, binding `env.AI` reconocido, sin despliegue.
- ✅ `npm audit --audit-level=high`: 0 vulnerabilidades conocidas en el Worker.
- ✅ `npx cap sync ios`: recursos web y seis plugins sincronizados sin instalar la aplicación.
- ✅ `xcodebuild` Debug para `iphonesimulator`: `BUILD SUCCEEDED`; solo se observaron advertencias de dependencias nativas.
- ✅ `.env.local`, `.wrangler` y archivos locales sensibles permanecen ignorados.
- 🟡 Firma Firebase real contra el Worker pendiente de una URL desplegada y una sesión de prueba.
- ⏸️ Inferencia real de Workers AI pendiente: incluso `wrangler dev` consume la asignación de la cuenta.
- ⏸️ Instalación iOS pendiente hasta aprobar la cuenta, el primer despliegue y las pruebas reales.

## Fase 7 — navegación, perfil y apariencia

**Ejecución:** 18 de noviembre de 2026.

**Entorno:** Chrome local, medición CDP a 390 px, Xcode 27.0, runtime iOS 27 y simulador iPhone 18 Pro. La versión 0.7.0 no fue instalada en el iPhone físico.

### Automatización y compilación

- ✅ `npm run typecheck`.
- ✅ `npm test -- --run`: 38 pruebas aprobadas en 11 archivos.
- ✅ Regresiones: mapa como ruta principal, Perfil sin identidad ficticia, cierre de sesión aislado y cinco colores persistentes.
- ✅ `npm run build`: build Vite de producción generado.
- ✅ `npx cap sync ios`: seis plugins sincronizados.
- ✅ `xcodebuild` Debug para `iphonesimulator`: `BUILD SUCCEEDED`.

### Revisión visual

- Mapa observado como primera pantalla después del splash en el simulador.
- Perfil circular visible en la esquina superior derecha y navegación inferior reducida a Mapa/Actividad.
- Perfil y Apariencia revisados en navegador; a 390 px `innerWidth` y `scrollWidth` fueron ambos 390, sin desbordamiento horizontal.
- Vista de escritorio revisada a 1440 px con sidebar simplificado y Perfil en el encabezado.
- MapLibre no se rediseñó: estilos, trazados y atribuciones mantienen sus colores independientes de la personalización.

### Datos, identidad y límites

- Preferencias v3 leen y migran v2/v1; no se ejecutó operación sobre SQLite, IndexedDB, favoritos, historial o estadísticas.
- `assets/logo-ecoruta.png`, AppIcon, splash nativo y Bundle ID no fueron modificados.
- `.env.local` sigue ignorado; no existen variables Firebase configuradas y no se realizó ninguna solicitud de autenticación real.
- Chrome headless no ofrece WebGL2 en este entorno; el mapa mostró su recuperación localizada. El mapa real ya había sido validado en WKWebView y su motor no cambió en esta fase.
- El log del runtime iOS 27 mostró avisos del simulador sobre teclado, preferencias administradas y resolución del usuario `mobile`; la app permaneció abierta y no se observó una excepción JavaScript ni cierre del proceso.
- Pendiente: configurar Firebase, probar todos los flujos reales en web/simulador y aprobar el acceso obligatorio antes de instalar 0.7.0 en el iPhone físico.

## Demo universitaria 0.6.0

**Ejecución:** 18 de noviembre de 2026.

**Hardware:** iPhone 15 Pro Max físico, emparejado y autorizado; Bundle ID `com.ecoruta.app`; build 2.

### Verificado en el dispositivo

- ✅ `npm run typecheck`, 36 pruebas en 11 archivos y build Vite de producción aprobados antes de sincronizar el paquete nativo.
- ✅ `npx cap sync ios` sincronizó los seis plugins y la compilación de simulador también terminó con `BUILD SUCCEEDED`.
- ✅ Compilación `Debug-iphoneos` firmada automáticamente: `BUILD SUCCEEDED`.
- ✅ Equipo de firma `C3AMZ7K6T2`; perfil con el UDID del iPhone y vigencia hasta el 25 de noviembre de 2026.
- ✅ Actualización in-place desde 1.0 (build 1) a 0.6.0 (build 2); no se ejecutó desinstalación ni limpieza de datos.
- ✅ Inicio del proceso y de WKWebView sin cierre durante la observación.
- ✅ Splash nativo original y splash animado observados mediante capturas físicas temporizadas.
- ✅ Bienvenida, acceso sin cuenta, navegación inferior, mapa/panel de planificación y tema oscuro observados en el iPhone.
- ✅ Firebase permanece sin variables de configuración y las pantallas de acceso indican que la autenticación estará disponible próximamente.

### Pendiente de interacción manual en el iPhone

- 🟡 Conceder permiso y validar coordenadas/precisión del GPS real.
- 🟡 Escribir una búsqueda y recibir rutas Geoapify a pie y en bicicleta durante esta instalación.
- 🟡 Crear un favorito y un recorrido, terminar la app y confirmar la persistencia SQLite de esos cambios.
- 🟡 Importar/exportar JSON mediante los selectores físicos y abrir los enlaces externos.
- 🟡 Revisar teclado y gestos durante una interacción completa.

Las funciones anteriores tienen cobertura previa en navegador o simulador, pero no se declaran aprobadas en hardware hasta completar estos gestos en el dispositivo.

## Fase 6

**Ejecución:** 18 de noviembre de 2026.

**Entorno:** Chrome local a 390, 768 y 1440 px; Xcode 27.0, runtime iOS 27 y simulador iPhone 18 Pro. La prueba no equivale a hardware físico.

### Automatización

- ✅ `npm run typecheck`.
- ✅ `npm test`: 30 pruebas aprobadas en 8 archivos.
- ✅ Regresión: el splash importa la fuente maestra mediante `Brand.tsx`.
- ✅ Regresión: inicio de sesión permanece deshabilitado y marcado como conexión pendiente.
- ✅ `npm run build`: build Vite de producción generado.
- ✅ `npx cap sync ios`: seis plugins sincronizados sin cambios versionados inesperados.
- ✅ `xcodebuild`: build Debug para `iphonesimulator` finalizado con `BUILD SUCCEEDED`.
- ✅ `git diff --check`: sin errores de espacios.

### Revisión visual y movimiento

- Splash React observado en simulador: fondo ecológico, logo original, halo separado y recorrido progresivo.
- Pantalla inicial observada después de la transición; safe area y navegación inferior se conservaron.
- Pantallas de bienvenida, inicio y registro revisadas en tamaños móvil, tableta y escritorio.
- No hay animaciones aplicadas a `.map-canvas` ni a la página de mapa; el panel y los resultados se animan por separado.
- Movimiento reducido elimina prácticamente todas las duraciones y muestra el recorrido sin revelado animado.
- Chrome headless informó avisos gráficos `CVDisplayLink` propios del entorno sin GPU; no hubo excepción de la aplicación.

### Identidad y datos

- SHA-256 de `assets/logo-ecoruta.png`: `b98778630a9be90e11f5f3d96b429f4afdf05eccc7bb6e7b5ba6980fe32fdb06` antes de cerrar la fase.
- AppIcon, Splash nativo y `assets/logo.png` no fueron modificados.
- No se ejecutó borrado, migración ni reinicialización de IndexedDB o SQLite.
- No se instaló SDK de autenticación, no se transmitieron credenciales y no se creó sesión ficticia.

### Limitaciones

- El primer fotograma capturado en el simulador corresponde al launch screen nativo existente; el splash React aparece cuando WKWebView termina de cargar. No se modificó el recurso nativo por la protección de marca.
- Xcode mantiene el aviso preexistente de tres hijos no asignados en `Splash.imageset`; `BUILD SUCCEEDED` y el recurso se conserva intacto.
- No se midieron FPS o energía en Instruments ni en iPhone físico. La revisión de rendimiento de esta fase es estructural y visual.
- La clave Geoapify local permitió empaquetar el mapa, pero no se repitieron solicitudes reales de rutas en esta fase porque no se modificó el motor y las pruebas reales anteriores continúan separadas.
- Teclado, gestos, recuperación, deep links y cierre de sesión requieren proveedor real y prueba física posterior.

## Fase 5

**Ejecución:** 17 de noviembre de 2026.

**Entorno:** Xcode 27.0, runtime iOS 27, simulador iPhone 18 Pro, Capacitor 8.6.2 y WKWebView. Las pruebas no equivalen a hardware físico.

### Compilación y automatización

- ✅ `npm run typecheck`.
- ✅ `npm test`: 28 pruebas aprobadas en 8 archivos, incluidas exportación nativa, limpieza temporal y enlaces HTTPS.
- ✅ `npm run build`: build Vite de producción generado.
- ✅ `npx cap sync ios`: seis plugins sincronizados mediante Swift Package Manager.
- ✅ `xcodebuild`: build Debug para `iphonesimulator` finalizado con `BUILD SUCCEEDED`.
- ✅ `npm audit --omit=dev`: 0 vulnerabilidades en dependencias de producción.
- ⚠️ La auditoría completa informa 6 avisos altos en la cadena de herramientas Vite/Vitest por `picomatch`; no hay avisos críticos. La corrección automática propuesta fuerza un cambio incompatible y no se aplicó sin una actualización controlada.

### Funciones observadas en simulador

- App abierta y navegable con nombre EcoRuta e icono generado desde el logo original.
- Mapa real de Lima en WKWebView con controles y atribuciones Geoapify, OpenMapTiles y OpenStreetMap visibles.
- Autocomplete real para Parque Kennedy y Campo de Marte.
- Rutas reales a pie y bicicleta recibidas de Geoapify, con trazado, distancia y duración. La ejecución observó bicicleta 4,6 km / 17 min y caminata 4.713 m / 4.182 s.
- Prompt nativo de ubicación con la descripción configurada; permiso concedido y posición Lima simulada recibida con precisión de 5 m.
- SQLite creó `ecoruta_local_dataSQLite.db`, tablas `favorites` y `trips`, y `user_version` 2.
- Dos favoritos y un recorrido confirmado persistieron después de terminar y volver a abrir la app.
- La ruta consultada no entró al historial hasta pulsar **Registrar como realizado**.
- Exportación JSON escribió un archivo temporal y abrió la hoja nativa con opciones de copiar y guardar en Archivos.
- Tema oscuro persistió después de terminar y volver a abrir.

### Seguridad y privacidad

- `.env.local` sigue ignorado por Git y la clave local no aparece en archivos versionados.
- `PrivacyInfo.xcprivacy` declara Preferences y Filesystem; no declara rastreo ni recolección por servidores propios.
- Ambos textos de permiso de ubicación están presentes; no se implementa ubicación en segundo plano.
- Las claves Vite compiladas no se consideran secretas. Se requiere una clave Geoapify dedicada para móvil, vigilancia de cuota y rotación.

### Limitaciones

- El selector de importación exige un gesto real de usuario en WKWebView; la automatización no completó una selección. Código y validación están preparados, pero la importación nativa no está aprobada.
- La hoja de compartir se abrió, pero no se confirmó manualmente el guardado final en iCloud Drive o En mi iPhone.
- Enlaces externos están cubiertos por pruebas automatizadas; falta observar SFSafariViewController en el iPhone físico.
- GPS utilizó una ubicación simulada; señal, precisión, consumo y permisos reales siguen pendientes.
- Firma, instalación, safe areas, teclado, rotación y ciclo de vida real deben validarse en el iPhone del propietario.
- Android no se generó ni probó porque faltan Android Studio, JDK, SDK y ADB.

### Instalación física y preparación web posterior

- ✅ Xcode firmó `com.ecoruta.app` mediante firma automática y el equipo personal autorizado.
- ✅ La compilación `Debug-iphoneos` finalizó con `BUILD SUCCEEDED`.
- ✅ EcoRuta fue instalada por CoreDevice en un iPhone 15 Pro Max físico.
- 🟡 El comando posterior de apertura automática fue bloqueado por la revisión de ejecución; no falló la instalación. El primer arranque se realizará de forma interactiva con **Run** en Xcode.
- ✅ `npm run build:pages` generó `dist-pages/` con base `/EcoRuta/`.
- ✅ `dist/index.html` conservó rutas `./assets/` para Capacitor; `dist-pages/index.html` usó exclusivamente `/EcoRuta/assets/`.
- ✅ El worker diferido de MapLibre quedó referenciado bajo `/EcoRuta/assets/`.
- ✅ Preview local: `/EcoRuta/`, `/EcoRuta/#/map` y el JavaScript principal respondieron HTTP 200.
- ✅ TypeScript y 28 pruebas automatizadas continuaron aprobando después de separar ambos builds.
- ⏸️ GitHub Pages no fue publicado; el workflow requiere ejecución manual y una clave web dedicada.

## Fase 4

**Ejecución:** 17 de noviembre de 2026.

**Resultado en navegador:** persistencia, pantallas, cálculos y estados vacíos aprobados. SQLite y archivos nativos quedan pendientes de hardware.

### Automatización

- ✅ `npm run typecheck`
- ✅ `npm test`: 25 pruebas aprobadas en 7 archivos, incluidas regresiones del marcador y recuperación del mapa.
- ✅ `npm run build`: build de producción generado.
- ✅ `npm audit --audit-level=high`: 0 vulnerabilidades conocidas.
- ✅ `git diff --check`: sin errores después de normalizar EOF.

### Persistencia y datos

- Guardar, recuperar, renombrar y eliminar favoritos.
- Cerrar y reabrir IndexedDB conservando favoritos y recorridos.
- Separación entre ruta consultada y recorrido realizado.
- Borrado conjunto de favoritos e historial.
- Importación sin duplicados y rechazo de JSON mal formado.
- Migración real de base IndexedDB v1 a v2.
- Errores de cuota y restricción única traducidos.

### Estadísticas e impacto

- Totales de distancia, duración, caminar y bicicleta.
- Filtros semanales y mensuales y comparación con periodo anterior.
- Estadísticas en cero cuando no existen recorridos.
- CO₂ calculado solo para recorridos declarados como sustitución de automóvil.

### Responsive y consola

- 390 × 844, Favoritos: 2 tarjetas, navegación inferior completa y sin overflow.
- 768 × 1024, Historial: 1 recorrido, navegación inferior completa y sin overflow.
- 1440 × 1000, Estadísticas: 4 indicadores, sidebar completo y sin overflow.
- Excepciones runtime: 0.
- Errores de consola: 0.

### Regresión MapLibre y flujo real

- Corregido el orden del marcador: `setLngLat(...)` se ejecuta antes de `addTo(map)`.
- Revisados todos los marcadores; origen, destino y GPS comparten la única función de inicialización.
- El mapa queda aislado por un límite de errores con estado comprensible y acción **Reintentar mapa**.
- Autocomplete Geoapify real aprobado para Plaza Mayor de Lima y Parque Kennedy.
- Ruta a pie aprobada: 9,1 km y 2 h 15 min, según la respuesta recibida en la ejecución.
- Ruta en bicicleta aprobada: 10 km y 37 min, según la respuesta recibida en la ejecución.
- Una consulta mantuvo 0 favoritos y 0 recorridos; el historial solo cambió después de la confirmación explícita.
- Guardado final: 2 favoritos y 1 recorrido; los mismos conteos persistieron tras recargar.
- Exportación, eliminación total e importación restauraron correctamente 2 favoritos y 1 recorrido.

### Pendiente de dispositivo real

- SQLite nativo y migraciones iOS/Android.
- Persistencia después de terminación forzada del proceso.
- Exportación/importación mediante UI de archivos del sistema.
- GPS, permisos, safe areas y teclado físico en hardware.

## Fase 3

**Ejecución:** 16 de noviembre de 2026.

**Resultado:** implementación, pruebas unitarias, estado sin clave, manejo de clave rechazada y responsive aprobados. La validación end-to-end real se completó durante el cierre de la Fase 4 con la API key local del propietario.

### Automatización

- ✅ `npm run typecheck`
- ✅ `npm test`: 9 pruebas aprobadas en 2 archivos.
- ✅ `npm run build`: build de producción generado.
- ✅ `npm audit --audit-level=high`: 0 vulnerabilidades conocidas.
- ✅ `git diff --check`: sin errores de whitespace.

### Cobertura funcional comprobada

- Navegación a Mapa y estado seguro cuando falta `VITE_GEOAPIFY_API_KEY`.
- Autocomplete restringido a Perú y al rectángulo operativo de Lima.
- Caché de búsquedas repetidas sin una segunda llamada.
- Construcción correcta de solicitudes de rutas para caminar/bicicleta.
- Uso exclusivo de distancia, tiempo y geometría recibidos en una respuesta válida.
- Respuestas HTTP 429 convertidas en un aviso de cuota comprensible.
- Respuestas de ruta mal formadas rechazadas sin inventar métricas.
- Clave inválida produce HTTP 401 y un estado visual de error; no bloquea la interfaz.

### Rendimiento

- Página Mapa separada del bundle inicial.
- MapLibre y su CSS se descargan solo cuando el planificador tiene una clave configurada.
- Bundle inicial: aproximadamente 296 kB minificado / 95 kB gzip.
- MapLibre queda en un chunk diferido de aproximadamente 1,08 MB minificado / 295 kB gzip.
- El worker de MapLibre se sirve como asset diferido separado de aproximadamente 519 kB y fue verificado en Vite.
- Vite advierte que el chunk diferido de MapLibre supera 500 kB; no afecta el bundle inicial, pero queda como oportunidad de optimización futura.
- Búsqueda con 420 ms de debounce, cancelación mediante `AbortController` y caché de memoria de 10 minutos.
- Adaptador limitado a intervalos de 260 ms y 240 solicitudes por sesión; los tiles no están incluidos en ese contador.

### Responsive visual

- 390 × 844: aprobado, sin overflow horizontal.
- 768 × 1024: aprobado, sin overflow horizontal.
- 1440 × 1000: aprobado, sin overflow horizontal.
- Estado sin clave: sin excepciones de consola.
- Estado con clave inválida: único error observado fue el HTTP 401 esperado de Geoapify.
- Worker de MapLibre conectado sin errores después de configurar `?worker&url`.
- Navegación inferior, sidebar, inputs de 16 px, áreas táctiles y safe areas preservados.

### Limitaciones verificables

- La validación real de Geoapify se realizó en navegador local; no sustituye la prueba de red y WebView en iPhone/Android físicos.
- GPS se implementó con `@capacitor/geolocation`, pero la señal, precisión y prompts requieren prueba en hardware.
- Las atribuciones proceden del `style.json` de Geoapify; se verificarán visualmente cuando el mapa cargue con una clave válida.
- Los proyectos nativos `ios/` y `android/` siguen diferidos al gate nativo.

## Fase 2

**Ejecución:** 16 de noviembre de 2026.

**Resultado en navegador:** aprobado. Queda pendiente la comprobación en hardware real.

### Automatización

- ✅ `npm run typecheck`
- ✅ `npm test`: 4 pruebas aprobadas.
- ✅ `npm run build`: build de producción generado.
- ✅ `npm audit --audit-level=high`: 0 vulnerabilidades conocidas.
- ✅ Configuración de Capacitor reconocida por su CLI.

### Funcional

- Inicio, Acerca y Ajustes navegan sin recarga.
- Tema automático, claro y oscuro cambia la interfaz y persiste.
- Movimiento reducido persiste y elimina animaciones no esenciales.
- Restablecimiento borra la configuración local.
- Facebook, TikTok y YouTube abren sus URLs oficiales.
- No aparecen mapa, rutas, favoritos, historial ni estadísticas.

### Responsive

- Móvil estrecho: 360 × 800.
- Móvil común: 390 × 844.
- Tableta: 768 × 1024.
- Escritorio: 1440 × 1000.
- Sin scroll horizontal del documento, medido con Chrome DevTools Protocol.
- Barra inferior respeta safe area; escritorio usa sidebar.
- Consola sin excepciones durante la revisión automatizada.

### Accesibilidad

- Enlace para saltar al contenido.
- Navegación con nombres accesibles y estado activo.
- Controles con 44 px o más, foco visible y feedback de presión.
- Tema no depende solo de color; selector usa `role=radio`.
- `prefers-reduced-motion` y preferencia local soportados.
- Zoom no está bloqueado; inputs mantienen 16 px.

### Pendiente de dispositivo real

- Safe areas/Dynamic Island.
- Sensación táctil y hover persistente.
- Barra del sistema y teclado móvil.
- Safari iOS y Chrome Android reales.
