# Marca EcoRuta

## Dirección

EcoRuta se presenta como una herramienta urbana, sostenible y confiable. Debe sentirse clara, serena, práctica y cercana; nunca futurista de forma artificial ni saturada de elementos “eco”.

## Logotipo original protegido

La única fuente maestra autorizada es [`assets/logo-ecoruta.png`](./assets/logo-ecoruta.png): PNG transparente de 168 × 256 px, con Git blob `fc3af985e8228aa7c74b016b9a4e4d4378851ecd`.

No se permite generar, redibujar, reinterpretar, recolorear, recortar, sustituir ni modificar este símbolo. La interfaz debe adaptarse a su identidad, no transformar el logotipo para ajustarlo a una nueva dirección visual.

Los recursos nativos actuales quedan protegidos y no deben regenerarse sin autorización expresa:

- `assets/logo.png`: encuadre cuadrado preparado desde el original;
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`: icono instalado en iOS;
- `ios/App/App/Assets.xcassets/Splash.imageset/`: variantes de lanzamiento claro y oscuro.

Una animación puede aplicar escala, opacidad o desplazamiento suave al contenedor completo. Un resplandor puede vivir en una capa separada detrás del logo. No puede deformar el símbolo ni cambiar sus píxeles, proporciones, trazos o colores. Cualquier futura pantalla de acceso o identidad deberá importar el mismo archivo maestro; esta regla no autoriza por sí sola a añadir autenticación.

## Paleta por roles

| Token | Claro | Oscuro | Uso |
|---|---:|---:|---|
| `brand-primary` | `#08664F` | `#70D9B3` | Marca y énfasis |
| `action-primary` | `#08664F` | `#70D9B3` | Acción principal |
| `accent-mobility` | `#0B8F8A` | `#65D8D1` | Bicicleta/movilidad |
| `info` | `#1F78B4` | `#79BCE7` | Información |
| `surface` | `#F4F7F5` | `#101815` | Fondo principal |
| `surface-raised` | `#FFFFFF` | `#18231F` | Tarjetas y navegación |
| `text-primary` | `#14211C` | `#F1F7F4` | Texto principal |
| `text-muted` | `#607069` | `#A9BAB2` | Texto secundario |

Los colores de estado no se usan como decoración. El modo oscuro es un sistema propio, no una inversión automática.

## Tipografía

Fuente nativa del sistema: SF Pro en Apple, Roboto en Android y `system-ui` en web. Esto mejora integración, rendimiento y legibilidad sin depender de una fuente remota.

## Movimiento

Transiciones de 120–220 ms para controles frecuentes. Entradas de pantalla discretas. Respetar sistema y preferencia interna de movimiento reducido.

El splash React actual cumple esta regla: `Brand` importa directamente `assets/logo-ecoruta.png` y la entrada anima únicamente opacidad y escala del contenedor.

## Voz

Clara, útil y honesta. Evitar promesas vagas, cifras sin fuente y lenguaje de culpa ambiental.
