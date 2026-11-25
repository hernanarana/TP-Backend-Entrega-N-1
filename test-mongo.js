// test-mongo.js — prueba rápida de conexión a MongoDB Atlas
// La cadena de conexión se lee de la variable de entorno MONGODB_URI (archivo .env).
// Nunca escribas usuarios ni contraseñas directamente en el código.
import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ Falta la variable MONGODB_URI. Copiá .env.example a .env y completala.');
  process.exit(1);
}

console.log('Intentando conectar a MongoDB Atlas...');
mongoose.connect(uri)
  .then(() => {
    console.log('✅ Conexión exitosa a MongoDB Atlas');
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error de conexión:\n', err.message);
    process.exit(1);
  });
