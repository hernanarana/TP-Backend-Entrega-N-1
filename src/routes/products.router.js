import { Router } from 'express';
import { ProductModel } from '../../models/product.model.js';

const router = Router();

function link(path, params) {
  const u = new URL(path, 'http://localhost');
  Object.entries(params).forEach(([k,v]) => {
    if (v === undefined || v === null || v === '') return;
    u.searchParams.set(k, v);
  });
  return u.pathname + (u.search || '');
}

/**
 * GET /api/products
 * Query:
 *  - limit (default 10)
 *  - page  (default 1)
 *  - sort = 'asc' | 'desc'  (por precio)
 *  - query = categoría (string) o disponibilidad ('available'|'unavailable')
 *  - q = texto libre en título/description  (extra para UX)
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const { sort, query, q } = req.query;

    const filter = {};
    if (query) {
      const Q = String(query).toLowerCase();
      if (Q === 'available' || Q === 'unavailable') filter.status = Q;
      else filter.category = Q;
    }
    if (q) {
      const regex = new RegExp(String(q).trim(), 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const sortObj = {};
    if (sort === 'asc')  sortObj.price = 1;
    if (sort === 'desc') sortObj.price = -1;

    const [docs, total] = await Promise.all([
      ProductModel.find(filter)
        .sort(sortObj)
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),
      ProductModel.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    res.json({
      status: 'success',
      payload: docs,
      totalPages,
      prevPage: hasPrevPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage ? link('/api/products', { limit, page: page - 1, sort, query, q }) : null,
      nextLink: hasNextPage ? link('/api/products', { limit, page: page + 1, sort, query, q }) : null,
    });
  } catch (err) {
    console.error('[GET /api/products] Error:', err);
    res.status(500).json({ status: 'error', error: 'internal' });
  }
});

export default router;
