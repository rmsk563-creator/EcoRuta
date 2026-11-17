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
