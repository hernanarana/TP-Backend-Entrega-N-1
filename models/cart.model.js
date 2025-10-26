import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const cartItemSchema = new Schema({
  product: { type: Types.ObjectId, ref: 'Product', required: true },
  qty: { type: Number, default: 1, min: 1 },
}, { _id: false });

const cartSchema = new Schema({ items: { type: [cartItemSchema], default: [] } }, { timestamps: true });

export const CartModel = model('Cart', cartSchema);
