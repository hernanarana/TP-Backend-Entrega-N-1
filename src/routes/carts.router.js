// src/routes/carts.router.js
import { Router } from 'express';
import { CartModel } from '../../models/cart.model.js';

const router = Router();

/** POST /api/carts — crea carrito vacío */
router.post('/', async (_req, res) => {
  try {
    const cart = await CartModel.create({ products: [] });
    return res.status(201).json({ status: 'success', payload: cart });
  } catch (err) {
    return res.status(500).json({ status: 'error', error: err.message });
  }
});

/** GET /api/carts/:cid — trae carrito con populate */
router.get('/:cid', async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.cid)
      .populate('products.product')
      .lean();
    if (!cart) return res.status(404).json({ status: 'error', error: 'Not found' });
    return res.json({ status: 'success', payload: cart });
  } catch (err) {
    return res.status(400).json({ status: 'error', error: 'Invalid id' });
  }
});

/** POST /api/carts/:cid/product/:pid — agrega producto (quantity opcional, default 1) */
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const qty = Number(req.body.quantity) || 1;

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Cart not found' });

    const idx = cart.products.findIndex(p => p.product.toString() === pid);
    if (idx === -1) cart.products.push({ product: pid, quantity: qty });
    else cart.products[idx].quantity += qty;

    await cart.save();
    return res.status(201).json({ status: 'success', payload: cart });
  } catch (err) {
    return res.status(400).json({ status: 'error', error: err.message });
  }
});

/** PUT /api/carts/:cid — reemplaza el array completo de productos */
router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body; // [{ product, quantity }]
    const cart = await CartModel.findByIdAndUpdate(
      cid,
      { products: Array.isArray(products) ? products : [] },
      { new: true }
    );
    if (!cart) return res.status(404).json({ status: 'error', error: 'Cart not found' });
    return res.json({ status: 'success', payload: cart });
  } catch (err) {
    return res.status(400).json({ status: 'error', error: err.message });
  }
});

/** PUT /api/carts/:cid/product/:pid — setea quantity de 1 ítem */
router.put('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const qty = Number(req.body.quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ status: 'error', error: 'Invalid quantity' });
    }

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Cart not found' });

    const item = cart.products.find(p => p.product.toString() === pid);
    if (!item) return res.status(404).json({ status: 'error', error: 'Product not in cart' });

    item.quantity = qty;
    await cart.save();
    return res.json({ status: 'success', payload: cart });
  } catch (err) {
    return res.status(400).json({ status: 'error', error: err.message });
  }
});

/** DELETE /api/carts/:cid/product/:pid — elimina 1 ítem */
router.delete('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Cart not found' });

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();
    return res.json({ status: 'success', payload: cart });
  } catch (err) {
    return res.status(400).json({ status: 'error', error: err.message });
  }
});

/** DELETE /api/carts/:cid — vacía el carrito */
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await CartModel.findByIdAndUpdate(cid, { products: [] }, { new: true });
    if (!cart) return res.status(404).json({ status: 'error', error: 'Cart not found' });
    return res.json({ status: 'success', payload: cart });
  } catch (err) {
    return res.status(400).json({ status: 'error', error: err.message });
  }
});

export default router;
