import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin";
import { CatalogEntry, type CatalogKind } from "@/models/CatalogEntry";
import { Product } from "@/models/Product";

function getKind(value: string | null): CatalogKind | null {
  return value === "brand" || value === "category" ? value : null;
}

export async function GET(req: Request) {
  try {
    if (!(await requireAdmin(req))) return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    const kind = getKind(new URL(req.url).searchParams.get("kind"));
    if (!kind) return NextResponse.json({ message: "A valid catalog kind is required" }, { status: 400 });
    await connectToDatabase();

    const field = kind === "brand" ? "brand" : "category";
    const [productValues, savedValues] = await Promise.all([
      Product.distinct(field),
      CatalogEntry.find({ kind }).select("name").collation({ locale: "en", strength: 2 }).lean(),
    ]);
    const values = new Map<string, string>();
    [...productValues, ...savedValues.map((entry) => entry.name)].forEach((value) => {
      const name = String(value || "").trim();
      if (name && !values.has(name.toLowerCase())) values.set(name.toLowerCase(), name);
    });
    return NextResponse.json([...values.values()].sort((a, b) => a.localeCompare(b)));
  } catch (error) {
    console.error("Could not load admin catalog:", error);
    return NextResponse.json({ message: "Could not load catalog" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await requireAdmin(req))) return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    const body = await req.json();
    const kind = getKind(body.kind);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!kind || !name || name.length > 80) {
      return NextResponse.json({ message: "A valid catalog kind and name (1-80 characters) are required" }, { status: 400 });
    }
    await connectToDatabase();
    await CatalogEntry.create({ kind, name });
    return NextResponse.json({ name }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return NextResponse.json({ message: "That entry already exists" }, { status: 409 });
    }
    console.error("Could not create admin catalog entry:", error);
    return NextResponse.json({ message: "Could not create catalog entry" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    if (!(await requireAdmin(req))) return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    const body = await req.json();
    const kind = getKind(body.kind);
    const oldName = typeof body.oldName === "string" ? body.oldName.trim() : "";
    const newName = typeof body.newName === "string" ? body.newName.trim() : "";
    if (!kind || !oldName || !newName || newName.length > 80) {
      return NextResponse.json({ message: "A valid catalog kind and names are required" }, { status: 400 });
    }
    await connectToDatabase();
    const field = kind === "brand" ? "brand" : "category";
    await CatalogEntry.findOneAndUpdate(
      { kind, name: oldName },
      { $set: { name: newName } },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true, collation: { locale: "en", strength: 2 } }
    );
    await Product.updateMany({ [field]: oldName }, { $set: { [field]: newName } }).collation({ locale: "en", strength: 2 });
    return NextResponse.json({ oldName, name: newName });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return NextResponse.json({ message: "That entry already exists" }, { status: 409 });
    }
    console.error("Could not rename admin catalog entry:", error);
    return NextResponse.json({ message: "Could not rename catalog entry" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await requireAdmin(req))) return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    const url = new URL(req.url);
    const kind = getKind(url.searchParams.get("kind"));
    const name = url.searchParams.get("name")?.trim();
    if (!kind || !name) return NextResponse.json({ message: "A valid catalog kind and name are required" }, { status: 400 });
    await connectToDatabase();
    const field = kind === "brand" ? "brand" : "category";
    if (await Product.exists({ [field]: name }).collation({ locale: "en", strength: 2 })) {
      return NextResponse.json({ message: "This entry is used by products. Reassign those products before deleting it." }, { status: 409 });
    }
    await CatalogEntry.deleteOne({ kind, name }).collation({ locale: "en", strength: 2 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Could not delete admin catalog entry:", error);
    return NextResponse.json({ message: "Could not delete catalog entry" }, { status: 500 });
  }
}
