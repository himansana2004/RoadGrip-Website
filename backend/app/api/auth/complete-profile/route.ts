import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuthToken } from "@/lib/firebase-admin";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const authUser = await verifyAuthToken(req);
    const body = await req.json().catch(() => ({}));

    const firebaseUid = authUser?.uid || body.firebaseUid;

    if (!firebaseUid) {
      return NextResponse.json(
        { message: "Unauthorized: missing Firebase UID" },
        { status: 401 }
      );
    }

    const { firstName, lastName, phone } = body as {
      firstName?: string;
      lastName?: string;
      phone?: string;
    };

    if (!phone || phone.trim() === "") {
      return NextResponse.json(
        { message: "Phone number is required to complete your profile." },
        { status: 400 }
      );
    }

    await connectToDatabase().catch((err) => {
      console.warn("MongoDB connection warning in complete-profile:", err.message);
    });

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid },
      {
        $set: {
          ...(firstName && { firstName: firstName.trim() }),
          ...(lastName !== undefined && { lastName: lastName.trim() }),
          phone: phone.trim(),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found. Please sign in again." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        memberSince: updatedUser.memberSince,
        loyaltyTier: updatedUser.loyaltyTier,
        loyaltyPoints: updatedUser.loyaltyPoints,
        avatarUrl: updatedUser.avatarUrl,
      },
    });
  } catch (error: any) {
    console.error("Error in complete-profile route:", error);
    return NextResponse.json(
      { message: error.message || "Failed to complete profile" },
      { status: 500 }
    );
  }
}
