// src/managers/CartManager.js
import fs from "fs/promises";
import path from "path";

export default class CartManager {
  constructor(filePath) {
    this.file = filePath; // ej: .../src/data/carts.json
  }

  // --- utils ---
  async #read() {
    try {
      const txt = await fs.readFile(this.file, "utf-8");
      return JSON.parse(txt || "[]");
    } catch (e) {
      if (e.code === "ENOENT") {
        await this.#write([]);
        return [];
      }
      throw e;
    }
  }

  async #write(data) {
    const dir = path.dirname(this.file);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(data, null, 2));
  }

  #newId() {
    return globalThis.crypto?.randomUUID?.() || String(Date.now());
  }

  // --- API pública ---
  async getCarts() {
    return await this.#read();
  }

  async createCart() {
    const carts = await this.#read();
    const cart = { id: this.#newId(), products: [] };
    carts.push(cart);
    await this.#write(carts);
    return cart;
  }

  async getCartById(id) {
    const carts = await this.#read();
    return carts.find(c => String(c.id) === String(id)) || null;
  }

  async addProductToCart(cid, pid, qty = 1) {
    const carts = await this.#read();
    const cidx = carts.findIndex(c => String(c.id) === String(cid));
    if (cidx === -1) return null;

    const cart = carts[cidx];
    const pidx = cart.products.findIndex(i => String(i.product) === String(pid));
    if (pidx === -1) {
      cart.products.push({ product: String(pid), quantity: Number(qty) || 1 });
    } else {
      cart.products[pidx].quantity += Number(qty) || 1;
    }

    carts[cidx] = cart;
    await this.#write(carts);
    return cart;
  }

  async updateProductQty(cid, pid, qty) {
    const carts = await this.#read();
    const cidx = carts.findIndex(c => String(c.id) === String(cid));
    if (cidx === -1) return null;

    const cart = carts[cidx];
    const pidx = cart.products.findIndex(i => String(i.product) === String(pid));
    if (pidx === -1) return null;

    cart.products[pidx].quantity = Number(qty);
    carts[cidx] = cart;
    await this.#write(carts);
    return cart;
  }

  async removeProductFromCart(cid, pid) {
    const carts = await this.#read();
    const cidx = carts.findIndex(c => String(c.id) === String(cid));
    if (cidx === -1) return null;

    const cart = carts[cidx];
    const before = cart.products.length;
    cart.products = cart.products.filter(i => String(i.product) !== String(pid));
    const changed = cart.products.length !== before;

    carts[cidx] = cart;
    await this.#write(carts);
    return changed ? cart : null;
  }

  async clearCart(cid) {
    const carts = await this.#read();
    const cidx = carts.findIndex(c => String(c.id) === String(cid));
    if (cidx === -1) return null;

    carts[cidx].products = [];
    await this.#write(carts);
    return true;
  }
}
