# Changelog

## 0.4.0 — Fase 4

### Añadido

- IndexedDB web y SQLite nativo detrás de repositorios tipados y seleccionados por plataforma.
- Esquema v2 con migraciones, deduplicación, errores comprensibles y borrado granular.
- Favoritos de lugares y rutas frecuentes con búsqueda, orden, edición y reapertura en mapa.
- Historial exclusivo de recorridos confirmados, con filtros, detalle, eliminación y recálculo.
- Estadísticas semanales, mensuales y anuales con comparación, modalidad y gráfico interactivo.
- Estimación de CO₂ potencialmente evitado con factor oficial MTC y declaración previa de sustitución de automóvil.
- Alias, modalidad preferida, unidades, privacidad de historial y gestión completa de datos.
- Exportación e importación JSON con versión, tamaño máximo, validación y estrategias combinar/reemplazar.

### Preservado

- Mapa, GPS, temas, redes sociales, MapLibre y Geoapify de Fases 2 y 3.
- `main` y GitHub Pages sin cambios.

### Pendiente de dispositivo

- Verificación de SQLite, selector/descarga de archivos y persistencia tras cierre en iPhone/Android físicos.
- Revisión de obligaciones de exportación criptográfica derivadas de SQLCipher antes de distribuir en tiendas.

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
