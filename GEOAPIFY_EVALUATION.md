# Evaluación de Geoapify

**Verificado:** 17 de noviembre de 2026.

## Condiciones vigentes

- Plan gratuito: 3.000 créditos diarios y hasta 5 solicitudes por segundo.
- Puede usarse en aplicaciones comerciales y en producción dentro de los límites del plan.
- Las solicitudes simples de geocodificación y routing suelen consumir un crédito.
- Los tiles cuestan 0,25 créditos por solicitud; MapLibre usa tiles vectoriales de 512 px.
- El exceso puede producir respuestas HTTP 429 y el plan gratuito no incluye SLA.
- Debe mostrarse atribución de Geoapify y de las fuentes de datos.

## Atribución obligatoria

- `Powered by Geoapify` con enlace a <https://www.geoapify.com/>.
- `© OpenStreetMap contributors` con enlace a <https://www.openstreetmap.org/copyright>.
- `© OpenMapTiles` para estilos basados en su esquema.
- Al usar `style.json` con MapLibre, Geoapify incorpora las atribuciones; no deben ocultarse.

## Compatibilidad

Geoapify documenta uso directo con MapLibre mediante:

```text
https://maps.geoapify.com/v1/styles/{style}/style.json?apiKey=...
```

Routing ofrece `walk`, `bicycle`, variantes de bicicleta e instrucciones giro a giro. El modo de transporte público no se habilitará hasta validar su cobertura real en Lima.

## Seguridad

- La clave se configura con `VITE_GEOAPIFY_API_KEY` y nunca se confirma en Git.
- La web pública debe usar una clave propia con restricciones de HTTP referrer y origin. CORS permite leer respuestas, pero no es una restricción de acceso.
- Una clave compilada en iOS/Android es pública. Las restricciones de IP, referrer, origin y CORS no protegen de forma equivalente una app nativa; se requiere una clave móvil separada, vigilancia de cuota y rotación.
- Si se necesita ocultar la clave usada por APIs distintas de tiles, la protección fuerte requiere un backend proxy aprobado.
- Varias claves del mismo proyecto comparten la cuota; separarlas permite restricciones, estadísticas y rotación independientes.

## Comparación

- **LocationIQ:** 5.000 solicitudes/día, pero 2 solicitudes/segundo y uso comercial gratuito limitado con atribución prominente.
- **OpenRouteService:** buen nivel gratuito para routing, pero requeriría otro proveedor para tiles y aumentaría la complejidad operativa.
- **MapTiler:** el plan gratuito está orientado a pruebas/no comercial; no es mejor para producción gratuita.

## Decisión

Mantener Geoapify como proveedor inicial. El diseño por adaptadores evita dependencia irreversible y permite cambiar si las pruebas en Lima muestran mala cobertura o si el consumo de tiles supera la cuota.

## Fuentes oficiales

- <https://www.geoapify.com/pricing/>
- <https://www.geoapify.com/terms-and-conditions/>
- <https://apidocs.geoapify.com/docs/maps/map-tiles/>
- <https://apidocs.geoapify.com/docs/routing/>
- <https://locationiq.com/pricing>
- <https://openrouteservice.org/plans/>
- <https://www.maptiler.com/cloud/pricing/>
