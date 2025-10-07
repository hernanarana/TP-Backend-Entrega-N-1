// src/routes/carts.router.js
import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import CartManager from "../managers/CartManager.js";

const router = Router();

// __dirname para fallback
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cartsFile = path.join(__dirname, "..", "data", "carts.json");
const fallbackCM = new CartManager(cartsFile);

const getCM = (req) => req.app?.get?.("cm") || fallbackCM;

/* ------- Rutas ------- */

// GET /api/carts
router.get("/", async (req, res) => {
  try {
    const cm = getCM(req);
    const carts = await (cm.getCarts?.() ?? cm.getAll?.());
    res.json(carts || []);
  } catch (e) {
    console.error("GET /carts error:", e);
    res.status(500).json({ error: "Error al obtener carritos" });
  }
});

// POST /api/carts
router.post("/", async (req, res) => {
  try {
    const cm = getCM(req);
    const cart = await (cm.createCart?.() ?? cm.addCart?.());
    res.status(201).json(cart);
  } catch (e) {
    console.error("POST /carts error:", e);
    res.status(500).json({ error: "Error al crear carrito" });
  }
});

// GET /api/carts/:cid
router.get("/:cid", async (req, res) => {
  try {
    const cm = getCM(req);
    const cart = await (cm.getCartById?.(req.params.cid) ?? cm.getById?.(req.params.cid));
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(cart);
  } catch (e) {
    console.error("GET /carts/:cid error:", e);
    res.status(500).json({ error: "Error al obtener carrito" });
  }
});

// POST /api/carts/:cid/product/:pid  (agrega producto)
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cm = getCM(req);
    const qty = Number(req.body?.quantity ?? req.body?.qty ?? 1) || 1;
    const up = await (cm.addProductToCart?.(req.params.cid, req.params.pid, qty) ??
                      cm.addToCart?.(req.params.cid, req.params.pid, qty));
    if (!up) return res.status(404).json({ error: "Carrito o producto inexistente" });
    res.status(201).json(up);
  } catch (e) {
    console.error("POST /carts/:cid/product/:pid error:", e);
    res.status(500).json({ error: "Error al agregar producto" });
  }
});

// PUT /api/carts/:cid/product/:pid  (setea cantidad)
router.put("/:cid/product/:pid", async (req, res) => {
  try {
    const cm = getCM(req);
    const qty = Number(req.body?.quantity ?? req.body?.qty);
    if (!Number.isFinite(qty) || qty < 0) {
      return res.status(400).json({ error: "quantity debe ser número >= 0" });
    }
    const up = await (cm.updateProductQty?.(req.params.cid, req.params.pid, qty) ??
                      cm.setQuantity?.(req.params.cid, req.params.pid, qty));
    if (!up) return res.status(404).json({ error: "Carrito o producto inexistente" });
    res.json(up);
  } catch (e) {
    console.error("PUT /carts/:cid/product/:pid error:", e);
    res.status(500).json({ error: "Error al actualizar cantidad" });
  }
});

// DELETE /api/carts/:cid/product/:pid
router.delete("/:cid/product/:pid", async (req, res) => {
  try {
    const cm = getCM(req);
    const ok = await (cm.removeProductFromCart?.(req.params.cid, req.params.pid) ??
                      cm.removeFromCart?.(req.params.cid, req.params.pid));
    if (!ok && ok !== undefined) return res.status(404).json({ error: "Carrito o producto inexistente" });
    res.sendStatus(204);
  } catch (e) {
    console.error("DELETE /carts/:cid/product/:pid error:", e);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

// DELETE /api/carts/:cid  (vacía carrito)
router.delete("/:cid", async (req, res) => {
  try {
    const cm = getCM(req);
    const ok = await (cm.clearCart?.(req.params.cid) ?? cm.emptyCart?.(req.params.cid));
    if (!ok && ok !== undefined) return res.status(404).json({ error: "Carrito no encontrado" });
    res.sendStatus(204);
  } catch (e) {
    console.error("DELETE /carts/:cid error:", e);
    res.status(500).json({ error: "Error al vaciar carrito" });
  }
});

export default router;
