// models/product.model.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  code: { type: String, unique: true, index: true, required: true },
  title: { type:String, required:true },
  description: String,
  price: { type:Number, required:true },
  stock: { type:Number, default:0 },
  category: { type:String, index:true },
  status: { type:String, enum:['available','unavailable'], default:'available' },
  thumbnail: String,
  images: [String],
}, { timestamps:true });

export const ProductModel = mongoose.model('Product', productSchema);
