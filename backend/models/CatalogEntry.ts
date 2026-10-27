import mongoose, { Schema, Document, Model } from "mongoose";

export type CatalogKind = "brand" | "category";

export interface ICatalogEntry extends Document {
  kind: CatalogKind;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const CatalogEntrySchema = new Schema<ICatalogEntry>(
  {
    kind: { type: String, enum: ["brand", "category"], required: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

CatalogEntrySchema.index({ kind: 1, name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export const CatalogEntry: Model<ICatalogEntry> =
  mongoose.models.CatalogEntry || mongoose.model<ICatalogEntry>("CatalogEntry", CatalogEntrySchema);
