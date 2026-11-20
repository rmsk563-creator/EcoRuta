# Decisiones

## 2026-11-16 — Arquitectura móvil

- React + TypeScript + Vite para la aplicación.
- Capacitor como contenedor iOS/Android.
- Sin Figma; la fuente visual de verdad es el código y `MARCA.md`.
- Sin autenticación ni backend mientras el almacenamiento local sea suficiente.
- `main` y la web publicada no se modifican durante el desarrollo.

## 2026-11-16 — Honestidad funcional

- Una función no aparece como disponible hasta tener integración real y pruebas.
- Se eliminan cuenta simulada, datos de impacto fijos, rutas geométricas y métricas inventadas.
- Transporte público permanece diferido hasta contar con datos fiables para Lima.

## 2026-11-16 — Mapas

- MapLibre será el renderer.
- Geoapify es el candidato inicial por permitir producción comercial en el plan gratuito, compatibilidad con MapLibre y cobertura unificada de tiles, geocodificación y routing.
- Toda integración se implementará detrás de adaptadores para permitir cambio de proveedor.
- Atribuciones de Geoapify, OpenStreetMap y OpenMapTiles permanecerán visibles donde corresponda.

## 2026-11-16 — Integración Fase 3

- La pantalla Mapa se carga de forma diferida y MapLibre se descarga solo al abrir un planificador configurado.
- El worker ES module de MapLibre se empaqueta como asset propio mediante `?worker&url`, según la integración oficial para Vite.
- Sin `VITE_GEOAPIFY_API_KEY` no se instancia el mapa ni se habilitan solicitudes.
- La búsqueda exige tres caracteres, espera 420 ms, cancela solicitudes obsoletas y conserva resultados repetidos durante 10 minutos solo en memoria.
- Geocodificación y routing se limitan a menos de 4 solicitudes por segundo y 240 por sesión. El consumo de tiles queda sujeto a MapLibre/Geoapify y no puede contarse desde el adaptador.
- Las rutas solo se calculan al pulsar “Comparar rutas”; no hay recálculo automático al mover el GPS.
- Las claves `VITE_` son visibles en el cliente. Deben ser diferentes por entorno y protegerse con restricciones de origen/referrer; CORS por sí solo no es una restricción.

## 2026-11-17 — Persistencia local Fase 4

- Web usa IndexedDB mediante `idb`; iOS/Android seleccionan `@capacitor-community/sqlite` 8.1.1, compatible con Capacitor 8.
- Capacitor Preferences conserva solo configuración pequeña. Favoritos e historial no usan `localStorage`.
- Los adaptadores implementan una interfaz común para permitir sincronización opcional futura sin acoplar la UI.
- El esquema actual es v2 y tiene migraciones explícitas en IndexedDB y SQLite.
- La versión nativa de SQLite queda implementada pero no verificada hasta generar proyectos y probar hardware real.
- El plugin SQLite utiliza SQLCipher incluso sin cifrado; el gate nativo debe revisar las obligaciones de exportación criptográfica aplicables a la distribución.

## 2026-11-17 — Actividad e impacto

- Consultar una ruta nunca crea historial. Solo “Registrar como realizado” guarda una actividad confirmada.
- Los favoritos de ruta guardan puntos y modalidad, no tiempos antiguos; Geoapify debe recalcularlos.
- El CO₂ potencial usa 0,200 kg/km para automóvil M1 moderno a gasolina según metodología MTC Perú 2025.
- El cálculo ambiental se aplica solo cuando el usuario declara que habría usado automóvil y se presenta como estimación, no como medición.
- La exportación manual usa JSON versionado y validado; no existe recuperación automática ni nube.

## 2026-11-17 — Contenedor iOS Fase 5

- El proyecto iOS usa Capacitor 8.6.2 y Swift Package Manager; CocoaPods no es necesario para los plugins actuales.
- Se mantiene `com.ecoruta.app` como identificador base. La firma personal puede requerir un identificador único antes de instalar en un iPhone.
- Los enlaces HTTPS se abren con Capacitor Browser en iOS; se rechazan esquemas externos no seguros.
- La exportación nativa escribe temporalmente el JSON en caché, abre la hoja de compartir y elimina el archivo temporal al finalizar. La web conserva la descarga por Blob.
- La importación conserva el selector HTML de archivos de WKWebView porque permite selección local con gesto real y reutiliza la validación existente. Su flujo completo queda pendiente de prueba manual.
- El manifiesto de privacidad declara `UserDefaults` con razón `CA92.1` y marcas de tiempo de archivos con `C617.1`. No se declara rastreo ni recolección por servidores propios.
- Una clave `VITE_` queda incorporada al bundle y no es secreta en iOS. Se usará una clave Geoapify exclusiva para móvil, con cuota vigilada y rotación; para protección fuerte se necesitaría un backend proxy aprobado.
- Android se difiere hasta disponer de Android Studio, JDK y SDK. No se declara generado ni probado.

## 2026-11-17 — Build web para GitHub Pages

- El build estándar conserva `base: './'`, salida `dist/` y compatibilidad con Capacitor.
- El modo `github-pages` usa `base: '/EcoRuta/'` y salida independiente `dist-pages/`.
- `HashRouter` se mantiene para que las rutas funcionen bajo un hosting estático sin reglas de reescritura.
- La publicación usa GitHub Actions con activación exclusivamente manual desde `develop/mobile-app`; hacer push no despliega por sí solo.
- Geoapify web usa una clave independiente inyectada desde `GEOAPIFY_WEB_API_KEY`, restringida por referrer/origin y vigilada por separado de la clave móvil.
- IndexedDB web y SQLite nativo no se sincronizan. Cada navegador o instalación conserva su propio conjunto local de favoritos e historial.

## 2026-11-17 — Identidad visual protegida

- `assets/logo-ecoruta.png` es la única fuente maestra del logotipo; su Git blob verificado es `fc3af985e8228aa7c74b016b9a4e4d4378851ecd`.
- El icono iOS y los splash actuales se conservan como recursos aprobados derivados del original; no se regeneran, reemplazan ni rediseñan sin autorización expresa.
- Las animaciones solo transforman el contenedor completo mediante escala, opacidad o movimiento suave. Los efectos de luz deben estar en capas separadas y no alterar el diseño del logo.
- Cualquier futura pantalla de acceso, registro o identidad reutilizará el archivo maestro. Esta decisión no cambia el alcance actual sin autenticación.

## 2026-11-18 — Presentación de acceso Fase 6

- El splash web dura aproximadamente 1,84 segundos incluyendo salida y reutiliza `Brand.tsx`; el logo solo recibe transformaciones de contenedor.
- La línea de recorrido se revela mediante `clip-path`; no se anima el trazo SVG ni se aplican filtros o transformaciones al lienzo MapLibre.
- Las pantallas de cuenta son una presentación visual opcional. Sus acciones de envío permanecen deshabilitadas y explican que la conexión está pendiente.
- Ajustes no muestra “Cerrar sesión” porque no existe una sesión real. Aparecerá únicamente al integrar un proveedor aprobado.
- Firebase Authentication es la recomendación inicial para cuentas sin sincronización remota. Supabase queda como alternativa si se aprueba Postgres/RLS y sincronización.
- La recomendación no selecciona ni autoriza un proveedor. Ningún SDK, clave, backend ni migración de datos se incorpora hasta decisión expresa.

## 2026-11-18 — Firebase Authentication Fase 6B

- Firebase Authentication queda aprobado para correo y contraseña; la integración usa el SDK JavaScript modular tanto en web como dentro de Capacitor.
- La cuenta sigue siendo opcional. Mapa, rutas, favoritos, historial y estadísticas funcionan como invitado.
- Firebase conserva únicamente identidad y sesión. Los datos de movilidad no se migran, sincronizan ni eliminan al cerrar sesión; permanecen en IndexedDB o SQLite.
- La persistencia de sesión usa IndexedDB con almacenamiento local como alternativa. No se guardan contraseñas ni se registran credenciales o tokens.
- Solo entra al cliente la configuración pública de una app Firebase Web. Se prohíben cuentas de servicio, claves administrativas y SDK Admin.
- La integración real no se considera aprobada hasta probar registro, inicio, recuperación, persistencia y cierre con un proyecto Firebase configurado, en web y después en iOS.

## 2026-11-18 — Navegación y personalización Fase 7

- El planificador de mapas ocupa la ruta principal `/`; `/map` se conserva únicamente como redirección compatible.
- La navegación persistente expone solo Mapa y Actividad. Perfil se abre desde el encabezado y Ajustes vive bajo `/profile/settings`.
- Perfil no inventa nombres, correos ni avatares. La identidad aparece solo desde una sesión real; sin sesión comunica acceso local sin cuenta.
- Editar perfil no se ofrece hasta conectar y probar almacenamiento real para el cambio. Notificaciones se presentan únicamente como estado informativo: EcoRuta no las envía.
- Las preferencias usan esquema v3 y migran v2/v1 sin borrar valores. El color predeterminado es Verde Eco; las variantes solo sustituyen tokens de interfaz y no alteran el logo, el estilo base del mapa ni los colores semánticos de rutas.
- La app permanece utilizable sin cuenta. El acceso obligatorio y la redirección post-splash se difieren hasta validar Firebase real y recibir aprobación expresa.

## 2026-11-18 — Validación móvil prioritaria

- El iPhone 15 Pro Max físico conectado por USB-C es el entorno principal de validación; web queda como plataforma secundaria y Android se preparará después.
- Las builds de desarrollo pueden instalarse sobre `com.ecoruta.app` sin autorización repetida, siempre como actualización y nunca mediante desinstalación.
- SQLite, favoritos, historial, estadísticas y preferencias deben conservarse entre instalaciones. No se autorizan borrados, restablecimientos ni cambios sobre otras aplicaciones.
- El propietario introduce contraseñas, confirma correos y acepta permisos personales. Esos datos no se solicitan ni se registran.
- Tras cada instalación se comprueba apertura, autenticación y regresiones de las funciones principales antes de considerar aprobada la build.

## 2026-11-20 — Eco IA con Workers AI Free

- Cloudflare Workers AI Free sustituye a Gemini Free por su compromiso de retención cero y de no entrenar modelos con contenido del cliente.
- El modelo inicial es `@cf/meta/llama-3.3-70b-instruct-fp8-fast`: multilingüe, Cloudflare-hosted y compatible con JSON Mode. La aplicación valida nuevamente cada respuesta porque JSON Mode no garantiza el esquema por sí solo.
- El Worker verifica tokens ID de Firebase mediante firma RS256, emisor, audiencia, vigencia, UID y correo verificado. No requiere cuenta de servicio ni clave administrativa.
- Un Durable Object SQLite limita el uso por UID anonimizado. El contrato acepta únicamente el mensaje actual y rechaza coordenadas, historial, correo y cualquier campo adicional.
- El modelo solo puede proponer un `destinationQuery`. Abrirlo en el mapa requiere confirmación explícita y una búsqueda posterior de Geoapify; rutas, tiempos y distancias nunca proceden del modelo.
- El backend no guarda conversaciones. El historial permanece desactivado por defecto; si el usuario lo activa, se conserva solo en el dispositivo y no se envía como contexto.
- El cliente queda preparado detrás de `VITE_ECO_AI_API_URL`. Sin una URL HTTPS aprobada, la conversación permanece desactivada y no aparenta estar disponible.
- No se creó cuenta, recurso remoto ni despliegue. Workers Paid, métodos de pago y consumo facturable siguen prohibidos sin autorización expresa.
