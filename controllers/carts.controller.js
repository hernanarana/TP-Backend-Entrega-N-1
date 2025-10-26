// src/controllers/carts.controller.js
const Cart = require('../../models/cart.model');
const Product = require('../../models/product.model');

exports.create = async (req, res, next) => {
  try { const c = await Cart.create({ items: [] }); res.status(201).json(c); }
  catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const c = await Cart.findById(req.params.id).populate('items.product').lean();
    if (!c) return res.status(404).json({ error: 'Carrito no encontrado' });
    const total = c.items.reduce((a, it) => a + it.product.price * it.qty, 0);
    res.json({ ...c, total });
  } catch (e) { next(e); }
};

exports.addItem = async (req, res, next) => {
  try {
    const { productId, qty = 1 } = req.body;
    const prod = await Product.findById(productId);
    if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });

    const c = await Cart.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Carrito no encontrado' });

    const i = c.items.findIndex(x => String(x.product) === productId);
    if (i >= 0) c.items[i].qty += qty;
    else c.items.push({ product: productId, qty });

    await c.save();
    await c.populate('items.product');
    res.status(201).json(c);
  } catch (e) { next(e); }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { qty } = req.body;
    const c = await Cart.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Carrito no encontrado' });

    const i = c.items.findIndex(x => String(x.product) === req.params.productId);
    if (i === -1) return res.status(404).json({ error: 'Ítem no está en el carrito' });

    if (qty <= 0) c.items.splice(i, 1);
    else c.items[i].qty = qty;

    await c.save();
    await c.populate('items.product');
    res.json(c);
  } catch (e) { next(e); }
};

exports.clear = async (req, res, next) => {
  try {
    const c = await Cart.findByIdAndUpdate(req.params.id, { items: [] }, { new: true }).populate('items.product');
    if (!c) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(c);
  } catch (e) { next(e); }
};
