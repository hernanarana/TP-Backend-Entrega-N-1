// scripts/seed-extra.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { ProductModel } from '../models/product.model.js';

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/tp-backend';

const extra = [
  {
    title: 'Destornillador eléctrico',
    description: 'Velocidad variable, batería 12V con maletín.',
    price: 18900,
    stock: 15,
    category: 'herramientas',
    thumbnail: '/img/destornillador.jpg',
  },
  {
    title: 'Lijadora orbital',
    description: 'Base 1/4 de hoja, liviana y ergonómica.',
    price: 25900,
    stock: 12,
    category: 'herramientas',
    thumbnail: '/img/lijadora.jpg',
  },
  {
    title: 'Soldadora inverter 200A',
    description: 'Tecnología IGBT, incluye pinza masa y porta electrodos.',
    price: 179000,
    stock: 7,
    category: 'soldadura',
    thumbnail: '/img/soldadora.jpg',
  },
  {
    title: 'Compresor de aire 50L',
    description: '2HP, lubricado, con regulador y manómetro.',
    price: 265000,
    stock: 4,
    category: 'neumática',
    thumbnail: '/img/compresor.jpg',
  },
];

async function run() {
  await mongoose.connect(MONGO);
  console.log('✅ Mongo conectado');

  const inserted = await ProductModel.insertMany(extra, { ordered: false });
  console.log(`✅ Insertados: ${inserted.length}`);

  await mongoose.disconnect();
  console.log('✅ Listo');
}

run().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
