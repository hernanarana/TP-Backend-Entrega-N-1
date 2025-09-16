const express = require('express');


const pickRouter = (m) => (m && typeof m === 'object' && m.default) ? m.default : m;

const productsRouter = pickRouter(require('./routes/products.router'));
const cartsRouter    = pickRouter(require('./routes/carts.router'));

const app = express();
const PORT = 8080;

app.use(express.json());


console.log('router types =>', typeof productsRouter, typeof cartsRouter);

app.get('/', (req, res) => res.json({ ok: true, msg: 'API viva en 8080' }));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
