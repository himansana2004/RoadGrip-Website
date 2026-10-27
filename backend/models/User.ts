import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  memberSince: string;
  loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  loyaltyPoints: number;
  role: "Admin" | "Customer";
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, index: true },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    phone: { type: String, default: "" },
    memberSince: { type: String, default: "September 2026" },
    loyaltyTier: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum"],
      default: "Bronze",
    },
    loyaltyPoints: { type: Number, default: 0 },
    role: { type: String, enum: ["Admin", "Customer"], default: "Customer" },
    avatarUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
