import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuthToken } from "@/lib/firebase-admin";
import { Order } from "@/models/Order";
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
    const orders = await Order.find({ userId: uid }).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      orders.map((o: any) => ({
        id: o.orderId,
        date: o.date,
        status: o.status,
        paymentStatus: o.paymentStatus || "Not Required",
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

    const orderId = body.id || `RG-2026-${Math.floor(Math.random() * 90000 + 10000)}`;

    const newOrder = await Order.create({
      orderId,
      userId: uid,
      date: body.date || new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      status: body.status || "Processing",
      paymentStatus: body.paymentStatus || "Not Required",
      items: body.items || [],
      itemSummary: body.itemSummary || "",
      subtotal: body.subtotal,
      delivery: body.delivery || 0,
      total: body.total,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod || "Credit Card",
      trackingNumber: body.trackingNumber || `RG-TRK-${Math.floor(Math.random() * 9000000 + 1000000)}`,
      carrier: body.carrier || "RoadGrip Express Logistics",
      estimatedDelivery: body.estimatedDelivery || "Expected in 1–2 business days",
    });

    // Reward points for order
    try {
      await User.findOneAndUpdate(
        { firebaseUid: uid },
        { $inc: { loyaltyPoints: Math.floor(body.total || 0) } }
      );
    } catch (ptsErr) {
      console.warn("Could not award points:", ptsErr);
    }

    return NextResponse.json({
      id: newOrder.orderId,
      date: newOrder.date,
      status: newOrder.status,
      paymentStatus: newOrder.paymentStatus,
      items: newOrder.items,
      itemSummary: newOrder.itemSummary,
      subtotal: newOrder.subtotal,
      delivery: newOrder.delivery,
      total: newOrder.total,
      shippingAddress: newOrder.shippingAddress,
      paymentMethod: newOrder.paymentMethod,
      trackingNumber: newOrder.trackingNumber,
      carrier: newOrder.carrier,
      estimatedDelivery: newOrder.estimatedDelivery,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
