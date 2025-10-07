import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA = path.join(__dirname, "..", "data", "products.json");

export default class ProductManager {
  static async getAll() {
    const raw = await fs.readFile(DATA, "utf-8");
    return JSON.parse(raw);
  }
  static async getBySlug(slug) {
    const items = await this.getAll();
    return items.find(p => p.slug === slug);
  }
  static async search(q) {
    const items = await this.getAll();
    if (!q) return items;
    const s = q.toLowerCase();
    return items.filter(p =>
      p.title.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s)
    );
  }
}
