import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILoginLog extends Document {
  firebaseUid: string;
  email: string;
  loginTime: Date;
  ipAddress: string;
  userAgent: string;
  provider: string; // 'password' | 'google.com' | 'demo'
  status: "success" | "failed";
  createdAt: Date;
}

const LoginLogSchema = new Schema<ILoginLog>(
  {
    firebaseUid: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    loginTime: { type: Date, default: Date.now },
    ipAddress: { type: String, default: "127.0.0.1" },
    userAgent: { type: String, default: "Web Browser" },
    provider: { type: String, default: "password" },
    status: { type: String, enum: ["success", "failed"], default: "success" },
  },
  { timestamps: true }
);

export const LoginLog: Model<ILoginLog> =
  mongoose.models.LoginLog || mongoose.model<ILoginLog>("LoginLog", LoginLogSchema);
