// scripts/assign-thumbnails.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { ProductModel } from '../models/product.model.js';

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/tp-backend';

// -------------------- Config --------------------
const rules = [
  { re: /amoladora/i, files: ['/img/amoladora_1.jpg', '/img/amoladora_2.jpg', '/img/amoladora_3.jpg'] },
  { re: /taladro/i,   files: ['/img/taladro_1.jpg',   '/img/taladro_2.jpg',   '/img/taladro_3.jpg'] },
  { re: /sierra/i,    files: ['/img/sierra_1.jpg',    '/img/sierra_2.jpg',    '/img/sierra_3.jpg'] },
  { re: /impacto/i,   files: ['/img/impacto_1.jpg',   '/img/impacto_2.jpg',   '/img/impacto_3.jpg'] },
];

// Si querés reemplazos exactos por título, ponelos acá
const titleOverrides = {
  // "Sierra circular 1500W": "/img/sierra_2.jpg",
};

// Flags
const DRY = process.argv.includes('--dry');
const ONLY_MISSING = process.argv.includes('--only-missing');

// -------------------- Funciones --------------------
function pickImagesFor(title = '') {
  if (!title) return [];
  if (titleOverrides[title]) return [titleOverrides[title]];
  for (const r of rules) if (r.re.test(title)) return r.files;
  return [];
}

async function run() {
  await mongoose.connect(MONGO);
  console.log(`✅ Conectado a Mongo: ${MONGO}`);

  const query = ONLY_MISSING ? { $or: [{ thumbnail: { $exists: false } }, { thumbnail: null }, { thumbnail: '' }] } : {};
  const products = await ProductModel.find(query).lean();

  let scanned = 0, matched = 0, updated = 0, skipped = 0;

  for (const p of products) {
    scanned++;
    const imgs = pickImagesFor(p.title);
    if (!imgs.length) { skipped++; continue; }

    const newThumb = imgs[0];
    const newImages = imgs;

    const needUpdate =
      p.thumbnail !== newThumb ||
      !Array.isArray(p.images) ||
      p.images.sort().join() !== newImages.sort().join();

    if (!needUpdate) { skipped++; continue; }

    matched++;

    if (DRY) {
      console.log(`→ (dry) ${p.title}: ${p.thumbnail ?? '(sin)'} → ${newThumb}`);
      continue;
    }

    await ProductModel.findByIdAndUpdate(p._id, {
      $set: { thumbnail: newThumb, images: newImages }
    });

    console.log(`✔ ${p.title}: thumbnail actualizado → ${newThumb}`);
    updated++;
  }

  console.log('\n— Resumen —');
  console.log(`Escaneados:   ${scanned}`);
  console.log(`Coincidencias: ${matched}`);
  console.log(`Actualizados:  ${updated}`);
  console.log(`Omitidos:      ${skipped}`);

  await mongoose.disconnect();
  console.log('✅ Listo — Thumbnails asignados correctamente.');
}

run().catch(err => {
  console.error('❌ Error en el proceso:', err);
  process.exit(1);
});
