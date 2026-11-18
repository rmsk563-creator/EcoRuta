# Configuración segura de Geoapify

## Crear la cuenta y la clave

1. Abre <https://myprojects.geoapify.com/> y crea una cuenta gratuita.
2. Crea un proyecto llamado, por ejemplo, `EcoRuta Development`.
3. En **API Keys**, copia la clave generada automáticamente o crea una nueva.
4. Usa claves separadas para desarrollo, web pública y aplicaciones nativas. Comparten la cuota del proyecto, pero pueden tener restricciones y rotación independientes.

## Configurar EcoRuta en el Mac

Desde la raíz del repositorio:

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```dotenv
VITE_GEOAPIFY_API_KEY=tu_clave_restringida
```

Después reinicia el servidor:

```bash
npm run dev
```

Los archivos `.env*` están ignorados por Git, excepto `.env.example`, que nunca contiene una clave.

## Restricciones recomendadas

Una variable `VITE_` se incorpora al JavaScript del navegador: evita confirmarla en Git, pero no la consideres un secreto. Geoapify recomienda proteger las claves de navegador mediante **Allowed origins** o **Allowed HTTP referrers**.

Para desarrollo web añade únicamente los orígenes que uses, por ejemplo:

```text
http://localhost:5173
http://IP_LOCAL_DE_TU_MAC:5173
```

Para GitHub Pages usa una clave web diferente y configura:

```text
Allowed HTTP referrers: ^https://rmsk563-creator\.github\.io/EcoRuta(?:/.*)?$
Allowed origins: https://rmsk563-creator.github.io
CORS Access-Control-Allow-Origin: https://rmsk563-creator.github.io
```

Guarda esa clave como el secreto de GitHub Actions `GEOAPIFY_WEB_API_KEY`. El workflow falla si el secreto falta, de modo que no publica silenciosamente un mapa desactivado.

Para las compilaciones Capacitor, WKWebView usa un origen local como:

```text
capacitor://localhost
https://localhost
```

El valor CORS controla si WKWebView puede leer la respuesta, pero no convierte la clave en un secreto. Geoapify advierte que una clave incorporada en una aplicación móvil puede extraerse y que las restricciones de origen/referrer/IP no se aplican de forma equivalente a solicitudes nativas. Usa una clave separada para móvil, limita y vigila su cuota y rótala si se abusa. Si el riesgo exige ocultarla, el siguiente paso es un backend proxy aprobado; nunca una clave privada dentro del repositorio o del binario.

## Prueba controlada

Con la clave configurada:

1. Abre `http://localhost:5173/#/map`.
2. Confirma que el mapa de Lima muestra atribuciones de Geoapify, OpenStreetMap y OpenMapTiles.
3. Busca un lugar conocido, por ejemplo “Parque Kennedy”.
4. Selecciona origen y destino y pulsa **Comparar rutas**.
5. Verifica que caminar y bicicleta muestran valores devueltos por Geoapify.
6. Pulsa **Usar mi ubicación** y concede permiso solo durante la prueba.

No compartas la clave, el archivo `.env.local`, capturas que la muestren ni URLs completas con `apiKey`.

Consulta [`GITHUB_PAGES.md`](./GITHUB_PAGES.md) antes de publicar la versión web.
