// src/controllers/products.controller.js
const Product = require('../../models/product.model');

function buildFilter(qs) {
  const { category, brand, minPrice, maxPrice, inStock, q } = qs;
  const f = {};
  if (category) f.category = category;
  if (brand) f.brand = brand;
  if (minPrice || maxPrice) f.price = {};
  if (minPrice) f.price.$gte = Number(minPrice);
  if (maxPrice) f.price.$lte = Number(maxPrice);
  if (inStock === 'true') f.stock = { $gt: 0 };
  if (q) f.$text = { $search: q };
  return f;
}
function parseSort(sort) {
  if (!sort) return { createdAt: -1 };
  const dir = sort.startsWith('-') ? -1 : 1;
  const field = sort.replace('-', '');
  return { [field]: dir };
}

exports.list = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 100);
    const skip = (page - 1) * limit;
    const sort = parseSort(req.query.sort);
    const filter = buildFilter(req.query);

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({ page, limit, total, totalPages: Math.ceil(total / limit) || 1, items });
  } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(p);
  } catch (e) { next(e); }
};
