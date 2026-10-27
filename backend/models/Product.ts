import mongoose, { Schema, Document, Model } from "mongoose";

export type ProductCategory = string;

export interface IProduct extends Omit<Document, "isNew"> {
  id: number;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  size: string;
  width: number;
  aspectRatio: number;
  rimDiameter: number;
  stock: number;
  isNewProduct: boolean;
  isBestseller?: boolean;
  image: string;
  description: string;
  loadIndex: string;
  speedRating: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    brand: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    size: { type: String, required: true },
    width: { type: Number, required: true },
    aspectRatio: { type: Number, required: true },
    rimDiameter: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    isNewProduct: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    image: { type: String, required: true },
    description: { type: String, required: true },
    loadIndex: { type: String, required: true },
    speedRating: { type: String, required: true },
  },
  { timestamps: true }
);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
