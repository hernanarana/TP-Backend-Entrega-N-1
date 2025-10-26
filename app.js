// app.js (raíz)
import express from 'express';
import mongoose from 'mongoose';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Routers API
import productsRouter from './src/routes/products.router.js';
import cartsRouter from './src/routes/carts.router.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tp-backend';

// Paths base (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------- Middlewares --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Estáticos (sirve /public y /src/public)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'src', 'public')));

// -------------------- Handlebars ---------------------
app.engine(
  'handlebars',
  engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'src', 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'src', 'views', 'partials'),
    helpers: {
      eq: (a, b) => a === b,
      money: (v) =>
        new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(v || 0)),
    },
  })
);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src', 'views')); // 👈 src/views

// -------------------- MongoDB ------------------------
mongoose
  .connect(MONGO_URI)
  .then(() => console.log(`✅ [Mongo] Conectado a ${MONGO_URI}`))
  .catch((err) => console.error('❌ Error al conectar Mongo:', err));

// -------------------- Rutas de vistas ----------------
// Home
app.get('/', (_req, res) => {
  res.render('home', { title: 'Inicio', page: 'home', year: new Date().getFullYear() });
});

// Alias para listado: /products (oficial) y /productos (tu navegación)
const renderProducts = (_req, res) => {
  res.render('products', { title: 'Productos', page: 'productos', year: new Date().getFullYear() });
};
app.get('/products', renderProducts);
app.get('/productos', renderProducts);

// Carrito (vista simple)
app.get('/carrito', (_req, res) => {
  res.render('carrito', { title: 'Carrito', page: 'carrito', year: new Date().getFullYear() });
});

// -------------------- Rutas API ----------------------
app.use('/api/products', productsRouter); // GET /api/products?limit=&page=&sort=&query=
app.use('/api/carts', cartsRouter);

// -------------------- Health -------------------------
app.get('/healthz', (_req, res) => res.send('ok'));

// -------------------- 404 ----------------------------
app.use((req, res) => {
  res.status(404).render('404', { title: 'Página no encontrada', page: '404', year: new Date().getFullYear() });
});

// -------------------- Server -------------------------
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
