// db/mongo.js
import mongoose from "mongoose";

export async function connectMongo() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || undefined;

  // Logs de diagnóstico útiles
  console.log("🧪 MONGODB_URI presente?", !!process.env.MONGODB_URI);
  console.log("🧪 MONGO_URI presente?  ", !!process.env.MONGO_URI);
  console.log("🧪 DB_NAME:             ", dbName);

  if (!uri) {
    throw new Error("Falta MONGODB_URI o MONGO_URI en .env (en la RAÍZ)");
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 8000, // falla rápido si no llega a Atlas
    });
    console.log(`✅ [Mongo] Conectado a ${mongoose.connection.name}`);
  } catch (err) {
    console.error("❌ [Mongo] No se pudo conectar:", err.message);
    // Errores comunes:
    // - "getaddrinfo ENOTFOUND ..." -> mal host en la URI
    // - "bad auth" -> usuario/password incorrectos o sin permisos
    // - "IP not allowed" -> falta Network Access en Atlas
    throw err;
  }
}
