# Roadmap

## Fase 1 — Auditoría y arquitectura

- ✅ Repositorio, sitio y código auditados.
- ✅ Rama `develop/mobile-app` creada y publicada.
- ✅ Arquitectura aprobada.

## Fase 2 — Interfaz profesional

- ✅ Migración React + TypeScript + Vite.
- ✅ Shell responsive y navegación.
- ✅ Temas claro, oscuro y automático.
- ✅ Configuración persistente.
- ✅ Acerca de EcoRuta y redes oficiales verificadas.
- ✅ Pruebas automatizadas y QA visual en navegador.
- 🟡 Revisión en iPhone y Android físicos pendiente para el gate nativo.

## Fase 3 — Mapas, GPS y rutas

- ✅ Adaptador Geoapify y renderer MapLibre con carga diferida.
- ✅ Configuración segura mediante entorno y estado explícito sin clave.
- ✅ Permisos, seguimiento GPS y errores de ubicación implementados.
- ✅ Autocomplete Lima-only, geocodificación inversa y selección en mapa.
- ✅ Rutas caminar/bicicleta, trazado, distancia y duración implementados.
- ✅ Control de frecuencia, debounce, cancelación y caché temporal.
- ✅ Geoapify real validado con mapa, geocodificación y rutas caminar/bicicleta.
- 🟡 GPS y permisos nativos pendientes de iPhone/Android físicos.
- ⏸️ Transporte público diferido hasta validar datos.

## Fase 4 — Datos locales y actividad

- ✅ Repositorio tipado con IndexedDB web y SQLite nativo seleccionable por plataforma.
- ✅ Esquema v2, migraciones, validación y errores de cuota/disponibilidad.
- ✅ Favoritos de lugares y rutas, edición, búsqueda, orden y eliminación.
- ✅ Historial separado de rutas consultadas mediante registro explícito.
- ✅ Filtros, detalle, eliminación y recálculo desde historial.
- ✅ Estadísticas por semana, mes y año, comparación y gráficos interactivos.
- ✅ Impacto potencial basado en sustitución declarada de automóvil y factor MTC.
- ✅ Preferencias ampliadas, privacidad, borrado y exportación/importación JSON.
- ✅ QA responsive y consola en navegador.
- ✅ Regresión MapLibre corregida y flujo real Geoapify repetido sin errores de consola.
- 🟡 SQLite, archivos y persistencia nativa pendientes de hardware iOS/Android.

## Fase 5 — iOS nativo

- ✅ Dependencias Capacitor 8 para iOS, navegador, archivos y compartir instaladas.
- ✅ Proyecto Xcode generado con Swift Package Manager, identificador `com.ecoruta.app` e icono EcoRuta.
- ✅ Descripciones de ubicación y manifiesto de privacidad configurados.
- ✅ Build Debug para simulador completado con Xcode.
- ✅ MapLibre, tiles Geoapify, atribuciones, búsqueda y rutas reales observados en WKWebView.
- ✅ Prompt de ubicación, GPS simulado y precisión recibida mediante el plugin nativo.
- ✅ SQLite creó la base v2 y conservó favoritos e historial tras terminar y volver a abrir la app.
- ✅ Exportación JSON abrió la hoja nativa de compartir y el selector de Archivos.
- ✅ Tema oscuro conservado tras reiniciar la aplicación.
- 🟡 Importación mediante el selector iOS preparada, pero pendiente de una selección manual real.
- 🟡 Firma, instalación y lista completa de pruebas en iPhone físico pendientes del propietario.
- ✅ Build firmado e instalación de `com.ecoruta.app` completados en un iPhone 15 Pro Max físico.
- 🟡 Primer arranque y pruebas físicas pendientes mediante **Run** interactivo en Xcode; el lanzamiento por terminal fue bloqueado después de instalar.
- ⏸️ Android no generado: este Mac no tiene Android Studio, JDK ni SDK/ADB instalados.

## Preparación web pública

- ✅ Build GitHub Pages separado con base `/EcoRuta/` y salida `dist-pages/`.
- ✅ Navegación hash, assets y persistencia IndexedDB compatibles con el subdirectorio.
- ✅ Workflow manual preparado; no se publica al hacer push.
- 🟡 Clave Geoapify web dedicada y restricciones pendientes de configurar en el panel del propietario.
- ⏸️ Publicación y smoke test remoto pendientes de autorización expresa.

## Fase 6 — Experiencia premium y autenticación preparada

- ✅ Splash React animado de 1,5–2 segundos reutilizando exclusivamente `assets/logo-ecoruta.png`.
- ✅ Iluminación y línea de recorrido en capas separadas, sin alterar los píxeles del logotipo.
- ✅ Movimiento reducido del sistema y preferencia local respetados.
- ✅ Transiciones ligeras para navegación, panel de ruta, resultados, favoritos, indicadores y gráficos.
- ✅ Pantallas visuales de bienvenida, inicio, registro y recuperación, siempre opcionales.
- ✅ Ajustes informa “Sin sesión”; no existe cierre de sesión hasta conectar una sesión real.
- ✅ Firebase Authentication y Supabase Auth evaluados con fuentes vigentes.
- ✅ Build web, automatización y primera compilación/arranque en simulador completados.
- 🟡 Elección e integración del proveedor detenidas hasta aprobación del propietario.
- 🟡 Rendimiento táctil, teclado y flujo visual completo pendientes de iPhone físico.

## Fases 7–8

- ⏳ Autenticación real, solo después de elegir proveedor y alcance de sincronización.
- ⏳ Preparación de distribución y tiendas, solo después de aprobar hardware real.
