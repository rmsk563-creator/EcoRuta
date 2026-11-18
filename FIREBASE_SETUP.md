# Firebase Authentication — configuración de EcoRuta

Esta integración usa exclusivamente Firebase Authentication con correo y contraseña. No crea Firestore, Storage, Analytics, funciones, cuentas de servicio ni servicios de pago. Favoritos, historial y estadísticas continúan en IndexedDB (web) o SQLite (iOS).

## 1. Crear el proyecto de desarrollo

1. Entra en [Firebase Console](https://console.firebase.google.com/) con tu cuenta.
2. Pulsa **Crear un proyecto** y usa un nombre reconocible, por ejemplo `EcoRuta Desarrollo`. El identificador de proyecto lo asigna Firebase y debe ser único.
3. Desactiva Google Analytics para este proyecto: no es necesario para Authentication.
4. Mantén el plan **Spark**. No actives facturación, Identity Platform ni autenticación telefónica.

Es recomendable crear más adelante un proyecto Firebase separado para producción. Así las cuentas de prueba y las cuotas no se mezclan con usuarios reales.

## 2. Registrar la aplicación cliente

Aunque EcoRuta se empaquete con Capacitor, la autenticación actual usa el SDK JavaScript dentro de la aplicación. Por eso, en la portada del proyecto:

1. Pulsa el icono **Web (`</>`)**.
2. Nombre: `EcoRuta Web y Capacitor`.
3. No marques Firebase Hosting.
4. Registra la app y copia únicamente los valores del objeto `firebaseConfig`.

No descargues ni añadas `GoogleService-Info.plist`: no se necesita mientras se utilice el SDK web y solo correo/contraseña. Nunca crees ni descargues una cuenta de servicio para el cliente.

## 3. Activar correo y contraseña

1. Abre **Authentication → Comenzar → Sign-in method**.
2. Abre **Correo electrónico/contraseña**.
3. Activa solo **Correo electrónico/contraseña** y guarda. No actives “vínculo de correo” en esta fase.
4. En **Authentication → Settings → Password policy**, configura **mínimo 8 caracteres** y modo **Require**. No añadas todavía requisitos que la interfaz no muestre.
5. En **Authentication → Settings → User actions**, confirma que la protección contra enumeración de correos esté activa. Los proyectos recientes suelen traerla activada, pero debe revisarse.
6. Revisa **Templates → Password reset** y **Email address verification**. Puedes personalizar remitente, asunto y nombre visible sin alterar los enlaces de acción administrados por Firebase.

## 4. Dominios autorizados

En **Authentication → Settings → Authorized domains**:

- Añade `localhost` para pruebas locales. En proyectos creados después del 28 de abril de 2025 ya no aparece automáticamente.
- Cuando se autorice GitHub Pages, añade `rmsk563-creator.github.io`. No incluyas `https://` ni `/EcoRuta/`.
- Conserva el dominio administrado del proyecto, normalmente `<project-id>.firebaseapp.com`, porque gestiona los correos de recuperación y verificación.

El flujo actual de correo/contraseña en Capacitor no usa OAuth ni redirecciones nativas. `capacitor://localhost` no se añade como dominio web. Si en el futuro se incorpora Google, Apple o enlaces de correo dentro de la app, habrá que diseñar y probar deep links antes de habilitarlos.

## 5. Pegar la configuración pública localmente

Abre `.env.local` en la raíz del proyecto. Conserva la clave Geoapify existente y añade, sin comillas:

```dotenv
VITE_FIREBASE_API_KEY=valor_apiKey
VITE_FIREBASE_AUTH_DOMAIN=valor_authDomain
VITE_FIREBASE_PROJECT_ID=valor_projectId
VITE_FIREBASE_APP_ID=valor_appId
VITE_FIREBASE_STORAGE_BUCKET=valor_storageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=valor_messagingSenderId
```

Las cuatro primeras variables son obligatorias. Las dos últimas son opcionales para Authentication, pero pueden copiarse del objeto oficial. `.env.local` está excluido por `.gitignore`; no pegues los valores en el chat ni en un commit.

Las claves de configuración de Firebase identifican el proyecto y son públicas por diseño; no equivalen a una clave administrativa. Aun así, EcoRuta las mantiene fuera de Git para separar entornos. En **Google Cloud Console → APIs & Services → Credentials**, confirma que la clave creada por Firebase conserva restricciones de API para servicios Firebase. No agregues APIs ajenas, y nunca reutilices esa clave para Geoapify, Gemini u otros servicios.

## 6. Ejecutar y validar

Reinicia Vite después de guardar `.env.local`:

```bash
npm run dev
```

Prueba en este orden:

1. **Continuar a EcoRuta** sin cuenta: mapa y datos locales deben seguir disponibles.
2. Crear una cuenta de prueba con un correo real accesible y contraseña de 8 o más caracteres.
3. Confirmar que llega el correo de verificación.
4. Cerrar y volver a abrir el navegador: la sesión debe persistir.
5. Cerrar sesión desde Ajustes: favoritos, historial y estadísticas deben permanecer.
6. Iniciar sesión otra vez.
7. Solicitar recuperación y completar el cambio desde el correo.
8. Verificar en Firebase Console → Authentication → Users que existe únicamente la cuenta de prueba creada por ti.

Para iOS, después de validar la web:

```bash
npm run build
npx cap sync ios
```

Abre `ios/App/App.xcodeproj`, ejecuta en el simulador y repite registro, persistencia, recuperación y cierre. La recuperación se completa en el navegador mediante el manejador alojado por Firebase. La prueba en simulador no aprueba el funcionamiento en iPhone físico.

## Seguridad y límites

- Firebase gestiona la contraseña; EcoRuta no la guarda en Preferences, IndexedDB, SQLite ni `localStorage`.
- El SDK conserva la sesión en IndexedDB y usa almacenamiento local como alternativa. Cerrar sesión elimina la sesión de Firebase, no los datos de movilidad.
- No se registran tokens, contraseñas ni respuestas de credenciales en consola.
- En Google Cloud se pueden ajustar las cuotas de `identitytoolkit.googleapis.com` después de medir el uso normal. Un límite demasiado bajo puede bloquear inicios de sesión legítimos.
- App Check para Authentication requiere actualizar a Authentication with Identity Platform; no se activa en esta fase ni se contrata un plan.

## Estado verificable

La integración técnica y las pruebas automatizadas funcionan sin credenciales mediante un servicio controlado de prueba. Registro, inicio, recuperación y cierre contra Firebase real permanecen **pendientes** hasta completar esta guía y observar los flujos con el proyecto configurado.

## Fuentes oficiales

- [Autenticación con contraseña](https://firebase.google.com/docs/auth/web/password-auth)
- [Persistencia de sesión](https://firebase.google.com/docs/auth/web/auth-state-persistence)
- [Dominios autorizados y localhost](https://firebase.google.com/docs/auth/faq-and-troubleshooting)
- [Claves API de Firebase](https://firebase.google.com/docs/projects/api-keys)
- [Lista de seguridad de Firebase](https://firebase.google.com/support/guides/security-checklist)
