# QA — EcoRuta

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
