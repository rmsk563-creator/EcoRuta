# QA — EcoRuta

## Fase 3

**Ejecución:** 16 de noviembre de 2026.

**Resultado:** implementación, pruebas unitarias, estado sin clave, manejo de clave rechazada y responsive aprobados. La validación end-to-end con datos reales está pendiente de una API key del propietario.

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

- No se usó una API key real, por lo que no se afirma que tiles, resultados de búsqueda o rutas de Lima hayan sido validados end-to-end.
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
