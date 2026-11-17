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

Para las futuras compilaciones Capacitor habrá que probar y autorizar los orígenes reales del WebView:

```text
capacitor://localhost
https://localhost
```

El valor CORS controla si el navegador puede leer la respuesta, pero no reemplaza una restricción de acceso. Configura también **Allowed origins/referrers**, revisa las estadísticas del proyecto y rota la clave si se expone.

## Prueba controlada

Con la clave configurada:

1. Abre `http://localhost:5173/#/map`.
2. Confirma que el mapa de Lima muestra atribuciones de Geoapify, OpenStreetMap y OpenMapTiles.
3. Busca un lugar conocido, por ejemplo “Parque Kennedy”.
4. Selecciona origen y destino y pulsa **Comparar rutas**.
5. Verifica que caminar y bicicleta muestran valores devueltos por Geoapify.
6. Pulsa **Usar mi ubicación** y concede permiso solo durante la prueba.

No compartas la clave, el archivo `.env.local`, capturas que la muestren ni URLs completas con `apiKey`.
