// scripts/seed.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { ProductModel } from '../models/product.model.js';

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/tp-backend';

async function run() {
  await mongoose.connect(MONGO);
  console.log('✅ Mongo conectado');

  // Limpia la colección
  await ProductModel.deleteMany({});
  console.log('🧹 Colección products vaciada');

  const items = [
    // AMOLADORAS
    { code:'P001', title:'Amoladora angular 230mm 2000W', description:'Ideal corte y desbaste, empuñadura lateral', price:36000, stock:5,  category:'herramientas', status:'available',   thumbnail:'/img/amoladora_1.jpg', images:['/img/amoladora_1.jpg','/img/amoladora_2.jpg','/img/amoladora_3.jpg'] },
    { code:'P002', title:'Amoladora angular 115mm 750W',  description:'Compacta y liviana, gatillo seguro',       price:25900, stock:9,  category:'herramientas', status:'available',   thumbnail:'/img/amoladora_2.jpg', images:['/img/amoladora_2.jpg','/img/amoladora_1.jpg'] },
    { code:'P003', title:'Amoladora recta 500W',          description:'Pinza 6mm, 25.000rpm, uso continuo',      price:75900, stock:0,  category:'herramientas', status:'unavailable', thumbnail:'/img/amoladora_3.jpg', images:['/img/amoladora_3.jpg','/img/amoladora_2.jpg'] },

    // TALADROS
    { code:'P004', title:'Taladro percutor 850W con maletín',   description:'Velocidad variable, reversa y tope',     price:34000, stock:8,  category:'herramientas', status:'available',   thumbnail:'/img/taladro_1.jpg',   images:['/img/taladro_1.jpg','/img/taladro_2.jpg','/img/taladro_3.jpg'] },
    { code:'P005', title:'Taladro inalámbrico 18V 2 baterías',  description:'Mandril 13mm, 21 posiciones de torque', price:56000, stock:6,  category:'herramientas', status:'available',   thumbnail:'/img/taladro_2.jpg',   images:['/img/taladro_2.jpg','/img/taladro_1.jpg'] },
    { code:'P006', title:'Taladro atornillador 12V',            description:'Ligero, ideal para hogar y montaje',    price:28900, stock:0,  category:'herramientas', status:'unavailable', thumbnail:'/img/taladro_3.jpg',   images:['/img/taladro_3.jpg','/img/taladro_1.jpg'] },

    // SIERRAS
    { code:'P007', title:'Sierra circular 7-1/4"',        description:'1500W, guía paralela y freno eléctrico', price:29000, stock:10, category:'herramientas', status:'available',   thumbnail:'/img/sierra_1.jpg',    images:['/img/sierra_1.jpg','/img/sierra_2.jpg','/img/sierra_3.jpg'] },
    { code:'P008', title:'Sierra sable 800W',             description:'Incluye 3 hojas, cambio rápido',        price:38900, stock:14, category:'herramientas', status:'available',   thumbnail:'/img/sierra_2.jpg',    images:['/img/sierra_2.jpg','/img/sierra_1.jpg'] },
    { code:'P009', title:'Sierra caladora 650W',          description:'Pendular 4 posiciones, base inclinable',price:25950, stock:3,  category:'herramientas', status:'available',   thumbnail:'/img/sierra_3.jpg',    images:['/img/sierra_3.jpg','/img/sierra_1.jpg'] },

    // IMPACTO / ATORNILLADORES
    { code:'P010', title:'Llave de impacto 18V',          description:'Par 180Nm, luz LED',                    price:41000, stock:7,  category:'herramientas', status:'available',   thumbnail:'/img/impacto_1.jpg',   images:['/img/impacto_1.jpg','/img/impacto_2.jpg','/img/impacto_3.jpg'] },
    { code:'P011', title:'Atornillador impacto 18V BL',   description:'Brushless, batería de larga duración', price:68900, stock:2,  category:'herramientas', status:'available',   thumbnail:'/img/impacto_2.jpg',   images:['/img/impacto_2.jpg','/img/impacto_3.jpg'] },
    { code:'P012', title:'Atornillador impacto 12V',      description:'Compacto para altura',                 price:51900, stock:0,  category:'herramientas', status:'unavailable', thumbnail:'/img/impacto_3.jpg',   images:['/img/impacto_3.jpg','/img/impacto_1.jpg'] },

    // ACCESORIOS / INDUMENTARIA / MEDICIÓN / SEGURIDAD
    { code:'P013', title:'Juego llaves combinadas (12 pzs)', description:'Acero Cr-V 8–19mm',            price:44900, stock:18, category:'accesorios',  status:'available',   thumbnail:'/img/impacto_2.jpg',   images:['/img/impacto_2.jpg'] },
    { code:'P014', title:'Set mechas metal (13 pzs)',         description:'HSS 135°, estuche',            price: 8900, stock:25, category:'accesorios',  status:'available',   thumbnail:'/img/taladro_1.jpg',   images:['/img/taladro_1.jpg'] },
    { code:'P015', title:'Multímetro digital True RMS',       description:'Capacitancia y frecuencia',     price:58900, stock:11, category:'medición',    status:'available',   thumbnail:'/img/sierra_2.jpg',    images:['/img/sierra_2.jpg'] },
    { code:'P016', title:'Nivel láser 360°',                  description:'Autonivelante con trípode',     price:124900,stock:4,  category:'medición',    status:'available',   thumbnail:'/img/sierra_3.jpg',    images:['/img/sierra_3.jpg'] },
    { code:'P017', title:'Guantes de trabajo reforzados',     description:'Cuero industrial',              price: 1200, stock:40, category:'indumentaria',status:'available',   thumbnail:'/img/amoladora_2.jpg', images:['/img/amoladora_2.jpg'] },
    { code:'P018', title:'Lentes de seguridad claros',        description:'Anti-rayas, protección UV',     price: 2300, stock:60, category:'indumentaria',status:'available',   thumbnail:'/img/amoladora_1.jpg', images:['/img/amoladora_1.jpg'] },
    { code:'P019', title:'Máscara soldar fotosensible',       description:'DIN 9-13 auto-oscurecimiento',  price:34900, stock:5,  category:'seguridad',   status:'available',   thumbnail:'/img/impacto_1.jpg',   images:['/img/impacto_1.jpg'] },
    { code:'P020', title:'Cinta métrica 8m',                  description:'Carcasa reforzada con freno',  price: 4200, stock:33, category:'accesorios',  status:'available',   thumbnail:'/img/sierra_1.jpg',    images:['/img/sierra_1.jpg'] },
  ];

  await ProductModel.insertMany(items);
  console.log(`✅ Seed OK: ${items.length} productos insertados`);

  await mongoose.disconnect();
  console.log('✅ Desconectado');
}

run().catch((e) => {
  console.error('❌ Seed error:', e);
  process.exit(1);
});
