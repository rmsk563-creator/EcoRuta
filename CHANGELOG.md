# Changelog

## 0.5.0 — Fase 5

### Añadido

- Proyecto iOS generado con Capacitor 8.6.2, Swift Package Manager y destino mínimo iOS 15.
- Icono y pantallas de inicio derivados del logo original de EcoRuta.
- Permisos de ubicación con texto de uso visible para iOS.
- Manifiesto de privacidad para Preferences y Filesystem.
- Apertura nativa de enlaces HTTPS mediante Capacitor Browser.
- Exportación JSON mediante Filesystem y la hoja nativa de compartir.
- Pruebas de plataforma para enlaces seguros y limpieza del archivo de exportación.
- Build separado para GitHub Pages bajo `/EcoRuta/`, sin interferir con `dist/` de Capacitor.
- Workflow manual de Pages con clave Geoapify web suministrada mediante un secreto de Actions.

### Verificado en simulador

- Compilación Xcode, apertura, navegación, MapLibre/Geoapify en WKWebView y atribuciones.
- Búsqueda real, rutas a pie y bicicleta, trazado, permiso GPS y ubicación simulada.
- Creación SQLite, favoritos, recorrido confirmado y persistencia después de terminar y reabrir.
- Exportación mediante hoja nativa y persistencia del tema oscuro.

### Pendiente de hardware

- Firma e instalación en iPhone físico.
- Importación JSON seleccionando manualmente un archivo en iOS.
- GPS, safe areas, teclado, orientación y persistencia bajo condiciones reales.
- Proyecto y pruebas Android; el entorno actual no tiene el toolchain requerido.

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

### Corregido

- Inicialización de marcadores MapLibre con coordenadas antes de añadirlos al mapa.
- Recuperación localizada ante errores de renderizado del mapa, sin dejar la aplicación completa en blanco.
- Pruebas de regresión para el orden del marcador y el reintento del mapa.

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
