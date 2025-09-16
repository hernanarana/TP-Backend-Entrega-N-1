const fs = require('fs');
const path = require('path');
const ProductManager = require('./ProductManager');

class CartManager {
  constructor(fileName = 'carts.json') {
    this.filePath = path.join(__dirname, '..', 'data', fileName);
    this.#ensureFile();
    this.products = new ProductManager(); 
  }

  #ensureFile() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.filePath)) fs.writeFileSync(this.filePath, '[]');
  }

  #readAll() { return JSON.parse(fs.readFileSync(this.filePath, 'utf-8') || '[]'); }
  #writeAll(data) { fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2)); }
  #nextId(items) { return items.length ? Math.max(...items.map(i => i.id)) + 1 : 1; }

  createCart() {
    const carts = this.#readAll();
    const newCart = { id: this.#nextId(carts), products: [] };
    carts.push(newCart);
    this.#writeAll(carts);
    return newCart;
  }

  getById(id) {
    return this.#readAll().find(c => String(c.id) === String(id)) || null;
  }

  addProduct(cid, pid) {
    const carts = this.#readAll();
    const idx = carts.findIndex(c => String(c.id) === String(cid));
    if (idx === -1) { const e = new Error('Carrito no encontrado'); e.status = 404; throw e; }

    
    const prod = this.products.getById(pid);
    if (!prod) { const e = new Error('Producto no existe'); e.status = 404; throw e; }

    const cart = carts[idx];
    const line = cart.products.find(p => String(p.product) === String(pid));
    if (line) line.quantity += 1;
    else cart.products.push({ product: Number(pid), quantity: 1 });

    carts[idx] = cart;
    this.#writeAll(carts);
    return cart;
  }
}

module.exports = CartManager;
