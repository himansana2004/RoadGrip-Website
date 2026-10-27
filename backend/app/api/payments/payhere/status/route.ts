import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuthToken } from "@/lib/firebase-admin";
import { Order } from "@/models/Order";

export async function GET(req: Request) {
  try {
    const authUser = await verifyAuthToken(req);
    if (!authUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const orderId = new URL(req.url).searchParams.get("order_id");
    if (!orderId) return NextResponse.json({ message: "Order ID is required." }, { status: 400 });

    await connectToDatabase();
    const order = await Order.findOne({ orderId, userId: authUser.uid }).select("paymentStatus").lean();
    if (!order) return NextResponse.json({ message: "Order not found." }, { status: 404 });
    return NextResponse.json({ status: order.paymentStatus || "Pending" });
  } catch (error) {
    console.error("Could not retrieve PayHere payment status:", error);
    return NextResponse.json({ message: "Could not retrieve payment status." }, { status: 500 });
  }
}