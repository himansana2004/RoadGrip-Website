import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin";
import { Product } from "@/models/Product";

function toClientProduct(product: any) {
  const { _id, __v, createdAt, updatedAt, isNewProduct, ...data } = product;
  return { ...data, isNew: isNewProduct };
}

export async function GET(req: Request) {
  try {
    const isAdmin = Boolean(await requireAdmin(req));
    await connectToDatabase();
    const products = await Product.find(isAdmin ? {} : { stock: { $gt: 0 } }).sort({ id: 1 }).lean();
    return NextResponse.json(products.map(toClientProduct));
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await requireAdmin(req))) return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    const body = await req.json();
    await connectToDatabase();
    const last = await Product.findOne().sort({ id: -1 }).lean();
    const product = await Product.create({ ...body, id: (last?.id || 0) + 1, isNewProduct: Boolean(body.isNew) });
    return NextResponse.json(toClientProduct(product.toObject()), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await requireAdmin(req))) return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    const body = await req.json();
    const id = Number(body.id);
    delete body.id;
    await connectToDatabase();
    const product = await Product.findOneAndUpdate(
      { id },
      { ...body, isNewProduct: Boolean(body.isNew) },
      { new: true, runValidators: true }
    ).lean();
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    return NextResponse.json(toClientProduct(product));
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await requireAdmin(req))) return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    const id = Number(new URL(req.url).searchParams.get("id"));
    await connectToDatabase();
    const result = await Product.deleteOne({ id });
    if (!result.deletedCount) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
