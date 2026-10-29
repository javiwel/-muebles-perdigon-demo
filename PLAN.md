# Plan técnico · Muebles Perdigón

1. Construir una SPA React + TypeScript con Vite, navegación sencilla, diseño responsive y PWA.
2. Implementar modelo de trabajo, cuatro perfiles de demostración, almacenamiento local y auditoría de cambios en una única transacción de almacenamiento.
3. Construir panel, alta y ficha, filtros, agenda diaria/semanal, destinos por trabajador e historial.
4. Preparar Supabase: perfiles autorizados, trabajos, auditoría mediante trigger y RLS. Separar la demostración de la futura integración remota.
5. Verificar compilación, reglas básicas mediante Vitest y documentar pruebas manuales, instalación y despliegue.

## Estructura

- `src/App.tsx`: interfaz y navegación de la primera versión.
- `src/model.ts`: tipos, datos ficticios y operaciones locales.
- `src/styles.css`: diseño responsive.
- `src/supabase.ts`: fábrica del cliente, todavía sin conectar a la interfaz.
- `supabase/schema.sql`: propuesta de tablas, permisos y auditoría.
- `tests/`: pruebas de reglas locales.
- `public/`: iconos PWA.
- `vite.config.ts`: compilación y service worker.

## Límites deliberados

La V1 ejecutable es una demo local: no hay autenticación, sincronización, seguridad multiusuario ni integración con FactuSOL. Rellenar variables de entorno no activa esas funciones. La integración remota requiere implementar repositorio, sesión, estados de red y resolución de concurrencia, además de validar RLS.
