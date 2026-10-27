import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuthToken } from "@/lib/firebase-admin";
import { Address } from "@/models/Address";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await verifyAuthToken(req);
    const body = await req.json();
    const uid = authUser?.uid || body.userId;

    await connectToDatabase();

    if (body.isDefault && uid) {
      await Address.updateMany({ userId: uid }, { isDefault: false });
    }

    const updated = await Address.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ message: "Address not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: (updated as any)._id.toString(),
      label: (updated as any).label,
      fullName: (updated as any).fullName,
      phone: (updated as any).phone,
      street: (updated as any).street,
      city: (updated as any).city,
      postcode: (updated as any).postcode,
      country: (updated as any).country,
      isDefault: (updated as any).isDefault,
      notes: (updated as any).notes,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    await Address.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
