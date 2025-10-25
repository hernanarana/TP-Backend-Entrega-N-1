import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  code: { type: String, required: true, unique: true, index: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0 },
  category: { type: String, index: true },
  status: { type: Boolean, default: true }
}, { timestamps: true });

export const ProductModel = mongoose.model("Product", productSchema);
