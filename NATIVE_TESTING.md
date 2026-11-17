# Prueba posterior en iPhone

Esta fase deja el código web y el plugin GPS preparados, pero no genera todavía el proyecto `ios/`. Ese paso pertenece al gate nativo y requiere Xcode, firma y un dispositivo real.

## Requisitos

- Mac con Xcode actualizado.
- iPhone conectado por cable o disponible para desarrollo inalámbrico.
- Apple ID añadido en Xcode y un equipo de firma seleccionado.
- API key Geoapify separada para la aplicación móvil y restringida al origen que use el WebView.

## Crear el proyecto iOS en el gate nativo

```bash
npm install @capacitor/ios
npm install @capacitor/android
npm run build
npx cap add ios
npx cap add android
npx cap sync ios
npx cap open ios
```

Después de cada cambio web:

```bash
npm run build
npx cap sync ios
```

## Permisos de ubicación

Antes de ejecutar en el iPhone, añade en `Info.plist` descripciones claras para:

- `NSLocationWhenInUseUsageDescription`
- `NSLocationAlwaysAndWhenInUseUsageDescription`

Texto propuesto:

> EcoRuta usa tu ubicación mientras utilizas el mapa para establecer el origen y mantenerlo actualizado durante la planificación.

No se solicita ni se implementa ubicación en segundo plano.

## SQLite y archivos

`@capacitor-community/sqlite` 8.1.1 es compatible con Capacitor 8 y queda seleccionado automáticamente en una plataforma nativa. Antes de distribuir:

- comprobar creación y migración de la base v2;
- cerrar y reabrir la app para verificar persistencia;
- probar borrado individual y total;
- probar importación/exportación con el selector real del sistema;
- revisar la documentación de SQLCipher y las obligaciones de exportación criptográfica aplicables a App Store y Google Play.

El código no activa cifrado de base de datos en esta fase, pero el plugin enlaza SQLCipher incluso para bases no cifradas.

## Comprobación física

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

No se debe considerar aprobado el gate nativo hasta completar esta lista en hardware real.
