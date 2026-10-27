import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  name: string;
  brand?: string;
  size?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface IOrder extends Document {
  orderId: string;
  userId: string; // firebaseUid
  date: string;
  status: "Pending Payment" | "Processing" | "In Transit" | "Delivered" | "Cancelled";
  paymentStatus: "Pending" | "Paid" | "Failed" | "Cancelled" | "ChargedBack" | "Not Required";
  items: IOrderItem[];
  itemSummary: string;
  subtotal: number;
  delivery: number;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  trackingNumber: string;
  carrier?: string;
  estimatedDelivery?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    name: { type: String, required: true },
    brand: { type: String, default: "" },
    size: { type: String, default: "" },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
    imageUrl: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending Payment", "Processing", "In Transit", "Delivered", "Cancelled"],
      default: "Processing",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Cancelled", "ChargedBack", "Not Required"],
      default: "Not Required",
    },
    items: [OrderItemSchema],
    itemSummary: { type: String, default: "" },
    subtotal: { type: Number, required: true },
    delivery: { type: Number, default: 0 },
    total: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    paymentMethod: { type: String, default: "Credit Card" },
    trackingNumber: { type: String, default: "" },
    carrier: { type: String, default: "RoadGrip Express Logistics" },
    estimatedDelivery: { type: String, default: "1–2 business days" },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
