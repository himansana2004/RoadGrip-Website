import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAddress extends Document {
  userId: string; // firebaseUid
  label: string; // 'Home' | 'Work' | 'Garage' | 'Other'
  fullName: string;
  phone: string;
  street: string;
  city: string;
  postcode: string;
  country: string;
  isDefault: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    userId: { type: String, required: true, index: true },
    label: { type: String, default: "Home" },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    postcode: { type: String, required: true },
    country: { type: String, default: "United Kingdom" },
    isDefault: { type: Boolean, default: false },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Address: Model<IAddress> =
  mongoose.models.Address || mongoose.model<IAddress>("Address", AddressSchema);
