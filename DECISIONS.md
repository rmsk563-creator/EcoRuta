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
- Sin `VITE_GEOAPIFY_API_KEY` no se instancia el mapa ni se habilitan solicitudes.
- La búsqueda exige tres caracteres, espera 420 ms, cancela solicitudes obsoletas y conserva resultados repetidos durante 10 minutos solo en memoria.
- Geocodificación y routing se limitan a menos de 4 solicitudes por segundo y 240 por sesión. El consumo de tiles queda sujeto a MapLibre/Geoapify y no puede contarse desde el adaptador.
- Las rutas solo se calculan al pulsar “Comparar rutas”; no hay recálculo automático al mover el GPS.
- Las claves `VITE_` son visibles en el cliente. Deben ser diferentes por entorno y protegerse con restricciones de origen/referrer; CORS por sí solo no es una restricción.
