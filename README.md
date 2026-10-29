# Muebles Perdigón

Primera versión funcional en español para gestionar trabajos de tres tiendas. React, TypeScript, Vite y PWA. **Solo datos ficticios y almacenamiento local**. Los nombres de las tiendas son marcadores provisionales.

## Instalar y ejecutar

Requiere Node.js 22 o 24 y npm.

```sh
npm ci
cp .env.example .env
npm run dev
```

Abrir la URL que indique Vite (habitualmente http://localhost:5173). Para probar desde un móvil en la misma red, usar la IP del ordenador; la instalación PWA requiere HTTPS salvo localhost.

```sh
npm test
npm run build
npm run preview
```

El paquete `dist/` se puede desplegar en cualquier alojamiento estático con HTTPS (por ejemplo Netlify, Vercel o un servidor nginx). El proyecto está preparado para subir a GitHub: incluir código y `package-lock.json`, excluir `.env`, `node_modules` y `dist`. No necesita servidor Node en producción.

## Qué incluye

- Panel con pendientes de programar, hoy, sin asignar y esperando material.
- Alta rápida incompleta, edición de todos los campos, ocho tipos, siete estados y prioridad.
- Búsqueda por cliente, teléfono, descripción, dirección, ID y trabajador; filtros por estado, tienda y trabajador.
- Agenda diaria y semana de lunes a domingo; orden por hora.
- Destinos del día por trabajador con enlaces de búsqueda en Google Maps. No se optimizan trayectos.
- Trabajos terminados y cancelados, auditoría con antes/después y exportación JSON.
- Eliminación con confirmación solo para el perfil local Mariluz.
- Manifest y service worker generado al compilar para cachear la aplicación.

Los datos se guardan en `localStorage` bajo `perdigon-demo-v1`. No se comparten entre dispositivos ni pestañas abiertas. No introducir datos reales: el selector de usuario no autentica y la limitación de borrado local no es una barrera de seguridad. El historial local es modificable desde el navegador. Borrar los datos del sitio restablece los ejemplos en la próxima carga. La exportación permite inspeccionar datos; no hay importación/restauración implementada. Si el almacenamiento falla se muestra un error y no se confirma el guardado.

## Pruebas manuales

1. Crear un aviso sin rellenar campos; comprobar que se guarda y persiste al recargar.
2. Completar cliente ficticio, dirección ficticia, tienda, operarios y disponibilidad; comprobar búsqueda y filtros.
3. Programar sin fecha/hora: debe mostrar error. Añadir fecha y hora: debe aparecer en agenda y destinos del trabajador.
4. Cambiar estado a realizado: comprobar historial y los valores antes/después de la modificación.
5. Seleccionar Emilio: no debe haber botón Eliminar. Seleccionar Mariluz: confirmar borrado y comprobar que queda auditoría. Esto prueba únicamente la simulación local.
6. Probar a 375 px y en ordenador, navegación con teclado y controles con lector de pantalla. Verificar en dispositivos iOS y Android reales antes de uso habitual.
7. Compilar y servir con HTTPS, abrir una vez conectado, instalar desde el navegador o «Añadir a pantalla de inicio» en Safari, cerrar y reabrir sin red. Verificar shell y datos locales; no hay envío de cambios pendientes. El service worker está activo en build/preview, no en desarrollo.
8. Comprobar rutas en Maps solo con direcciones ficticias; no se espera que los destinos de ejemplo existan.

Vitest comprueba guardado incompleto, validación al programar, búsqueda, autoría, instantáneas y reglas de borrado local. Playwright incluye pruebas E2E en Chromium con tamaños de escritorio y móvil; no equivale a probar Safari en un iPhone real. No hay pruebas contra Supabase incluidas.

## Supabase y Google: preparado, pendiente de implementación y validación

`src/supabase.ts` contiene una fábrica del cliente y `supabase/schema.sql` una propuesta de esquema. **La interfaz no usa Supabase y no ofrece inicio de sesión Google todavía.** No se ha configurado ni probado autenticación, sincronización o RLS contra un servidor.

Pasos para la siguiente fase:

1. Crear un proyecto Supabase de pruebas y aplicar `supabase/schema.sql` una vez desde su editor SQL.
2. Activar proveedor Google en Supabase y configurar el cliente OAuth en Google Cloud, callback de Supabase, URL del sitio y URLs de redirección autorizadas. Mantener secreto OAuth únicamente en Google/Supabase.
3. Registrar las cuatro cuentas reales y crear sus filas en `profiles` desde una sesión administrativa de confianza usando los UUID de `auth.users`. Solo la fila de Mariluz recibe `can_delete = true`. No autorizar cuentas por el nombre que Google declara. No hay alta automática de perfiles.
4. Copiar URL y clave pública anon/publishable a `.env`. Nunca colocar clave `service_role` ni secretos en variables `VITE_*` (son públicas).
5. Implementar sesión Google con `signInWithOAuth`, cierre de sesión, perfil autorizado y un repositorio Supabase en sustitución de `localStorage`; gestionar errores, carga, concurrencia y actualizaciones remotas. Mantener almacenamiento de datos reales fuera de la caché del service worker y limpiar sesión/datos al salir.
6. Probar con JWT reales de los cuatro perfiles: lectura/alta/edición para todos, DELETE únicamente Mariluz, usuarios autenticados sin perfil y anónimos sin acceso. Intentar modificar perfiles y auditoría desde cliente: debe denegarse. Verificar que el trigger registra autor y valores y conserva eventos tras borrar.
7. Probar sincronización entre dos dispositivos y concurrencia; acordar manejo de cambios simultáneos y copias de seguridad antes del despliegue real.

La auditoría SQL se realiza en el servidor y no permite escritura directa a usuarios de la aplicación. El SQL requiere revisión y pruebas en un entorno separado; no se ha ejecutado aquí. No se incluye ninguna conexión a FactuSOL.

## PWA

La primera carga necesita conexión. El service worker cachea solo recursos estáticos compilados, no Google, Maps ni Supabase. Los iconos PNG y SVG están en `public/`. Se usan fuentes del sistema, sin peticiones externas de tipografía. Confirmar instalación y actualizaciones en Safari iOS, Chrome Android y escritorio antes de considerar la PWA validada.

## Abrir una vista previa desde el iPhone

El código está en este entorno de trabajo: todavía no hay una URL pública publicada. Para probar desde tu red local, primero copia o descarga el proyecto a un ordenador con Node.js.

1. Conecta ordenador e iPhone a la misma red Wi-Fi (evita la red de invitados).
2. En la carpeta del proyecto ejecuta:

```sh
npm ci
npm run build
npm run preview -- --port 4173 --strictPort
```

3. Consulta la línea `Network` que imprime Vite. Abre esa dirección en Safari del iPhone, por ejemplo `http://192.168.1.50:4173`. La IP de ejemplo debe sustituirse por la de tu ordenador. `localhost` en el iPhone apunta al propio teléfono y no sirve para acceder al ordenador.
4. Mantén abierto el terminal. Si no carga, permite a Node.js el acceso a la red privada en el cortafuegos y comprueba que ambos dispositivos se ven en la misma red y no tienen aislamiento Wi-Fi.
5. Prueba crear un aviso, recargar, asignar trabajador y programarlo. Los cambios se guardarán solamente en Safari de ese iPhone.

Esta URL HTTP sirve para probar las pantallas y operaciones locales. Para verificar instalación PWA y funcionamiento sin conexión, publica el contenido de `dist/` en un alojamiento con HTTPS. Puedes subir esa carpeta a Netlify Drop desde el ordenador: al terminar, abre la URL HTTPS asignada en Safari y usa **Compartir → Añadir a pantalla de inicio**. Las funciones PWA requieren prueba en el dispositivo. No hay despliegue público realizado por este proyecto.

## Pruebas de navegador

```sh
npx playwright install chromium
npm run test:e2e
```

Para usar Chromium ya instalado en Linux:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/lib/chromium/chromium npm run test:e2e
```

Estas pruebas arrancan automáticamente la vista previa en el puerto 4173. Ejecutar `npm run build` antes. Cubren los flujos locales en escritorio y móvil.
