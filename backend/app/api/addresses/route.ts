import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuthToken } from "@/lib/firebase-admin";
import { Address } from "@/models/Address";

export async function GET(req: Request) {
  try {
    const authUser = await verifyAuthToken(req);
    const { searchParams } = new URL(req.url);
    const uid = authUser?.uid || searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const addresses = await Address.find({ userId: uid }).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      addresses.map((a: any) => ({
        id: a._id.toString(),
        label: a.label,
        fullName: a.fullName,
        phone: a.phone,
        street: a.street,
        city: a.city,
        postcode: a.postcode,
        country: a.country,
        isDefault: a.isDefault,
        notes: a.notes,
      }))
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authUser = await verifyAuthToken(req);
    const body = await req.json();
    const uid = authUser?.uid || body.userId;

    if (!uid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // If new address is default, reset others
    if (body.isDefault) {
      await Address.updateMany({ userId: uid }, { isDefault: false });
    }

    const newAddress = await Address.create({
      userId: uid,
      label: body.label || "Home",
      fullName: body.fullName,
      phone: body.phone,
      street: body.street,
      city: body.city,
      postcode: body.postcode,
      country: body.country || "United Kingdom",
      isDefault: Boolean(body.isDefault),
      notes: body.notes || "",
    });

    return NextResponse.json({
      id: newAddress._id.toString(),
      label: newAddress.label,
      fullName: newAddress.fullName,
      phone: newAddress.phone,
      street: newAddress.street,
      city: newAddress.city,
      postcode: newAddress.postcode,
      country: newAddress.country,
      isDefault: newAddress.isDefault,
      notes: newAddress.notes,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
