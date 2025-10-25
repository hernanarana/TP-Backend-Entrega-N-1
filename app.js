// app.js
import 'dotenv/config';
import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectMongo } from './db/mongo.js';
import productsRouter from './src/routes/products.router.js';
import cartsRouter from './src/routes/carts.router.js';
import { ProductModel } from './models/product.model.js'; // <-- IMPORT DEL MODELO

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Handlebars (si usás vistas)
app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'src', 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'src', 'views', 'partials'),
  helpers: {
    eq: (a, b) => a === b,
    currency: v =>
      new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })
        .format(v),
  },
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src', 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'src', 'public')));

// vistas
app.get('/', (_req, res) => {
  res.render('home', {
    title: 'Herramienta del Sur — Inicio',
    page: 'home',
    year: new Date().getFullYear(),
  });
});

// NUEVA PÁGINA: /productos (renderiza lista desde Mongo)
app.get('/productos', async (_req, res) => {
  try {
    const productos = await ProductModel.find().lean();
    res.render('products', {
      title: 'Herramienta del Sur — Productos',
      page: 'productos',
      year: new Date().getFullYear(),
      payload: productos, // productos disponibles en la vista
    });
  } catch (err) {
    console.error('[Vistas] /productos error:', err);
    res.status(500).send('Error cargando productos');
  }
});

// API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// health
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

const PORT = process.env.PORT || 3000;

connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server: http://localhost:${PORT}`);
      console.log('✅ Mongo conectado');
    });
  })
  .catch(err => {
    console.error('[Mongo] Error al conectar:', err.message);
    process.exit(1);
  });
