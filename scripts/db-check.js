// scripts/db-check.js
import "dotenv/config";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

console.log("🧪 Chequeo conexión Mongo…");
console.log("🧪 Tiene URI? ", !!uri);
console.log("🧪 DB_NAME:   ", dbName);

if (!uri) {
  console.error("❌ Falta MONGODB_URI/MONGO_URI en .env (en la raíz)");
  process.exit(1);
}

try {
  await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 8000 });
  console.log("✅ Conectó OK a:", mongoose.connection.name);
} catch (e) {
  console.error("❌ Error de conexión:", e.message);
} finally {
  await mongoose.disconnect();
  console.log("🔌 Desconectado");
}
