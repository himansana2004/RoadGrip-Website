import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuthToken } from "@/lib/firebase-admin";
import { User } from "@/models/User";

export async function GET(req: Request) {
  try {
    const authUser = await verifyAuthToken(req);
    const { searchParams } = new URL(req.url);
    const uid = authUser?.uid || searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const userDoc = await User.findOne({ firebaseUid: uid }).lean();

    if (!userDoc) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      email: userDoc.email,
      phone: userDoc.phone,
      memberSince: userDoc.memberSince,
      loyaltyTier: userDoc.loyaltyTier,
      loyaltyPoints: userDoc.loyaltyPoints,
      avatarUrl: userDoc.avatarUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authUser = await verifyAuthToken(req);
    const body = await req.json();
    const uid = authUser?.uid || body.firebaseUid;

    if (!uid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const allowedUpdates: Record<string, any> = {};
    if (body.firstName !== undefined) allowedUpdates.firstName = body.firstName;
    if (body.lastName !== undefined) allowedUpdates.lastName = body.lastName;
    if (body.phone !== undefined) allowedUpdates.phone = body.phone;
    if (body.avatarUrl !== undefined) allowedUpdates.avatarUrl = body.avatarUrl;

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { $set: allowedUpdates },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      memberSince: updatedUser.memberSince,
      loyaltyTier: updatedUser.loyaltyTier,
      loyaltyPoints: updatedUser.loyaltyPoints,
      avatarUrl: updatedUser.avatarUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
