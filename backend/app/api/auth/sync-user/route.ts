import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuthToken } from "@/lib/firebase-admin";
import { User } from "@/models/User";
import { LoginLog } from "@/models/LoginLog";
import { Address } from "@/models/Address";
import { Order } from "@/models/Order";

export async function POST(req: Request) {
  try {
    const authUser = await verifyAuthToken(req);
    const body = await req.json().catch(() => ({}));

    const firebaseUid = authUser?.uid || body.firebaseUid;
    const email = authUser?.email || body.email;

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { message: "Missing firebaseUid or email in authorization or payload" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToDatabase().catch((err) => {
      console.warn("MongoDB connection warning in sync-user:", err.message);
    });

    // 1. Record Login Audit Log in MongoDB
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Web Browser";
    const provider = body.provider || "password";

    try {
      await LoginLog.create({
        firebaseUid,
        email,
        loginTime: new Date(),
        ipAddress,
        userAgent,
        provider,
        status: "success",
      });
    } catch (logErr) {
      console.warn("Could not write login log to MongoDB:", logErr);
    }

    // 2. Find or Create User in MongoDB
    let userDoc = await User.findOne({ firebaseUid });
    let isNewUser = false;

    if (!userDoc) {
      isNewUser = true;

      // Parse name from Firebase displayName or request body
      const displayName = authUser?.name || "";
      const nameParts = displayName.trim().split(" ");
      const firstName = body.firstName || nameParts[0] || "";
      const lastName = body.lastName || nameParts.slice(1).join(" ") || "";

      // Determine the current month/year for memberSince
      const now = new Date();
      const memberSince = now.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      });

      userDoc = await User.create({
        firebaseUid,
        email,
        firstName,
        lastName,
        phone: body.phone || "",
        memberSince,
        loyaltyTier: "Bronze",
        loyaltyPoints: 0,
      });
    }

    // 3. Determine if user still needs to complete their profile (onboarding)
    const needsOnboarding =
      !userDoc.phone ||
      userDoc.phone.trim() === "" ||
      !userDoc.firstName ||
      userDoc.firstName.trim() === "";

    // 4. Fetch User's Addresses and Orders from MongoDB
    const addresses = await Address.find({ userId: firebaseUid }).sort({ isDefault: -1, createdAt: -1 }).lean();
    const orders = await Order.find({ userId: firebaseUid }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      isNewUser,
      needsOnboarding,
      user: {
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        email: userDoc.email,
        phone: userDoc.phone,
        role: userDoc.email.toLowerCase() === "roadgrip@admin.lk" ? "Admin" : userDoc.role || "Customer",
        memberSince: userDoc.memberSince,
        loyaltyTier: userDoc.loyaltyTier,
        loyaltyPoints: userDoc.loyaltyPoints,
        avatarUrl: userDoc.avatarUrl,
      },
      addresses: addresses.map((a: any) => ({
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
      })),
      orders: orders.map((o: any) => ({
        id: o.orderId,
        date: o.date,
        status: o.status,
        items: o.items,
        itemSummary: o.itemSummary,
        subtotal: o.subtotal,
        delivery: o.delivery,
        total: o.total,
        shippingAddress: o.shippingAddress,
        paymentMethod: o.paymentMethod,
        trackingNumber: o.trackingNumber,
        carrier: o.carrier,
        estimatedDelivery: o.estimatedDelivery,
      })),
    });
  } catch (error: any) {
    console.error("Error in sync-user route:", error);
    return NextResponse.json(
      { message: error.message || "Failed to sync user" },
      { status: 500 }
    );
  }
}
