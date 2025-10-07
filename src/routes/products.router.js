// /src/routes/products.router.js
import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();

/* ========== Catálogo con búsqueda ========== */
router.get("/productos", async (req, res) => {
  const q = req.query.q || "";
  const items = await ProductManager.search(q);
  res.render("realTimeProducts", {
    title: "Catálogo — Herramienta del Sur",
    page: "productos",
    q,
    products: items
  });
});

/* ========== Detalle de producto (con normalización de imágenes) ========== */
router.get("/producto/:slug", async (req, res) => {
  const item = await ProductManager.getBySlug(req.params.slug);
  if (!item) return res.status(404).render("home", { title: "No encontrado" });

  // 1) Tomamos [image, ...images], quitamos falsy, normalizamos a únicos (sin duplicados)
  const imgs = [item.image, ...(item.images || [])].filter(Boolean);
  const unique = [...new Map(imgs.map(src => [src, src])).values()];

  // 2) Definimos hero y thumbs (si no hay nada, usamos un fallback de tu /public/img)
  const hero = unique[0] || "/img/taladro_1.jpg";
  const thumbs = unique.slice(1);

  // 3) Render con hero y thumbs ya limpios
  res.render("realTimeProducts", {
    title: `${item.title} — Herramienta del Sur`,
    page: "productos",
    product: { ...item, hero, thumbs },
    products: [item] // deja el array por si lo usás para relacionados
  });
});

/* ========== Carrito ========== */
router.get("/carrito", (_req, res) => {
  res.render("cart", {
    title: "Tu carrito — Herramienta del Sur",
    page: "carrito"
  });
});

/* ========== APIs opcionales ========== */
router.get("/api/products", async (_req, res) => {
  res.json(await ProductManager.getAll());
});
router.get("/api/products/:slug", async (req, res) => {
  const item = await ProductManager.getBySlug(req.params.slug);
  if (!item) return res.status(404).json({ error: "not-found" });
  res.json(item);
});

export default router;
