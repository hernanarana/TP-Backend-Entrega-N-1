const { Router } = require('express');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const manager = new ProductManager();


router.get('/', (req, res, next) => {
  try { res.json(manager.getAll()); } catch (e) { next(e); }
});


router.get('/:pid', (req, res, next) => {
  try {
    const item = manager.getById(req.params.pid);
    if (!item) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(item);
  } catch (e) { next(e); }
});

router.post('/', (req, res, next) => {
  try { res.status(201).json(manager.add(req.body || {})); } catch (e) { next(e); }
});


router.put('/:pid', (req, res, next) => {
  try { res.json(manager.update(req.params.pid, req.body || {})); } catch (e) { next(e); }
});


router.delete('/:pid', (req, res, next) => {
  try { manager.delete(req.params.pid); res.status(204).end(); } catch (e) { next(e); }
});

module.exports = router;
