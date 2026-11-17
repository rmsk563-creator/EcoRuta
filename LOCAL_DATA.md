# Datos locales, privacidad e impacto

## Arquitectura

EcoRuta usa una interfaz `EcoRutaRepository` común:

- navegador: IndexedDB mediante `idb`;
- iOS/Android: SQLite mediante `@capacitor-community/sqlite`;
- ajustes pequeños: Capacitor Preferences.

El esquema actual es v2. Ambos adaptadores aplican migraciones, validan registros y traducen errores de cuota, disponibilidad, duplicados y corrupción a mensajes comprensibles.

## Datos almacenados

Un favorito conserva nombre, tipo y coordenadas. Una ruta favorita conserva origen, destino y modalidad, pero no tiempo ni distancia antiguos.

Un recorrido realizado conserva fecha, origen, destino, modalidad, distancia, duración, proveedor y si el usuario declaró que sustituyó un viaje en automóvil. Una consulta de Geoapify no se guarda automáticamente.

## Datos enviados a Geoapify

Al usar mapa, búsqueda o rutas se envían a Geoapify:

- texto escrito en el buscador;
- coordenadas seleccionadas o GPS usadas como origen/destino;
- modalidad requerida para el cálculo.

EcoRuta no envía a servidores propios la lista de favoritos, el historial, el alias ni las estadísticas.

## Exportación e importación

La exportación JSON usa `format: ecoruta-local-data`, versión de exportación y versión de esquema. La importación acepta hasta 25 MB, valida tipos, fechas, coordenadas, distancias y límites de registros, y permite combinar sin duplicar o reemplazar.

La copia no incluye preferencias ni API keys. No existe recuperación automática: el archivo debe conservarse manualmente.

## Metodología ambiental

Se usa un factor de `0,200 kg CO₂/km`, correspondiente a CO₂ directo de un automóvil M1 moderno a gasolina en la metodología oficial del Ministerio de Transportes y Comunicaciones del Perú de 2025:

<https://cdn.www.gob.pe/uploads/document/file/7532063/6402674-anexo-resolucion-directoral-n-001-2025-mtc-18.pdf?v=1737659691>

La fórmula es:

```text
CO₂ potencialmente evitado = kilómetros declarados como sustitución de automóvil × 0,200 kg/km
```

Es una estimación potencial, no una medición. No incluye ciclo de vida, congestión, clima, estilo de conducción ni fabricación.
