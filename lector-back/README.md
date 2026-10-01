# Lector PDF Online - Backend REST API (lector-back)

Servicio backend REST desarrollado con **Node.js**, **Express**, **MongoDB** y **Mongoose**, con autenticación segura por **JWT** (Access Token en memoria + Refresh Token en cookie HttpOnly con rotación).

Proporciona soporte de persistencia en la nube, sincronización de biblioteca, progreso de lectura y anotaciones (resaltados, notas y marcadores) sin romper el funcionamiento offline/local del frontend.

---

## Tabla de Contenidos

1. [Requisitos](#1-requisitos)
2. [Instalación](#2-instalación)
3. [Variables de Entorno](#3-variables-de-entorno)
4. [Ejecución en Desarrollo y Producción](#4-ejecución)
5. [Ejecución de Tests](#5-ejecución-de-tests)
6. [Arquitectura y Estructura](#6-arquitectura-y-estructura)
7. [Endpoints Principales (API REST)](#7-endpoints-principales-api-rest)
8. [Flujo de Autenticación y Seguridad](#8-flujo-de-autenticación-y-seguridad)
9. [Modelo de Datos](#9-modelo-de-datos)
10. [Estrategia de Sincronización con Frontend](#10-estrategia-de-sincronización-con-frontend)
11. [Decisiones de Diseño Importantes](#11-decisiones-de-diseño-importantes)

---

## 1. Requisitos

- **Node.js**: v18 o superior (recomendado v20+ o v22+).
- **MongoDB**: Instancia local de MongoDB (`mongodb://localhost:27017`) o un cluster en la nube como **MongoDB Atlas**.
- **Gestor de paquetes**: `npm`, `pnpm` o `yarn`.

---

## 2. Instalación

1. Dirígete a la carpeta del backend:
   ```bash
   cd lector-back
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

---

## 3. Variables de Entorno

Copia el archivo de ejemplo o edita el archivo `.env`:

```bash
cp .env.example .env
```

Contenido del archivo `.env`:

```env
# Puerto del servidor Express
PORT=5000

# Entorno: development | production | test
NODE_ENV=development

# URI de Conexión a MongoDB (Local o MongoDB Atlas)
MONGODB_URI=mongodb://localhost:27017/lector_pdf

# Claves Secretas JWT (Utilizar strings aleatorias y seguras de 32+ caracteres)
JWT_ACCESS_SECRET=lector_pdf_access_secret_super_secure_key_2026_jwt_token
JWT_REFRESH_SECRET=lector_pdf_refresh_secret_super_secure_key_2026_jwt_token

# Tiempos de Expiración
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# URL del Frontend (CORS)
CLIENT_URL=http://localhost:5173
```

> **Nota para MongoDB Atlas:** Si usas MongoDB Atlas, reemplaza `MONGODB_URI` por tu cadena de conexión (ej. `mongodb+srv://usuario:password@cluster.mongodb.net/lector_pdf?retryWrites=true&w=majority`).

---

## 4. Ejecución

### Modo Desarrollo (con recarga automática mediante Nodemon):
```bash
npm run dev
```

El servidor estará escuchando en `http://localhost:5000`. Puedes verificar su estado en:
`http://localhost:5000/api/health`

### Modo Producción:
```bash
npm start
```

---

## 5. Ejecución de Tests

Los tests utilizan **Vitest** y **mongodb-memory-server**, por lo que **no requieren que tengas MongoDB corriendo** localmente para ejecutar la suite de pruebas.

```bash
npm test
```

Suite de pruebas incluidas:
- Registro de usuario, normalización de email, hash con bcrypt, validaciones y conflicto de duplicados.
- Login y credenciales erróneas.
- Protección de rutas con JWT.
- Rotación de Refresh Token y Logout.
- CRUD de documentos y control estricto de propiedad (Ownership 403 Forbidden entre usuarios).
- Actualización de progreso y cálculo de porcentajes.
- Creación, actualización y borrado de anotaciones (highlights con rectángulos porcentuales, notas con coordenadas x/y y marcadores).
- Sincronización por lote (Batch Sync).

---

## 6. Arquitectura y Estructura

El backend sigue el patrón **Route → Controller → Service → Model**, garantizando modularidad y separación de responsabilidades:

```text
lector-back/
├── src/
│   ├── config/
│   │   ├── env.js                # Validación y centralización de variables de entorno
│   │   └── db.js                 # Conexión Mongoose y gestión de eventos
│   ├── controllers/
│   │   ├── authController.js     # Controladores de auth (cookies, tokens)
│   │   ├── documentController.js # Controladores de biblioteca y progreso
│   │   └── annotationController.js# Controladores de highlights, notas y bookmarks
│   ├── middleware/
│   │   ├── authMiddleware.js     # Verificación JWT y autenticación opcional
│   │   ├── errorMiddleware.js    # Manejador centralizado de errores y 404
│   │   ├── rateLimitMiddleware.js# Rate limiting contra ataques de fuerza bruta
│   │   └── validateMiddleware.js # Validación de schemas Zod (body, params, query)
│   ├── models/
│   │   ├── User.js               # Esquema de Usuario (hash con bcrypt, tokens)
│   │   ├── Document.js           # Metadatos del PDF, progreso y referencias
│   │   └── Annotation.js         # Colección unificada (highlight, note, bookmark)
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── documentRoutes.js     # /api/documents/*
│   │   ├── annotationRoutes.js   # /api/annotations/*
│   │   └── index.js              # Router principal (/api)
│   ├── services/
│   │   ├── authService.js        # Lógica de negocio de usuarios y sesiones
│   │   ├── documentService.js    # Lógica de documentos, filtros y ownership
│   │   └── annotationService.js  # Lógica de anotaciones y sync
│   ├── utils/
│   │   ├── apiError.js           # Clase ApiError con códigos HTTP
│   │   ├── apiResponse.js        # Respuestas uniformes { success: true, ... }
│   │   └── tokenUtils.js         # Generación y verificación JWT / cookies
│   ├── validators/
│   │   ├── authValidators.js     # Esquemas Zod para autenticación
│   │   ├── documentValidators.js # Esquemas Zod para documentos
│   │   └── annotationValidators.js # Esquemas Zod para anotaciones
│   ├── app.js                    # Configuración de Express, middlewares y CORS
│   └── server.js                 # Arranque del servidor y graceful shutdown
├── tests/
│   ├── setup.js                  # MongoMemoryServer lifecycle
│   ├── auth.test.js              # Tests de autenticación
│   ├── documents.test.js         # Tests de biblioteca y ownership
│   └── annotations.test.js       # Tests de anotaciones
├── .env.example
├── .env
├── package.json
└── README.md
```

---

## 7. Endpoints Principales (API REST)

Todos los endpoints que devuelven datos responden con el formato estándar:
```json
{
  "success": true,
  "message": "Descripción de la operación",
  "...datos": {}
}
```

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registro de nuevo usuario | Público (Rate limited) |
| `POST` | `/api/auth/login` | Inicio de sesión (devuelve accessToken + cookie refreshToken) | Público (Rate limited) |
| `POST` | `/api/auth/refresh` | Renovación de tokens (Token Rotation) | Cookie / Body |
| `POST` | `/api/auth/logout` | Cierre de sesión y revocación del refresh token | Autenticado |
| `GET` | `/api/auth/me` | Obtiene el perfil del usuario autenticado | `Bearer <token>` |

#### Ejemplo Registro (`POST /api/auth/register`)
Request:
```json
{
  "name": "Lautaro Collins",
  "email": "usuario@ejemplo.com",
  "password": "miPasswordSeguro123"
}
```
Response `201 Created`:
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "6740b...",
    "name": "Lautaro Collins",
    "email": "usuario@ejemplo.com",
    "createdAt": "2026-09-24T18:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

---

### Documentos y Biblioteca (`/api/documents`)

Todos requieren header `Authorization: Bearer <accessToken>`.

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/documents` | Listar documentos (con filtros `search`, `genre`, `priority`, `sortBy`, `page`, `limit`) |
| `POST` | `/api/documents` | Registrar un nuevo documento en la biblioteca |
| `POST` | `/api/documents/sync` | Sincronización por lote desde IndexedDB local |
| `GET` | `/api/documents/:id` | Obtener detalles y progreso de un documento |
| `PATCH` | `/api/documents/:id` | Modificar metadatos (título, autor, rating, prioridad) |
| `DELETE` | `/api/documents/:id` | Eliminar documento y sus anotaciones asociadas |
| `PATCH` | `/api/documents/:id/progress` | Actualizar progreso de lectura (`currentPage`, `progress`) |

#### Ejemplo Actualizar Progreso (`PATCH /api/documents/:id/progress`)
Request:
```json
{
  "currentPage": 42,
  "progress": 0.35,
  "numPages": 120,
  "readingTimeSeconds": 180
}
```
Response `200 OK`:
```json
{
  "success": true,
  "message": "Progreso de lectura actualizado",
  "document": {
    "id": "6740b...",
    "title": "Clean Code",
    "currentPage": 42,
    "numPages": 120,
    "progress": 0.35,
    "lastOpenedAt": "2026-09-24T18:15:00.000Z"
  }
}
```

---

### Anotaciones (`/api/documents/:id/annotations` y `/api/annotations/:id`)

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/documents/:id/annotations` | Listar anotaciones de un documento (filtrable con `?type=highlight\|note\|bookmark`) |
| `POST` | `/api/documents/:id/annotations` | Crear highlight, note o bookmark |
| `POST` | `/api/documents/:id/annotations/sync` | Sincronizar lote de anotaciones de un libro |
| `PATCH` | `/api/annotations/:id` | Modificar texto, posición o color de una anotación |
| `DELETE` | `/api/annotations/:id` | Eliminar una anotación |

---

## 8. Flujo de Autenticación y Seguridad

1. **Tokens Duales**:
   - **Access Token (15 min)**: Se envía en el cuerpo de la respuesta para que el frontend lo conserve en memoria (evitando persistirlo en `localStorage` donde es vulnerable a ataques XSS). Se envía en cada petición en el encabezado `Authorization: Bearer <token>`.
   - **Refresh Token (7 días)**: Se almacena en una **Cookie HttpOnly, Secure y SameSite**, inaccesible para scripts del cliente.
2. **Rotación de Refresh Tokens (Token Rotation)**:
   - Cada llamada a `/api/auth/refresh` invalida el refresh token utilizado y emite uno nuevo. Si un token revocado intenta reutilizarse, se revoca la sesión completa para prevenir ataques de repetición.
3. **Control de Propiedad (Resource Ownership)**:
   - Antes de leer, editar o eliminar cualquier documento o anotación, el sistema valida que pertenezca al `userId` del token autenticado. Si pertenece a otro usuario, responde con `403 Forbidden`.
4. **Protección Perimetral**:
   - **Helmet**: Cabeceras de seguridad HTTP estándar.
   - **CORS con Credentials**: Solo orígenes explícitamente permitidos (`CLIENT_URL`) pueden consultar la API y enviar cookies.
   - **Rate Limiting**: Limita las peticiones a endpoints de autenticación a 30 cada 15 minutos por IP para evitar ataques de fuerza bruta.
   - **Bcrypt**: Hashing de contraseñas con factor de coste 12.

---

## 9. Modelo de Datos

### User
```text
User
├── _id: ObjectId
├── name: String
├── email: String (unique, index, lowercase)
├── passwordHash: String (select: false)
├── refreshTokens: [{ token, expiresAt, createdAt }] (select: false)
├── createdAt: Date
└── updatedAt: Date
```

### Document
```text
Document
├── _id: ObjectId
├── userId: ObjectId (ref User, index)
├── localId: String (identificador local de IndexedDB para sync)
├── title: String
├── originalName: String
├── fileName: String
├── author: String
├── genre: String
├── priority: "Alta" | "Media" | "Baja"
├── rating: Number (0-5)
├── coverColor: String (gradiente Tailwind)
├── fileUrl: String (URL remota para S3/Cloudinary/Supabase)
├── storageReference: String
├── fileSize: Number
├── mimeType: String
├── currentPage: Number
├── numPages: Number
├── progress: Number (0.0 - 1.0)
├── readingTimeSeconds: Number
├── lastOpenedAt: Date
├── createdAt: Date
└── updatedAt: Date
```

### Annotation (Highlights, Notes, Bookmarks)
```text
Annotation
├── _id: ObjectId
├── userId: ObjectId (ref User, index)
├── documentId: ObjectId (ref Document, index)
├── localId: String (ID local UUID generado en cliente)
├── type: "highlight" | "note" | "bookmark"
├── pageNumber: Number
├── color: String
├── text: String (texto seleccionado o nota)
├── title: String (título de bookmark)
├── x: Number (porcentaje horizontal para nota pin)
├── y: Number (porcentaje vertical para nota pin)
├── rects: [{ xPercent, yPercent, widthPercent, heightPercent }] (para highlights)
├── position: Mixed
├── createdAt: Date
└── updatedAt: Date
```

---

## 10. Estrategia de Sincronización con Frontend

La persistencia local en **IndexedDB (`LectorPDF_LibraryDB`)** se mantiene completamente intacta y prioritaria para lectura offline:

```text
 ┌────────────────────────────────────────────────────────┐
 │ Frontend (Offline First)                               │
 │                                                        │
 │  IndexedDB (libros, blobs PDF, highlights, notas)     │
 └───────────────────────────┬────────────────────────────┘
                             │
                     ¿Usuario conectado?
                      ├─ NO  → Funciona 100% local
                      └─ SÍ  → Sincronización en la nube
                             │
 ┌───────────────────────────▼────────────────────────────┐
 │ Backend REST API (lector-back)                         │
 │                                                        │
 │  MongoDB (metadata, progreso, anotaciones en la nube)  │
 └────────────────────────────────────────────────────────┘
```

1. **Modo Sin Cuenta / Local**: El usuario puede usar todas las funciones del lector sin registrarse.
2. **Sincronización Bidireccional**: Al iniciar sesión, el frontend puede enviar sus libros locales (`POST /api/documents/sync`), asociar los `localId`, y guardar en la nube su progreso y anotaciones.
3. **Desacoplamiento de Archivos Binarios**: Los metadatos y progreso viven en MongoDB, mientras que los archivos PDF grandes pueden residir en el Blob local de IndexedDB o en el futuro conectarse a buckets de almacenamiento (S3, Cloudinary, etc.) mediante el campo `fileUrl`.

---

## 11. Decisiones de Diseño Importantes

1. **Anotaciones como Colección Independiente**:
   - En lugar de embeber cientos de highlights como subdocumentos dentro del Documento (lo que saturaría el documento de MongoDB y requeriría actualizar todo el PDF en cada nota), se utilizó una colección unificada `Annotation`. Esto permite consultas O(1) con `PATCH /api/annotations/:id` y `DELETE /api/annotations/:id`, e indexación rápida por `documentId` y `type`.
2. **Coordenadas Porcentuales (`xPercent`, `yPercent`, `x`, `y`)**:
   - Para ser 100% compatibles con el visor de PDF (`PDFViewer.jsx` en frontend), las posiciones de los resaltados y notas se almacenan en porcentajes relativos. De este modo, los resaltados se dibujan exactamente en el mismo lugar sin importar el factor de zoom (`scale`) ni el tamaño de la pantalla del dispositivo.
