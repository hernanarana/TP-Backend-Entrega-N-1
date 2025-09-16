const { Router } = require('express');
const CartManager = require('../managers/CartManager');

const router = Router();
const manager = new CartManager();

router.post('/', (req, res, next) => {
  try { res.status(201).json(manager.createCart()); } catch (e) { next(e); }
});

router.get('/:cid', (req, res, next) => {
  try {
    const cart = manager.getById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart.products);
  } catch (e) { next(e); }
});

router.post('/:cid/product/:pid', (req, res, next) => {
  try { res.status(201).json(manager.addProduct(req.params.cid, req.params.pid)); }
  catch (e) { next(e); }
});

module.exports = router;
