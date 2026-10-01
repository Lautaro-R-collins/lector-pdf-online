# Lector PDF Online

Proyecto fullstack para lectura de libros y documentos PDF, con biblioteca personal, visor con resaltado y notas, pomodoro y persistencia dual: local (IndexedDB) y en la nube (Node.js, Express, MongoDB, JWT).

---

## Estructura del Proyecto

El repositorio está organizado en dos módulos independientes y desacoplados:

```text
lector-pdf-online/
├── lector-front/   # Aplicación Frontend (React 19, Vite, TailwindCSS v4, PDF.js, IndexedDB)
├── lector-back/    # API Backend REST (Node.js, Express, MongoDB, Mongoose, JWT)
├── package.json    # Scripts globales del workspace
├── vercel.json     # Configuración para despliegue en Vercel
└── README.md
```

---

## Comandos Rápidos desde la Raíz

Puedes ejecutar los comandos directamente desde la raíz del proyecto:

| Comando | Acción |
|---|---|
| `npm run dev` | Inicia el frontend en modo desarrollo (`localhost:5173`) |
| `npm run dev:back` | Inicia el backend con Nodemon (`localhost:5000`) |
| `npm run build` | Compila el bundle de producción del frontend |
| `npm run test:back` | Ejecuta los tests automatizados del backend |

---

## 1. Frontend (`lector-front`)

```bash
cd lector-front
npm install
npm run dev
```

- **Variables de Entorno**: Ver `lector-front/.env.example`
  - `VITE_API_URL=http://localhost:5000/api`

---

## 2. Backend (`lector-back`)

```bash
cd lector-back
npm install
npm run dev
```

- **Tests del Backend**:
  ```bash
  cd lector-back
  npm test
  ```
- **Variables de Entorno**: Ver `lector-back/.env.example`
  - `PORT=5000`
  - `MONGODB_URI=mongodb://localhost:27017/lector_pdf` (o MongoDB Atlas)
  - `JWT_ACCESS_SECRET=...`
  - `JWT_REFRESH_SECRET=...`
  - `CLIENT_URL=http://localhost:5173`

---

## Despliegue en Vercel

El archivo `vercel.json` en la raíz ya está configurado con:
- `buildCommand`: `npm run build --prefix lector-front`
- `outputDirectory`: `lector-front/dist`
- Reglas de reescritura SPA (`/(.*)` -> `/index.html`) para evitar errores 404 al recargar la página.
