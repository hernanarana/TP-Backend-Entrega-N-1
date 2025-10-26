// src/routes/carts.router.js
import { Router } from 'express';
import mongoose from 'mongoose';
import { CartModel } from '../../models/cart.model.js';
import { ProductModel } from '../../models/product.model.js';

const router = Router();
const isId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/carts/:cid  -> carrito con populate
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    if (!isId(cid)) return res.status(400).json({ status:'error', error:'cid inválido' });
    const cart = await CartModel.findById(cid).populate('products.product').lean();
    if (!cart) return res.status(404).json({ status:'error', error:'carrito no encontrado' });
    res.json({ status:'success', payload: cart });
  } catch (e) {
    res.status(500).json({ status:'error', error:'internal' });
  }
});

// PUT /api/carts/:cid  -> reemplaza todos los productos (arreglo)
router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;
    if (!isId(cid)) return res.status(400).json({ status:'error', error:'cid inválido' });
    if (!Array.isArray(products)) return res.status(400).json({ status:'error', error:'products debe ser array' });

    const ids = products.map(p => p.product).filter(isId);
    const found = await ProductModel.find({ _id: { $in: ids } }, { _id: 1 }).lean();
    const ok = new Set(found.map(f => String(f._id)));
    const clean = products
      .filter(p => ok.has(String(p.product)))
      .map(p => ({ product: p.product, quantity: Math.max(1, Number(p.quantity)||1) }));

    const updated = await CartModel.findByIdAndUpdate(
      cid, { $set: { products: clean } }, { new: true, upsert: true }
    ).populate('products.product');

    res.json({ status:'success', payload: updated });
  } catch (e) {
    res.status(500).json({ status:'error', error:'internal' });
  }
});

// PUT /api/carts/:cid/products/:pid  -> actualiza SOLO cantidad
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const qty = Math.max(1, Number(req.body?.quantity) || 1);
    if (!isId(cid) || !isId(pid)) return res.status(400).json({ status:'error', error:'id inválido' });

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status:'error', error:'carrito no encontrado' });

    const i = cart.products.findIndex(p => String(p.product) === String(pid));
    if (i === -1) cart.products.push({ product: pid, quantity: qty });
    else cart.products[i].quantity = qty;

    await cart.save();
    const populated = await cart.populate('products.product');
    res.json({ status:'success', payload: populated });
  } catch (e) {
    res.status(500).json({ status:'error', error:'internal' });
  }
});

// DELETE /api/carts/:cid/products/:pid  -> elimina producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    if (!isId(cid) || !isId(pid)) return res.status(400).json({ status:'error', error:'id inválido' });

    const updated = await CartModel.findByIdAndUpdate(
      cid, { $pull: { products: { product: pid } } }, { new: true }
    ).populate('products.product');

    if (!updated) return res.status(404).json({ status:'error', error:'carrito no encontrado' });
    res.json({ status:'success', payload: updated });
  } catch (e) {
    res.status(500).json({ status:'error', error:'internal' });
  }
});

// DELETE /api/carts/:cid  -> vacía carrito
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    if (!isId(cid)) return res.status(400).json({ status:'error', error:'cid inválido' });

    const updated = await CartModel.findByIdAndUpdate(
      cid, { $set: { products: [] } }, { new: true }
    );
    if (!updated) return res.status(404).json({ status:'error', error:'carrito no encontrado' });
    res.json({ status:'success', payload: updated });
  } catch (e) {
    res.status(500).json({ status:'error', error:'internal' });
  }
});

export default router;
