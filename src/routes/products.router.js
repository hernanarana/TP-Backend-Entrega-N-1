// src/routes/products.router.js
import { Router } from "express";

import { ProductModel } from "../../models/product.model.js";

const router = Router();

/** GET /api/products?limit=&page=&sort=&category=&status=&q= */
router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, category, status, q } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (typeof status !== "undefined") filter.status = status === "true";
    if (q) {
      filter.$or = [
        { title: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
        { code: new RegExp(q, "i") }
      ];
    }

    const query = ProductModel.find(filter);
    if (sort) query.sort(sort.replace(",", " ")); // ej: price o -price

    const docs = await query
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await ProductModel.countDocuments(filter);

    res.json({
      status: "success",
      payload: docs,
      page: Number(page),
      total,
      pages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

/** GET /api/products/:pid */
router.get("/:pid", async (req, res) => {
  try {
    const doc = await ProductModel.findById(req.params.pid).lean();
    if (!doc) return res.status(404).json({ status: "error", error: "Producto no encontrado" });
    res.json({ status: "success", payload: doc });
  } catch (_err) {
    res.status(400).json({ status: "error", error: "ID inválido" });
  }
});

/** POST /api/products */
router.post("/", async (req, res) => {
  try {
    const prod = await ProductModel.create(req.body);
    res.status(201).json({ status: "success", payload: prod });
  } catch (err) {
    res.status(400).json({ status: "error", error: err.message });
  }
});

/** PUT /api/products/:pid */
router.put("/:pid", async (req, res) => {
  try {
    const updated = await ProductModel.findByIdAndUpdate(
      req.params.pid,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ status: "error", error: "Producto no encontrado" });
    res.json({ status: "success", payload: updated });
  } catch (err) {
    res.status(400).json({ status: "error", error: err.message });
  }
});

/** DELETE /api/products/:pid */
router.delete("/:pid", async (req, res) => {
  try {
    const deleted = await ProductModel.findByIdAndDelete(req.params.pid);
    if (!deleted) return res.status(404).json({ status: "error", error: "Producto no encontrado" });
    res.json({ status: "success", payload: deleted._id });
  } catch (_err) {
    res.status(400).json({ status: "error", error: "ID inválido" });
  }
});

export default router;
