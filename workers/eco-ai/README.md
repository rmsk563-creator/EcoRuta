# EcoRuta Eco IA — Workers AI preparado, no desplegado

Worker HTTPS para conectar EcoRuta con Cloudflare Workers AI sin claves de modelo en React, Capacitor, archivos locales ni el repositorio.

## Estado

- Implementación y conexión de cliente preparadas localmente.
- No se ha creado ni desplegado ningún recurso remoto.
- La aplicación continúa desactivando el chat mientras `VITE_ECO_AI_API_URL` esté vacío.
- Cada solicitud acepta únicamente el mensaje actual; no existe historial remoto.
- No acepta coordenadas, correo, nombre, historial ni campos adicionales.
- Los destinos son propuestas textuales. Solo después de la confirmación del usuario la aplicación consulta Geoapify y abre el mapa.

## Modelo seleccionado

`@cf/meta/llama-3.3-70b-instruct-fp8-fast`

- Cloudflare-hosted y marcado con retención cero.
- Multilingüe y adecuado para conversación en español.
- Compatible con JSON Mode.
- La respuesta se vuelve a validar dentro del Worker porque JSON Mode no garantiza por sí solo el esquema.

## Seguridad aplicada

1. Verificación criptográfica del token ID de Firebase: firma RS256, emisor, audiencia, tiempos, UID y correo verificado.
2. Límite por UID anonimizado: 6 solicitudes por minuto y 40 por día mediante Durable Objects SQLite.
3. Binding `env.AI` administrado por Cloudflare; no existe API key del modelo.
4. CORS limitado a Capacitor, localhost y el origen oficial de GitHub Pages.
5. Respuestas `no-store`, cuerpo máximo de 4 KiB, timeout y errores sin credenciales.
6. El modelo no recibe GPS, correo, perfil, favoritos, historial ni actividad.
7. Geoapify conserva la responsabilidad exclusiva sobre lugares, rutas, tiempos y distancias.
8. Las cifras de CO₂ solo pueden provenir del cálculo transparente de EcoRuta sobre una ruta real y la declaración del usuario.

## Cuenta Cloudflare Free

Antes del primer despliegue:

1. Crear una cuenta en <https://dash.cloudflare.com/sign-up>.
2. Verificar el correo e iniciar sesión.
3. Abrir **Workers & Pages** y confirmar que el plan indique **Free**.
4. En **Billing > Subscriptions**, confirmar que no exista Workers Paid ni otra suscripción activa.
5. En **Billing > Payment methods**, no añadir tarjeta ni método de pago.
6. No pulsar **Upgrade**, **Workers Paid**, **Purchase** ni activar créditos de AI Gateway.

Para crear el Worker por primera vez se necesita la función **Admin** del producto Workers. Después, editarlo requiere **Editor**. El subdominio `workers.dev` no necesita permisos sobre DNS ni rutas de una zona.

`wrangler login` usa OAuth y, sin opciones, solicita todos sus scopes disponibles. En la pantalla de autorización se debe abrir **Edit Permissions**, conservar únicamente los requeridos para identidad de cuenta, Workers, Workers AI y Durable Objects, y rechazar los permisos opcionales no relacionados.

- leer la identidad y cuenta seleccionada;
- crear y editar el Worker;
- utilizar Workers AI y Durable Objects;
- publicar versiones del Worker.

No se configurarán DNS, dominios personalizados, correo, Firebase, GitHub ni facturación. La autorización puede revocarse posteriormente con `npx wrangler logout` y desde la administración de tokens de la cuenta.

## Preparación local

```bash
cd workers/eco-ai
npm install
npm run typecheck
npm test
npx wrangler deploy --dry-run
```

No se debe ejecutar `wrangler dev` con el binding AI ni una prueba real hasta verificar la cuenta: Workers AI accede a la cuenta incluso durante desarrollo local y consume la asignación gratuita.

## Primer despliegue, pendiente de confirmación

```bash
npx wrangler login
npx wrangler deploy
```

El primer comando abre el navegador para autorizar Wrangler. El segundo publica el Worker en un subdominio `workers.dev`; no se ejecutará sin autorización expresa.

Después del despliegue se copiará únicamente la URL pública HTTPS a `.env.local`:

```dotenv
VITE_ECO_AI_API_URL="https://ecoruta-eco-ai.<subdominio>.workers.dev"
```

La URL no es una credencial. La protección real del endpoint depende de Firebase, CORS y el límite por usuario.
