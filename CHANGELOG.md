# Changelog

## 0.3.0 — Fase 3

### Añadido

- Mapa interactivo MapLibre centrado y limitado al área metropolitana de Lima.
- Búsqueda Geoapify con autocomplete y resultados en español.
- Selección de origen/destino desde búsqueda o mapa.
- Seguimiento GPS mediante el plugin oficial de Capacitor y permiso explícito.
- Rutas reales para caminar y bicicleta con distancia, duración y trazado GeoJSON.
- Comparación de modalidades y selección visual del trazado.
- Estados de configuración, carga, red, timeout, cuota, clave rechazada y ruta no disponible.
- Límites de solicitudes, debounce, abortado y caché temporal en memoria.
- Configuración por `.env.local` y guía de protección de API keys.
- Carga diferida de la página Mapa y del motor MapLibre.

### Pendiente de credencial/dispositivo

- Validación end-to-end con una API key restringida del propietario.
- GPS y permisos en iPhone/Android físicos.

## 0.2.0 — Fase 2

### Añadido

- Arquitectura React + TypeScript + Vite con CLI y configuración base de Capacitor.
- Shell mobile-first con sidebar en escritorio y navegación inferior en móvil/tableta.
- Inicio, Acerca de y Ajustes con rutas funcionales.
- Temas automático, claro y oscuro.
- Preferencia de movimiento reducido.
- Persistencia local mediante Capacitor Preferences.
- Enlaces oficiales de Facebook, TikTok y YouTube.
- Pruebas automatizadas, documentación de producto y evaluación de Geoapify.

### Retirado

- Cuenta y contraseña simuladas.
- Datos fijos de impacto.
- Comparador geométrico, mapa SVG y estimaciones presentadas como rutas.
- Mensajes de acceso anticipado y funciones no disponibles.

### Preservado

- Identidad EcoRuta, logo, dirección cromática y enfoque de sostenibilidad.
- Versión publicada en `main`, sin cambios.
