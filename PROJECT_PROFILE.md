# EcoRuta — Project Profile

## Identidad

EcoRuta · aplicación de movilidad sostenible · Production path · v0.3 · Fase 3 implementada con validación real pendiente de credencial.

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
- Diferidas: favoritos, historial y estadísticas.
- Fuera de alcance inicial: cuentas, contraseñas, sincronización y ubicación en segundo plano.

## Datos y realidad

Solo se muestran datos producidos por funciones reales. Sin API key, el planificador permanece en estado de configuración. Las distancias, duraciones y geometrías solo se renderizan desde respuestas válidas de Geoapify.

## Restricciones

Sin Figma. `main` y GitHub Pages permanecen intactos. No publicar la rama de desarrollo. No exponer credenciales privadas.

## Estado actual

Fase 3 compilada y probada el 16-11-2026. Siguiente gate: añadir una clave Geoapify restringida y validar mapa, geocodificación, GPS y rutas reales en Lima; después probar en hardware.

## Enlaces

- Producción actual: <https://rmsk563-creator.github.io/EcoRuta/>
- Repositorio: <https://github.com/rmsk563-creator/EcoRuta>
- Desarrollo: `develop/mobile-app`
