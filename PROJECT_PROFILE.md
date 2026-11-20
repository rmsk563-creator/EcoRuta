# EcoRuta — Project Profile

## Identidad

EcoRuta · aplicación de movilidad sostenible · Production path · v0.7 · build 6 instalada y verificada en iPhone físico.

## Objetivo

Ayudar a personas en Lima a comparar opciones sostenibles y tomar decisiones informadas con rutas y datos verificables.

## Público

Personas que caminan o usan bicicleta para desplazarse en Lima y necesitan una experiencia móvil clara, accesible y privada.

## Propuesta central

Muévete mejor con rutas reales, preferencias personales y estimaciones ambientales transparentes.

## Flujo principal

Buscar destino → elegir origen → comparar caminar/bicicleta → revisar ruta → iniciar recorrido → guardar actividad → consultar impacto.

## Arquitectura

React + TypeScript + Vite; Capacitor para iOS/Android; MapLibre para el mapa; Geoapify candidato inicial para tiles, geocodificación y routing; persistencia local sin cuenta.

## Dirección visual

Clara, urbana, serena, confiable y táctil. Verde profundo como marca, teal para movilidad activa, azul para información y neutros cálidos.

## Funciones principales

- Fase 2: shell, navegación, temas, configuración y redes oficiales.
- Fase 3: mapa, GPS, búsqueda, selección de puntos y comparación caminar/bicicleta integrados detrás de una API key.
- Fase 4: favoritos, historial explícito, estadísticas, impacto estimado, exportación/importación y borrado local.
- Fase 5: proyecto iOS, permisos, privacidad, SQLite, exportación nativa y apertura segura de enlaces.
- Fase 6: splash, animaciones y autenticación Firebase preparada pero no configurada.
- Fase 7: mapa principal, Perfil, Actividad y personalización cromática persistente.
- Fase 8: navegación ampliada, Explorar real, panel premium y Eco IA preparada con Workers AI detrás de un backend seguro todavía no desplegado.
- Fuera del alcance activo: sincronización, notificaciones, Android y ubicación en segundo plano.

## Datos y realidad

Solo se muestran datos producidos por funciones reales. Sin API key, el planificador permanece en estado de configuración. Favoritos y recorridos viven únicamente en IndexedDB web o SQLite nativo. Una ruta consultada no entra al historial hasta una confirmación explícita.

## Restricciones

Sin Figma. `main` y GitHub Pages permanecen intactos hasta autorización expresa. No exponer credenciales privadas. El logotipo maestro `assets/logo-ecoruta.png`, el icono iOS instalado y los splash nativos no pueden sustituirse ni rediseñarse.

## Estado actual

EcoRuta 0.7.0 build 6 está instalada en un iPhone 15 Pro Max físico con Firebase real, navegación de cuatro secciones, Explorar mediante Geoapify y el mapa premium. Eco IA está preparada para Workers AI pero continúa desactivada hasta disponer de una URL HTTPS aprobada. No existe recurso Cloudflare ni despliegue. La versión web React mantiene un build GitHub Pages separado y manual para `/EcoRuta/`; todavía no está publicada. Android continúa pendiente.

## Enlaces

- Producción actual: <https://rmsk563-creator.github.io/EcoRuta/>
- Repositorio: <https://github.com/rmsk563-creator/EcoRuta>
- Desarrollo: `develop/mobile-app`
