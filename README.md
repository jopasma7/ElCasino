# El Casino - Proyecto Completo

Proyecto completo para El Casino Benilloba: Frontend (React + Vite) + Backend (Node.js + Express + PostgreSQL).

## 📁 Estructura del Proyecto

```
ElCasino/
├── frontend/          # React + Vite + TailwindCSS
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js + Express + PostgreSQL
│   ├── src/
│   ├── prisma/
│   └── package.json
└── README.md
```

## 🚀 Inicio Rápido

### 1. Configurar Backend

```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tu DATABASE_URL de Supabase
npm run prisma:push
npm run dev
```

El backend estará en `http://localhost:4000`

### 2. Configurar Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edita .env si es necesario (por defecto usa localhost:4000)
npm run dev
```

El frontend estará en `http://localhost:3000`

## 📦 Despliegue

### Frontend → Vercel
1. Push a GitHub
2. Importa en [Vercel](https://vercel.com)
3. Root directory: `frontend`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Variables de entorno:
   - `VITE_API_URL`: URL de tu backend en Zeabur

### Backend → Zeabur
1. Push a GitHub
2. Importa en [Zeabur](https://zeabur.com)
3. Root directory: `backend`
4. Variables de entorno:
   - `DATABASE_URL`: URL de Supabase
   - `JWT_SECRET`: Tu secreto
   - `FRONTEND_URL`: URL de Vercel

### Base de Datos → Supabase
1. Crea proyecto en [Supabase](https://supabase.com)
2. Copia la connection string
3. Úsala en `DATABASE_URL`

### Dominio → IONOS
En IONOS, configura DNS:
- Tipo: CNAME
- Host: www
- Destino: tu-proyecto.vercel.app

## 📚 Documentación

- [Frontend README](frontend/README.md)
- [Backend README](backend/README.md)

## 🛠️ Stack Tecnológico

**Frontend:**
- React 18
- Vite
- TailwindCSS
- React Router
- Axios

**Backend:**
- Node.js
- Express
- PostgreSQL
- Prisma ORM
- JWT
- Multer

## 👨‍💻 Desarrollo

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

## 📝 Licencia

© 2026 El Casino Benilloba - Todos los derechos reservados
