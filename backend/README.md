# El Casino Benilloba - Backend

Backend API REST para el restaurante El Casino, desarrollado con Node.js + Express + PostgreSQL + Prisma.

## 🚀 Características

- ✨ API REST completa
- 🗄️ PostgreSQL con Prisma ORM
- 🔐 Autenticación JWT
- 📸 Upload de imágenes
- 🛡️ Validación de datos
- 🔒 Rutas protegidas

## 📦 Instalación

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` con tus datos:
```env
NODE_ENV=development
PORT=4000

# PostgreSQL - Obtén esta URL de Supabase
DATABASE_URL="postgresql://usuario:password@host:5432/elcasino"

JWT_SECRET=tu_secreto_super_seguro

FRONTEND_URL=http://localhost:3000
```

### 3. Configurar Base de Datos

#### Opción A: Supabase (Recomendado - Gratis)

1. Ve a [Supabase](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Ve a **Settings** → **Database** → **Connection string** → **URI**
4. Copia la URL y pégala en `DATABASE_URL` en tu `.env`
5. Reemplaza `[YOUR-PASSWORD]` con tu contraseña

#### Opción B: PostgreSQL Local

```bash
# Instalar PostgreSQL en tu máquina
# Crear base de datos
createdb elcasino

# URL en .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/elcasino"
```

### 4. Crear las tablas en la base de datos
```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Crear las tablas
npm run prisma:push

# O crear migraciones (recomendado para producción)
npm run prisma:migrate
```

### 5. Generar hash de contraseña de admin
```bash
# Inicia el servidor
npm run dev

# Usa este endpoint para generar el hash:
curl -X POST http://localhost:4000/api/auth/hash-password \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}'

# Copia el hash generado y ponlo en .env como ADMIN_PASSWORD_HASH
```

### 6. Iniciar servidor
```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor estará corriendo en `http://localhost:4000`

## 📚 API Endpoints

### 🔓 Públicos

#### Health Check
```
GET /
```

#### Platos
```
GET    /api/dishes              - Obtener todos los platos
GET    /api/dishes/:id          - Obtener plato por ID
```

#### Galería
```
GET    /api/gallery             - Obtener todas las imágenes
GET    /api/gallery/:id         - Obtener imagen por ID
```

#### Menú del Día
```
GET    /api/daily-menu/today    - Obtener menú del día actual
```

#### Pedidos
```
POST   /api/orders              - Crear nuevo pedido
```

### 🔐 Requieren Autenticación

Incluye el header: `Authorization: Bearer TOKEN`

#### Autenticación
```
POST   /api/auth/login          - Login de admin
GET    /api/auth/verify         - Verificar token
```

#### Platos (Admin)
```
POST   /api/dishes              - Crear plato
PUT    /api/dishes/:id          - Actualizar plato
DELETE /api/dishes/:id          - Eliminar plato
```

#### Galería (Admin)
```
POST   /api/gallery             - Subir imagen
PUT    /api/gallery/:id         - Actualizar imagen
DELETE /api/gallery/:id         - Eliminar imagen
```

#### Menú del Día (Admin)
```
GET    /api/daily-menu          - Obtener todos los menús
POST   /api/daily-menu          - Crear menú
PUT    /api/daily-menu/:id      - Actualizar menú
DELETE /api/daily-menu/:id      - Eliminar menú
```

#### Pedidos (Admin)
```
GET    /api/orders              - Obtener todos los pedidos
GET    /api/orders/:id          - Obtener pedido por ID
PUT    /api/orders/:id/status   - Actualizar estado
DELETE /api/orders/:id          - Cancelar pedido
```

## 🧪 Ejemplos de uso

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}'
```

### Crear Plato
```bash
curl -X POST http://localhost:4000/api/dishes \
  -H "Authorization: Bearer TU_TOKEN" \
  -F "name=Paella Valenciana" \
  -F "description=Arroz con pollo y verduras" \
  -F "price=12.50" \
  -F "category=primeros" \
  -F "image=@/ruta/a/imagen.jpg"
```

### Hacer Pedido
```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "type": "takeaway",
    "customerName": "Juan Pérez",
    "customerPhone": "666123456",
    "items": [
      {"dishId": "uuid-del-plato", "quantity": 2}
    ]
  }'
```

## 🗂️ Estructura del Proyecto

```
backend/
├── prisma/
│   └── schema.prisma        # Schema de la base de datos
├── src/
│   ├── config/
│   │   └── database.js      # Configuración Prisma
│   ├── middleware/
│   │   ├── auth.js          # Middleware JWT
│   │   └── upload.js        # Middleware multer
│   ├── routes/
│   │   ├── auth.js          # Rutas de autenticación
│   │   ├── dishes.js        # Rutas de platos
│   │   ├── gallery.js       # Rutas de galería
│   │   ├── dailyMenu.js     # Rutas de menú del día
│   │   └── orders.js        # Rutas de pedidos
│   └── index.js             # Entry point
├── uploads/                 # Imágenes subidas
├── .env.example
├── package.json
└── README.md
```

## 🚀 Deploy en Zeabur

### 1. Preparar el proyecto
```bash
git init
git add .
git commit -m "Initial commit"
git push a tu repositorio
```

### 2. Deploy
1. Ve a [Zeabur](https://zeabur.com)
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno:
   - `DATABASE_URL` (de Supabase)
   - `JWT_SECRET`
   - `FRONTEND_URL` (URL de tu frontend en Vercel)
4. ¡Deploy!

### 3. Ejecutar migraciones en producción
En la consola de Zeabur:
```bash
npx prisma db push
```

## 🔧 Comandos útiles

```bash
# Ver la base de datos en navegador
npm run prisma:studio

# Generar cliente de Prisma
npm run prisma:generate

# Crear migración
npm run prisma:migrate

# Push schema sin migraciones
npm run prisma:push
```

## 📝 Notas

- La contraseña por defecto del admin es `admin123`
- Las imágenes se guardan en `/uploads`
- Los tokens JWT expiran en 24 horas
- Máximo tamaño de imagen: 5MB

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT para autenticación
- ✅ Validación de datos con express-validator
- ✅ CORS configurado
- ✅ Upload de archivos validado

---

Desarrollado para El Casino Benilloba 🍽️
