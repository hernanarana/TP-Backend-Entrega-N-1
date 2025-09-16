const fs = require('fs');
const path = require('path');

class ProductManager {
  constructor(fileName = 'products.json') {
    this.filePath = path.join(__dirname, '..', 'data', fileName);
    this.#ensureFile();
  }

  #ensureFile() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.filePath)) fs.writeFileSync(this.filePath, '[]');
  }

  #readAll() {
    const raw = fs.readFileSync(this.filePath, 'utf-8');
    return raw.trim() ? JSON.parse(raw) : [];
  }

  #writeAll(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  #nextId(items) {
    return items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
  }

  
  getAll() {
    return this.#readAll();
  }

  getById(id) {
    return this.#readAll().find(p => String(p.id) === String(id)) || null;
  }

  add(data) {
    const required = ['title','description','code','price','stock','category'];
    for (const k of required) {
      if (data[k] === undefined || String(data[k]).trim() === '') {
        const e = new Error(`Campo requerido faltante: ${k}`); e.status = 400; throw e;
      }
    }
    const items = this.#readAll();
    const newItem = {
      id: this.#nextId(items),
      title: String(data.title),
      description: String(data.description),
      code: String(data.code),
      price: Number(data.price),
      status: data.status === undefined ? true : Boolean(data.status),
      stock: Number(data.stock),
      category: String(data.category),
      thumbnails: Array.isArray(data.thumbnails) ? data.thumbnails.map(String) : []
    };
    items.push(newItem);
    this.#writeAll(items);
    return newItem;
  }

  update(id, partial = {}) {
    const items = this.#readAll();
    const idx = items.findIndex(p => String(p.id) === String(id));
    if (idx === -1) { const e = new Error('Producto no encontrado'); e.status = 404; throw e; }

    const { id: _omit, ...rest } = partial;
    const current = items[idx];
    const updated = { ...current };

    if (rest.title !== undefined) updated.title = String(rest.title);
    if (rest.description !== undefined) updated.description = String(rest.description);
    if (rest.code !== undefined) updated.code = String(rest.code);
    if (rest.price !== undefined) updated.price = Number(rest.price);
    if (rest.status !== undefined) updated.status = Boolean(rest.status);
    if (rest.stock !== undefined) updated.stock = Number(rest.stock);
    if (rest.category !== undefined) updated.category = String(rest.category);
    if (rest.thumbnails !== undefined) {
      updated.thumbnails = Array.isArray(rest.thumbnails) ? rest.thumbnails.map(String) : [];
    }

    items[idx] = updated;
    this.#writeAll(items);
    return updated;
  }

  delete(id) {
    const items = this.#readAll();
    const filtered = items.filter(p => String(p.id) !== String(id));
    if (filtered.length === items.length) { const e = new Error('Producto no encontrado'); e.status = 404; throw e; }
    this.#writeAll(filtered);
    return true;
  }
}

module.exports = ProductManager;
