# Evaluación de autenticación — EcoRuta

**Fecha de revisión:** 18 de noviembre de 2026.

La Fase 6 prepara las pantallas, pero no conecta un proveedor, no transmite credenciales y no crea sesiones. EcoRuta continúa funcionando sin cuenta y conserva sus datos actuales en IndexedDB o SQLite.

## Comparación

| Criterio | Firebase Authentication | Supabase Auth |
| --- | --- | --- |
| Modelo | Servicio de identidad administrado, independiente de una base de datos propia. | Identidad integrada con Postgres, JWT y Row Level Security para datos sincronizados. |
| Plan sin costo | Spark permite los métodos de autenticación no telefónica. Con Identity Platform, Spark limita la mayoría de proveedores a 3.000 usuarios activos diarios; Blaze incluye 50.000 MAU sin costo antes del cobro. | Free incluye 50.000 MAU, dos proyectos y MFA básico, pero los proyectos gratuitos se pausan tras una semana de inactividad. |
| Recuperación | Flujo administrado por correo; Spark permite 150 correos de restablecimiento al día. | `resetPasswordForEmail` y enlaces de recuperación configurables; requiere configurar URLs web y deep links nativos. |
| Capacitor | Email/contraseña funciona con el SDK web dentro de WKWebView. OAuth móvil necesita tratamiento adicional o integración nativa; la guía Cordova advierte cambios tras el cierre de Dynamic Links. | El SDK JavaScript funciona en aplicaciones web y dispone de guía oficial para deep links móviles usados por confirmación, OAuth y recuperación. En Capacitor habrá que registrar un esquema y usar PKCE/redirects. |
| Sesiones | Persistencia administrada por el SDK; dominios y claves web autorizados deben configurarse correctamente. | Persistencia local predeterminada con access token y refresh token; en móvil conviene proporcionar almacenamiento seguro compatible con Capacitor y no dejar el refresh token únicamente en `localStorage`. |
| Seguridad | Servicio maduro, App Check opcional, límites y gestión centralizada. La API key web identifica el proyecto y debe restringirse; no sustituye reglas/autorización. | Contraseñas con bcrypt, JWT y RLS. La clave publicable puede estar en el cliente, nunca `service_role`. La seguridad de datos depende de políticas RLS correctas. |
| Encaje futuro | Mejor si EcoRuta quiere empezar solo con cuentas, menor operación y disponibilidad gratuita sin pausa del proyecto. | Mejor si la siguiente fase incluye sincronización de favoritos/historial mediante Postgres y se acepta operar RLS, deep links, correo y un plan de producción no pausado. |

## Recomendación

Para el alcance inmediato —correo, contraseña, recuperación y cuenta opcional— la recomendación inicial es **Firebase Authentication**, sin activar Identity Platform ni autenticación telefónica al comienzo. Reduce el trabajo operativo, no obliga a crear una base remota y evita que un proyecto gratuito se pause por inactividad.

Supabase sería preferible si se aprueba al mismo tiempo una arquitectura de sincronización en nube para favoritos, historial y estadísticas. En ese caso debe presupuestarse el plan Pro para producción estable, diseñar RLS antes de exponer tablas y almacenar los tokens nativos con una estrategia más segura que `localStorage`.

## Condiciones antes de conectar cualquiera

1. Crear proyectos separados para desarrollo y producción.
2. Configurar dominios web autorizados y deep links `com.ecoruta.app` sin cambiar el identificador aprobado.
3. Mantener únicamente claves publicables en variables Vite; ninguna clave administrativa entra al repositorio.
4. Añadir verificación de correo, política de contraseña, límites de reintento y mensajes que no revelen si una cuenta existe.
5. Definir eliminación de cuenta, privacidad, exportación y qué datos —si alguno— se sincronizarán.
6. Probar recuperación y cierre de sesión en web, simulador y iPhone físico antes de declarar la función aprobada.

## Fuentes oficiales

- [Firebase Authentication](https://firebase.google.com/docs/auth/)
- [Precios de Firebase](https://firebase.google.com/pricing)
- [Límites de Firebase Authentication](https://firebase.google.com/docs/auth/limits)
- [Firebase Auth en entornos Cordova](https://firebase.google.com/docs/auth/web/cordova)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Deep linking móvil de Supabase](https://supabase.com/docs/guides/auth/native-mobile-deep-linking)
- [Sesiones de Supabase](https://supabase.com/docs/guides/auth/sessions)
- [Precios de Supabase](https://supabase.com/pricing)
