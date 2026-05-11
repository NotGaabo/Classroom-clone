# Classroom Clone / Nerdos Room

Aplicacion web tipo classroom construida con `Next.js 16`, `React 19`, `TypeScript`, `Tailwind CSS 4` y `Supabase`.

El proyecto resuelve un flujo academico basico para:

- autenticacion de usuarios
- creacion y gestion de clases
- union a clases por codigo
- creacion de asignaciones
- entrega de tareas por parte de estudiantes
- calificacion de entregas por parte de docentes
- comentarios en tiempo real
- lectura de archivos adjuntos con URLs firmadas de Supabase Storage

La UI mezcla nombres de producto como `Classroom Clone`, `Mi Aula` y `Nerdos Room`, pero funcionalmente todo pertenece a la misma plataforma educativa.

## Stack tecnico

- `Next.js 16.1.6` con App Router
- `React 19.2.3`
- `TypeScript 5`
- `Tailwind CSS 4`
- `@tanstack/react-query`
- `Supabase SSR` para cliente web, servidor y middleware

## Funcionalidades principales

### Autenticacion

- login con correo y password
- registro con correo y password
- recuperacion de contrasena
- OAuth con Google para login
- OAuth con Google, Facebook y Apple para registro
- callback de autenticacion en `/auth/callback`

### Gestion academica

- listado de clases visibles para el usuario autenticado
- creacion de clases
- eliminacion de clases
- union a clases mediante codigo
- listado de asignaciones por clase
- detalle de asignacion
- comentarios asociados a una asignacion
- entregas de estudiantes con texto y archivos
- calificacion de entregas por parte del profesor

### Realtime y experiencia de uso

- actualizacion en tiempo real de `assignments`
- actualizacion en tiempo real de `assignment_comments`
- refresh automatico de sesion con middleware/proxy de Supabase
- manejo explicito de errores de red contra Supabase
- uso de `React Query` para cache basica y refetch controlado

## Roles y permisos

El sistema trabaja con tres roles de aplicacion:

- `admin`
- `teacher`
- `student`

Resumen funcional:

- `admin`: acceso total a gestion, clases, asignaciones y calificaciones
- `teacher`: puede administrar clases, crear asignaciones, comentar y calificar
- `student`: puede unirse a clases, comentar, entregar trabajo y ver calificaciones

Importante:

- el registro publico crea cuentas con perfil base de estudiante
- la asignacion de permisos de mayor nivel debe hacerse desde administracion o mediante actualizacion del perfil en base de datos

## Rutas principales de la app

Rutas publicas:

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/auth/callback`

Rutas protegidas:

- `/dashboard`
- `/classes`
- `/classes/[classId]`
- `/classes/[classId]/students`
- `/classes/[classId]/grades`
- `/classes/[classId]/calendario`
- `/classes/[classId]/assignment/[assignmentId]`

## API interna disponible

### GET

- `GET /auth/callback`
- `GET /api/classes`
- `GET /api/classes/[id]`
- `GET /api/assignments?class_id=...`
- `GET /api/assignments/[assignmentId]`
- `GET /api/assignments/[assignmentId]/comments`

### POST

- `POST /api/classes`
- `POST /api/classes/join`
- `POST /api/assignments`
- `POST /api/assignments/[assignmentId]/comments`
- `POST /api/assignments/[assignmentId]/submission`
- `POST /api/assignments/[assignmentId]/grade`

### DELETE

- `DELETE /api/classes/[id]`

### PUT y PATCH

Actualmente no existen endpoints `PUT` ni `PATCH` en el codigo del proyecto.

## Integracion con Supabase

El proyecto depende de Supabase para cuatro capas:

- `Auth`
- `Database`
- `Storage`
- `Realtime`

### Variables de entorno requeridas

Crea un archivo `.env.local` con valores reales de tu proyecto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
NEXT_ACCESS_TOKEN_SECRET=TU_TOKEN_LOCAL_SI_APLICA
```

Notas:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` si son usados por el codigo actual
- `NEXT_ACCESS_TOKEN_SECRET` existe en el entorno local observado, pero no aparece consumido directamente por el codigo actual del repo
- nunca subas claves reales al repositorio

### Configuracion minima de Auth

Debes tener habilitados en Supabase:

- Email/Password
- Google OAuth si quieres usar login social
- Facebook OAuth si quieres usar registro social
- Apple OAuth si quieres usar registro social

Agrega URLs de redireccion adecuadas en Supabase, por ejemplo:

- `http://localhost:3000/auth/callback`
- `https://tu-dominio/auth/callback`

### Buckets de Storage esperados

El codigo usa estos buckets:

- `assignment-submissions`
- `assignment-files`

Uso principal:

- `assignment-submissions`: archivos entregados por estudiantes
- `assignment-files`: archivos adjuntos a una asignacion

### Tablas esperadas en base de datos

El backend consulta o modifica estas tablas:

- `classes`
- `assignments`
- `class_members`
- `profiles`
- `assignment_comments`
- `assignment_submissions`
- `assignment_submissions_grades`
- `assignment_submission_files`
- `assignment_files`
- `notifications`
- `activity_events`
- `audit_logs`
- `files`

### Funciones RPC esperadas

Estas funciones deben existir en Supabase:

- `create_classroom`
- `join_class_by_code`

Si tu base de datos no tiene estas tablas o funciones, la app no podra operar correctamente.

## Flujo funcional resumido

### Profesor

1. inicia sesion
2. crea una clase
3. comparte el codigo de ingreso
4. crea asignaciones para la clase
5. revisa entregas en el detalle de la asignacion
6. asigna nota y feedback

### Estudiante

1. crea cuenta o inicia sesion
2. se une a una clase con codigo
3. entra a una asignacion
4. envia texto y/o archivos
5. revisa comentarios, estado y calificacion

## Lector de archivos

La aplicacion incluye viewers para distintos tipos de archivo:

- imagenes
- PDF
- Word / documentos Office
- video
- texto plano

Para documentos Office se usa `Microsoft Office Online Viewer` mediante `view.officeapps.live.com`.

## Tamano maximo de archivos

La ruta de entrega de asignaciones limita cada archivo a:

- `25 MB` por archivo

Si un archivo supera ese tamano, la API responde con error de validacion.

## Estructura del proyecto

```text
.
|-- middleware.ts
|-- proxy.ts
|-- package.json
|-- src
|   |-- app
|   |   |-- (auth)
|   |   |-- (dashboard)
|   |   |-- api
|   |   `-- auth/callback
|   |-- components
|   |   |-- assignments
|   |   |-- common
|   |   |-- dashboard
|   |   |-- providers
|   |   `-- ui
|   |-- features
|   |   |-- assignments
|   |   |-- classes
|   |   `-- realtime
|   |-- hooks
|   |-- lib
|   |   `-- supabase
|   |-- server
|   |   |-- api
|   |   |-- auth
|   |   |-- permissions
|   |   |-- repositories
|   |   |-- realtime
|   |   `-- services
|   |-- styles
|   |-- types
|   `-- utils
`-- postman
```

## Arquitectura interna

### `src/app`

Contiene paginas, layouts y route handlers de Next.js App Router.

### `src/server`

Separa la logica de negocio en capas:

- `repositories`: acceso a datos en Supabase
- `services`: reglas de negocio
- `permissions`: guardas y capacidades
- `auth`: resolucion de contexto autenticado
- `api`: helpers para respuestas y errores

### `src/lib/supabase`

Implementa clientes de Supabase para:

- navegador
- servidor
- middleware/proxy

### `src/features` y `src/hooks`

Contienen logica reutilizable de UI, realtime y consumo de endpoints.

## Instalacion

### Requisitos

- `Node.js 20+` recomendado
- `npm` disponible
- un proyecto Supabase configurado

### Pasos

```bash
npm install
```

Crea `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
NEXT_ACCESS_TOKEN_SECRET=TU_TOKEN_LOCAL_SI_APLICA
```

Luego inicia la app:

```bash
npm run dev
```

Abre:

```text
http://localhost:3000
```

## Scripts disponibles

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run qa:full
```

Descripcion:

- `npm run dev`: entorno local de desarrollo
- `npm run build`: build de produccion con webpack
- `npm run start`: levanta la build compilada
- `npm run lint`: ejecuta ESLint
- `npm run qa:full`: pensado para una suite QA automatizada

Estado actual del repo:

- `qa:full` esta declarado en `package.json`
- en el estado actual del arbol de trabajo no esta presente el archivo `scripts/qa/run-full-suite.mjs`
- antes de usar `qa:full`, conviene restaurar ese script o ajustar el comando

## Ejecucion en desarrollo

Flujo recomendado:

```bash
npm install
npm run dev
```

Para probar la build de produccion:

```bash
npm run build
npm run start
```

## Ejemplos de uso rapido

### Crear clase

1. inicia sesion
2. ve a `/dashboard` o `/classes`
3. crea una clase
4. comparte el codigo de acceso

### Crear asignacion

1. entra a una clase como `teacher` o `admin`
2. crea una asignacion desde la UI
3. consulta la lista en `GET /api/assignments?class_id=...`

### Entregar una tarea

1. entra como `student`
2. abre `/classes/[classId]/assignment/[assignmentId]`
3. adjunta archivos o contenido de texto
4. la entrega se envia a `POST /api/assignments/[assignmentId]/submission`

### Calificar una entrega

1. entra como `teacher`
2. abre el detalle de la asignacion
3. selecciona la entrega
4. envia nota y feedback a `POST /api/assignments/[assignmentId]/grade`

## Consideraciones de configuracion

- el middleware refresca la sesion en casi todas las rutas
- el dashboard redirige a `/login` si no hay usuario autenticado
- si Supabase no responde, varias pantallas muestran mensajes de indisponibilidad temporal en lugar de fallar silenciosamente
- el detalle de asignacion firma URLs de Storage por 1 hora
- la vista de detalle mezcla informacion de asignacion, comentarios, archivos, entrega propia y entregas de estudiantes dependiendo del rol

## Limitaciones y observaciones del estado actual

- el repo actual no incluye migraciones de Supabase ni definiciones SQL
- el repo actual no incluye el script fisico usado por `qa:full`
- algunas integraciones externas, como OAuth social, solo funcionaran si estan configuradas tambien en el panel de Supabase
- el proyecto asume que la base de datos ya tiene tablas, relaciones, buckets y funciones RPC creadas

## Recomendaciones para ponerlo en marcha desde cero

1. crea el proyecto Supabase
2. configura Auth y proveedores OAuth necesarios
3. crea tablas, relaciones, buckets y RPCs esperados por la app
4. define `.env.local`
5. ejecuta `npm install`
6. ejecuta `npm run dev`
7. valida login, creacion de clases, creacion de asignaciones y entrega de archivos

## Archivos utiles del repo

- `package.json`: scripts y dependencias
- `middleware.ts`: refresh de sesion
- `proxy.ts`: proxy/matcher alternativo para Supabase
- `src/lib/supabase/*`: clientes y manejo de errores
- `src/server/services/*`: reglas de negocio
- `src/app/api/*`: endpoints internos
- `postman/classroom-clone.collection.json`: coleccion Postman para smoke testing de API
- `apis-utilizadas.txt`: inventario rapido de APIs y servicios usados

## Licencia

No se encontro una licencia explicita en el repositorio actual. Si vas a publicarlo o compartirlo, conviene agregar un archivo `LICENSE`.
