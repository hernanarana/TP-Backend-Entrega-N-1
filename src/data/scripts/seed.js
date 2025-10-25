// scripts/seed.js  — independiente (no importa modelos)
import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
const dbName = process.env.DB_NAME || 'tp-backend';

if (!uri) {
  console.error('❌ Falta MONGODB_URI/MONGO_URI en .env');
  process.exit(1);
}

// Defino un schema local igual al ProductModel
const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  code: { type: String, required: true, unique: true, index: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0 },
  category: { type: String, index: true },
  status: { type: Boolean, default: true }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

const now = Date.now();
const products = [
  { title: 'Guantes de trabajo', description: 'Cuero reforzado', code: `SKU-001-${now}`, price: 1200, stock: 20, category: 'indumentaria' },
  { title: 'Taladro percutor',   description: 'Potencia 850W con maletín', code: `SKU-002-${now}`, price: 34000, stock: 8, category: 'herramientas' },
  { title: 'Sierra circular',     description: 'Hoja 7-1/4"',              code: `SKU-003-${now}`, price: 29000, stock: 10, category: 'herramientas' },
  { title: 'Amoladora angular',   description: '230mm, motor 2000W',       code: `SKU-004-${now}`, price: 36000, stock: 5, category: 'herramientas' }
];

(async () => {
  try {
    await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 8000 });
    console.log(`✅ Conectado a MongoDB (${mongoose.connection.name})`);

    await Product.deleteMany({});
    console.log('🧹 Productos anteriores eliminados');

    const inserted = await Product.insertMany(products);
    console.log(`🌱 ${inserted.length} productos insertados`);

  } catch (err) {
    console.error('❌ Error en seed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexión cerrada');
  }
})();
