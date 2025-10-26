// test-mongo.js  (versión rápida, sin .env)
import mongoose from 'mongoose';

const uri = 'mongodb+srv://hernan:42911242@tp-backend.ednt2vn.mongodb.net/tp-backend?retryWrites=true&w=majority&appName=tp-backend';

console.log('Intentando conectar a MongoDB Atlas...');
mongoose.connect(uri)
  .then(() => {
    console.log('✅ Conexión exitosa a MongoDB Atlas');
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error de conexión:\n', err);
    process.exit(1);
  });
