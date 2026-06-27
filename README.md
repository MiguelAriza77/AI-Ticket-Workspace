# Gestor de Tickets

Una pequeña app para crear tickets de soporte, clasificarlos con IA
(categoría, prioridad y un resumen) y llevar su seguimiento desde un panel.

La hice con Next.js y PostgreSQL, y todo se levanta con Docker Compose.

## Qué necesitas

Solo Docker. Nada más (no hace falta instalar Node ni Postgres en tu máquina).

Para la parte de IA necesitas una API key de OpenAI. Si no la pones, la app
sigue funcionando: los tickets se crean igual, solo que sin clasificar. Después
puedes clasificarlos desde el detalle del ticket con el botón "Clasificar con IA".

## Cómo arrancarlo

1. Copia el archivo de ejemplo de variables y rellena tu API key:

   ```bash
   cp .env.example .env
   ```

   Abre el `.env` y pon tu clave en `OPENAI_API_KEY`.

2. Levanta todo:

   ```bash
   docker compose up --build
   ```

3. Abre http://localhost:3000

Y ya está. La base de datos se crea sola la primera vez con las tablas que
necesita (ver `db/init.sql`).

Si quieres empezar de cero y borrar los datos:

```bash
docker compose down -v
```

## Variables de entorno

Están todas en `.env.example`. Las importantes:

- `OPENAI_API_KEY` → tu clave de OpenAI (para la clasificación).
- `OPENAI_MODEL` → el modelo, por defecto `gpt-4o-mini`.
- `DATABASE_URL` → la conexión a Postgres (ya viene configurada para Docker).

## Cómo funciona

Es una sola app de Next.js que sirve la interfaz y también las rutas de API.
Esas rutas hablan con Postgres y, al crear un ticket, llaman a OpenAI para
clasificarlo.

El flujo al crear un ticket es:

1. Se guarda el ticket en la base de datos.
2. Se manda el texto a OpenAI, que devuelve categoría, prioridad y resumen.
3. Se actualiza el ticket con esos datos.

Si la llamada a la IA falla (por ejemplo, sin clave o sin internet), el ticket
no se pierde: se queda guardado y lo puedes clasificar más tarde.

Las pantallas son tres:

- **Panel** (`/`): la lista de todos los tickets con su estado, categoría,
  prioridad y fecha.
- **Nuevo ticket** (`/tickets/new`): el formulario para crear uno.
- **Detalle** (`/tickets/[id]`): ahí cambias el estado, asignas un responsable
  y añades comentarios.

## Estructura del proyecto

```
db/init.sql        las tablas de la base de datos
src/lib/           conexión a la BD, la llamada a la IA y las consultas
src/app/           las páginas y las rutas de API
src/components/    los formularios y piezas de la interfaz
```

## Uso de IA

La única parte con IA es la clasificación, en `src/lib/ai.ts`. Le mando a OpenAI
el nombre del cliente y el texto de la solicitud, y le pido que responda en JSON
con la categoría, la prioridad y un resumen corto. Antes de guardar compruebo
que la respuesta sea válida, por si el modelo devuelve algo raro.

## Ver los datos en la base de datos

Si quieres comprobar que los tickets se guardan:

```bash
docker compose exec db psql -U postgres -d tickets -c "select customer_name, category, priority, status from tickets;"
```
