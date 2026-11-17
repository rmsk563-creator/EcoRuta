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
