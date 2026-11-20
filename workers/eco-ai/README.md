# EcoRuta Eco IA — backend preparado, no desplegado

Worker HTTPS para conectar EcoRuta con Gemini sin incluir la clave del proveedor en React, Capacitor ni el repositorio.

## Estado

- Preparado localmente; no se ha creado ni desplegado ningún recurso de Cloudflare.
- La aplicación continúa mostrando Eco IA como no conectado.
- No existe historial remoto: cada solicitud acepta únicamente el mensaje actual.
- No acepta coordenadas, correo, nombre, historial ni campos adicionales.
- Los destinos son propuestas textuales. Solo la aplicación, tras confirmación, puede geocodificar y calcular rutas reales mediante Geoapify.

## Seguridad aplicada

1. Verificación criptográfica del token ID de Firebase: firma RS256, emisor, audiencia, tiempos, UID y correo verificado.
2. Límite por UID anonimizado: 6 solicitudes por minuto y 40 por día mediante Durable Objects SQLite.
3. Clave Gemini únicamente como secreto `GEMINI_API_KEY` de Cloudflare.
4. CORS limitado a Capacitor, localhost y el origen oficial de GitHub Pages.
5. Respuestas `no-store`, cuerpos pequeños, timeout del proveedor y errores sin credenciales.
6. Salida JSON estructurada; Gemini no genera datos de ruta, distancia, tiempo o CO2 como hechos.

## Privacidad del nivel gratuito de Gemini

Los términos vigentes de Gemini API indican que, en servicios sin pago, Google puede usar entradas y respuestas para mejorar productos y revisores humanos pueden procesarlas. También indican no enviar información personal, sensible o confidencial. Además, el API Client no puede estar dirigido a personas menores de 18 años ni ser probablemente utilizado por ellas. Por esos motivos este backend no debe desplegarse ni conectarse hasta que el propietario acepte expresamente esas condiciones y defina un público adulto, o elija un proveedor/nivel con términos de datos adecuados.

## Configuración manual posterior a la aprobación

### 1. Cuentas sin facturación

- Crear o usar una cuenta Cloudflare y mantener **Workers Free**. No activar Workers Paid.
- En Google AI Studio, seleccionar un proyecto sin cuenta de Cloud Billing asociada y crear una API key de Gemini.
- No compartir la API key en chat, capturas, Git ni archivos del frontend.

### 2. Desarrollo local

```bash
cd workers/eco-ai
cp .dev.vars.example .dev.vars
npm install
npm run typecheck
npm test
npm run dev
```

Pegar la clave solo en `workers/eco-ai/.dev.vars`:

```dotenv
GEMINI_API_KEY="tu_clave"
```

`.dev.vars` está excluido de Git.

### 3. Despliegue posterior, solo con autorización

```bash
npx wrangler login
npx wrangler versions secret put GEMINI_API_KEY
npx wrangler versions upload
npx wrangler versions deploy
```

El comando `wrangler secret put` tradicional despliega una versión inmediatamente; por eso la guía utiliza `versions secret put` y mantiene separada la activación final.

Después se añadirá la URL HTTPS resultante a una variable pública `VITE_ECO_AI_API_URL`. La clave Gemini nunca se copiará a `.env.local` del frontend.
