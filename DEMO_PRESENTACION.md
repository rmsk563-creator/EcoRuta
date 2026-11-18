# EcoRuta Demo universitaria 0.6.0

Esta compilación es una demo de desarrollo firmada para la presentación universitaria. No es una publicación de App Store, TestFlight ni GitHub Pages.

## Guion de demostración (2–3 minutos)

1. **Apertura (20 s).** Abre EcoRuta desde el icono original. Muestra el splash nativo, el splash animado y la bienvenida. Explica que el acceso como invitado permite usar la aplicación sin una cuenta.
2. **Ruta real (60–75 s).** Entra a **Mapa**, permite la ubicación mientras se usa la app, usa tu posición como origen y busca un destino cercano de Lima. Compara caminar y bicicleta. Señala que el trazado, la distancia y la duración provienen de Geoapify y no son datos simulados.
3. **Datos locales (45 s).** Guarda el destino o la ruta como favorito. Registra el recorrido como realizado únicamente si deseas que aparezca en Historial y Estadísticas. Abre **Actividad** para enseñar favoritos, historial e impacto ambiental.
4. **Experiencia (25 s).** Cambia entre tema claro y oscuro en **Ajustes**. Muestra que la navegación, las animaciones y las safe areas se adaptan al iPhone.
5. **Cierre (20 s).** Explica que Firebase, sincronización entre dispositivos, Android y navegación avanzada son mejoras futuras. Esta demo funciona como invitado y conserva sus datos localmente.

## Funciones incluidas

- Mapa interactivo de Lima mediante MapLibre y Geoapify.
- GPS y permiso de ubicación durante el uso.
- Búsqueda de lugares y rutas reales a pie y en bicicleta.
- Favoritos, historial y estadísticas ambientales locales.
- Persistencia mediante SQLite en iOS.
- Importación y exportación JSON.
- Tema claro y oscuro.
- Splash animado y transiciones de la Fase 6.
- Pantallas de acceso como vista previa, claramente deshabilitadas mientras Firebase no está configurado.

## Mejoras pendientes

- Autenticación real con Firebase.
- Sincronización entre dispositivos.
- Proyecto y validación Android.
- Navegación avanzada y funciones posteriores.

## Abrir nuevamente en el iPhone

1. Busca **EcoRuta** en la pantalla de inicio y toca el icono verde original.
2. Si iOS informa que el perfil de desarrollo venció, conecta el iPhone al Mac y vuelve a ejecutar la app desde Xcode con el mismo equipo y Bundle ID.
3. Para reinstalar desde Xcode, abre `ios/App/App.xcodeproj`, selecciona el iPhone como destino y pulsa **Run**. No desinstales la app si quieres conservar SQLite y las preferencias.

## Comprobación manual antes de presentar

- [ ] Conceder ubicación **Mientras se usa la app** y confirmar que el punto GPS coincide con la ubicación real.
- [ ] Buscar un lugar de Lima y calcular las dos rutas con conexión a Internet.
- [ ] Guardar un favorito y registrar, de forma explícita, un recorrido realizado.
- [ ] Cerrar EcoRuta desde el selector de apps, volver a abrirla y comprobar que los datos continúan.
- [ ] Probar tema claro/oscuro, teclado, importación/exportación JSON y enlaces externos.
- [ ] Confirmar que el iPhone tendrá conexión y que el perfil de desarrollo seguirá vigente el día de la exposición.

## Restricciones del IPA de desarrollo

El `.ipa` local solo puede instalarse en dispositivos registrados en su perfil de aprovisionamiento y mientras la firma siga vigente. No es distribuible públicamente y no sustituye TestFlight o App Store. La API key pública de Geoapify queda empaquetada en el cliente móvil; debe mantenerse restringida y vigilada desde el panel del proveedor.
