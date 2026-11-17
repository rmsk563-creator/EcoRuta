# Instalación y prueba en iPhone

El proyecto `ios/` ya existe, compila con Xcode y fue ejecutado en un simulador. La aprobación final requiere firma e instalación en un iPhone físico.

## Requisitos

- Mac con Xcode actualizado.
- iPhone conectado por cable o disponible para desarrollo inalámbrico.
- Apple ID añadido en Xcode y un equipo de firma seleccionado.
- API key Geoapify separada para la aplicación móvil. Debe considerarse pública, vigilarse y rotarse si se abusa.

## Preparar el paquete

```bash
npm install
npm run build
npx cap sync ios
npx cap open ios
```

Repite `build` y `sync` después de cada cambio web. `npx cap open ios` abre el proyecto Xcode generado.

## Instalar en tu iPhone

1. Conecta el iPhone al Mac por cable, desbloquéalo y acepta **Confiar en este ordenador**.
2. Añade tu Apple ID en **Xcode > Settings > Accounts** si todavía no aparece.
3. En Xcode abre el target **App**, entra a **Signing & Capabilities**, activa firma automática y selecciona tu equipo.
4. Si `com.ecoruta.app` no está disponible para tu equipo, usa un identificador único, por ejemplo uno basado en tu nombre, y refleja el mismo valor en `capacitor.config.ts` antes de volver a sincronizar.
5. Selecciona tu iPhone como destino de ejecución y pulsa **Run**.
6. Si iOS lo solicita, activa **Developer Mode** y reinicia el teléfono. En versiones que lo requieran, autoriza el perfil en **Ajustes > General > VPN y gestión de dispositivos**.
7. Abre EcoRuta y concede ubicación **Mientras se usa la app** solo cuando pruebes el mapa.

No se necesita publicar en App Store para esta instalación de desarrollo.

## Después de cada cambio

```bash
npm run build
npx cap sync ios
```

## Permisos de ubicación configurados

`Info.plist` ya incluye descripciones claras para:

- `NSLocationWhenInUseUsageDescription`
- `NSLocationAlwaysAndWhenInUseUsageDescription`

Texto actual:

> EcoRuta usa tu ubicación solo mientras utilizas el mapa para establecer el origen y seguir tu posición.

No se solicita ni se implementa ubicación en segundo plano.

## SQLite y archivos

`@capacitor-community/sqlite` 8.1.1 queda seleccionado automáticamente en iOS. En el simulador se verificó la creación de la base v2, dos favoritos, un recorrido confirmado y su persistencia después de terminar y reabrir la aplicación. Antes de distribuir y en el iPhone físico falta:

- repetir creación y migración de la base v2 en hardware;
- cerrar y reabrir la app para verificar persistencia física;
- probar borrado individual y total;
- probar importación/exportación con el selector real del sistema;
- revisar la documentación de SQLCipher y las obligaciones de exportación criptográfica aplicables a App Store y Google Play.

El código no activa cifrado de base de datos en esta fase, pero el plugin enlaza SQLCipher incluso para bases no cifradas.

## Lista de aceptación física

1. Abre el proyecto en Xcode y selecciona el equipo de firma.
2. Selecciona el iPhone como destino y pulsa **Run**.
3. Concede ubicación “Mientras se usa la app”.
4. Comprueba precisión, actualización del punto GPS y la opción **Detener GPS**.
5. Busca dos lugares de Lima y compara caminar/bicicleta.
6. Cambia entre tema claro y oscuro.
7. Revisa safe areas, teclado, orientación vertical y una rotación horizontal.
8. Guarda un lugar y una ruta, cierra completamente la app y confirma que reaparecen.
9. Registra un recorrido realizado y comprueba Historial y Estadísticas.
10. Exporta, elimina e importa una copia JSON.
11. Abre Facebook, TikTok, YouTube y la metodología MTC; confirma que se muestran fuera de WKWebView.
12. Fuerza el cierre desde el selector de apps, vuelve a abrir y repite los conteos de favoritos e historial.

No se debe considerar aprobado el gate nativo hasta completar esta lista en hardware real.

## Estado Android

Android no se generó en esta fase porque el Mac evaluado no tiene Android Studio, Java, SDK ni ADB. Instalar esas dependencias y ejecutar emulador/hardware será un gate separado; ninguna función Android se considera probada.
