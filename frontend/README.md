# El Casino Benilloba - Frontend

Frontend moderno para el bar restaurante El Casino en Benilloba, desarrollado con React + Vite + TailwindCSS.

## 🚀 Características

- ✨ Diseño moderno y responsive
- 🍽️ Gestión de carta y menús
- 📸 Galería de imágenes de platos
- 🛒 Sistema de pedidos online
- 📱 Totalmente responsive (móvil, tablet, desktop)
- 🎨 Interfaz profesional con TailwindCSS
- ⚡ Rápido y optimizado con Vite

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🛠️ Tecnologías

- **React 18** - Framework UI
- **Vite** - Build tool
- **React Router** - Navegación
- **TailwindCSS** - Estilos
- **Lucide React** - Iconos
- **Axios** - HTTP client

## 📂 Estructura del Proyecto

```
ElCasino/
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/          # Páginas de la aplicación
│   │   ├── Home.jsx
│   │   ├── Menu.jsx
│   │   ├── Gallery.jsx
│   │   ├── DailyMenu.jsx
│   │   ├── Order.jsx
│   │   ├── Contact.jsx
│   │   └── Admin.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
└── package.json
```

## 🎨 Páginas

- **Inicio** - Landing page con información del restaurante
- **Carta** - Menú completo con filtros por categoría
- **Menú del Día** - Menús diarios actualizables
- **Galería** - Fotos de los platos
- **Hacer Pedido** - Sistema de pedidos online
- **Contacto** - Información de contacto y ubicación
- **Admin** - Panel de administración (protegido)

## 🔗 Deployment

### Vercel (Recomendado para Frontend)

1. Sube tu código a GitHub
2. Ve a [Vercel](https://vercel.com)
3. Importa tu repositorio
4. Configura el build:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Deploy!

### Configurar dominio personalizado

En Vercel:
1. Settings → Domains
2. Añade tu dominio: `elcasinobenilloba.com`
3. En IONOS, configura los DNS:
   - Tipo: CNAME
   - Host: www
   - Apunta a: tu-proyecto.vercel.app

## 🔌 Conectar con Backend

En tus archivos, busca los comentarios `// TODO: Conectar con API backend` y reemplaza con tu URL de Zeabur:

```javascript
const API_URL = 'https://tu-backend.zeabur.app/api'
```

## 👨‍💻 Autor

Desarrollado para El Casino Benilloba

## 📄 Licencia

Todos los derechos reservados © 2026 El Casino Benilloba
