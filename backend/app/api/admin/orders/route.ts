import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin";
import { Order } from "@/models/Order";
import { User } from "@/models/User";

const ORDER_STATUSES = ["Pending Payment", "Processing", "In Transit", "Delivered", "Cancelled"] as const;

export async function GET(req: Request) {
  try {
    if (!(await requireAdmin(req))) return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    await connectToDatabase();
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    const users = await User.find({ firebaseUid: { $in: [...new Set(orders.map((order) => order.userId))] } })
      .select("firebaseUid firstName lastName email")
      .lean();
    const usersById = new Map(users.map((user) => [user.firebaseUid, user]));

    return NextResponse.json(orders.map((order) => {
      const user = usersById.get(order.userId);
      return {
        id: order.orderId,
        date: order.date,
        status: order.status,
        paymentStatus: order.paymentStatus,
        items: order.items,
        itemSummary: order.itemSummary,
        subtotal: order.subtotal,
        delivery: order.delivery,
        total: order.total,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber,
        customerName: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Customer",
        customerEmail: user?.email || "",
      };
    }));
  } catch (error) {
    console.error("Could not load admin orders:", error);
    return NextResponse.json({ message: "Could not load orders" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    if (!(await requireAdmin(req))) return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    const body = await req.json();
    if (typeof body.id !== "string" || !ORDER_STATUSES.includes(body.status)) {
      return NextResponse.json({ message: "A valid order ID and status are required" }, { status: 400 });
    }

    await connectToDatabase();
    const order = await Order.findOneAndUpdate(
      { orderId: body.id },
      { status: body.status },
      { new: true, runValidators: true }
    ).lean();
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
    return NextResponse.json({ id: order.orderId, status: order.status });
  } catch (error) {
    console.error("Could not update admin order:", error);
    return NextResponse.json({ message: "Could not update order" }, { status: 500 });
  }
}
