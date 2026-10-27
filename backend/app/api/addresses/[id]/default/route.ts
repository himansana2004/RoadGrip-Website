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
    const { searchParams } = new URL(req.url);
    const uid = authUser?.uid || searchParams.get("uid");

    await connectToDatabase();

    const targetAddress = await Address.findById(id);
    if (!targetAddress) {
      return NextResponse.json({ message: "Address not found" }, { status: 404 });
    }

    const userId = uid || targetAddress.userId;

    // Reset all addresses for this user to isDefault: false
    await Address.updateMany({ userId }, { isDefault: false });

    // Set target address to isDefault: true
    targetAddress.isDefault = true;
    await targetAddress.save();

    return NextResponse.json({ success: true, id: targetAddress._id.toString() });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
