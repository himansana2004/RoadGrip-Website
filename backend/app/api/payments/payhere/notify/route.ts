import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getPayHereCredentials, getPayHereStatus, PAYHERE_CURRENCY, verifyPayHereNotification } from "@/lib/payhere";
import { Order } from "@/models/Order";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const fields = {
      merchant_id: String(form.get("merchant_id") || ""),
      order_id: String(form.get("order_id") || ""),
      payhere_amount: String(form.get("payhere_amount") || ""),
      payhere_currency: String(form.get("payhere_currency") || ""),
      status_code: String(form.get("status_code") || ""),
      md5sig: String(form.get("md5sig") || ""),
    };
    const { merchantId, merchantSecret } = getPayHereCredentials();
    if (fields.merchant_id !== merchantId || fields.payhere_currency !== PAYHERE_CURRENCY ||
      !verifyPayHereNotification(fields, merchantSecret)) {
      return NextResponse.json({ message: "Invalid PayHere notification." }, { status: 400 });
    }

    await connectToDatabase();
    const order = await Order.findOne({ orderId: fields.order_id });
    if (!order || order.total.toFixed(2) !== Number(fields.payhere_amount).toFixed(2)) {
      return NextResponse.json({ message: "Payment does not match an order." }, { status: 400 });
    }

    const paymentStatus = getPayHereStatus(fields.status_code);
    const wasPaid = order.paymentStatus === "Paid";
    if (wasPaid && paymentStatus !== "Paid" && paymentStatus !== "ChargedBack") {
      return new NextResponse("OK", { status: 200 });
    }
    order.paymentStatus = paymentStatus;
    if (paymentStatus === "Paid") order.status = "Processing";
    if (paymentStatus === "Cancelled" || paymentStatus === "Failed") order.status = "Cancelled";
    await order.save();

    if (paymentStatus === "Paid" && !wasPaid) {
      await User.findOneAndUpdate(
        { firebaseUid: order.userId },
        { $inc: { loyaltyPoints: Math.floor(order.total) } }
      );
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Could not process PayHere notification:", error);
    return NextResponse.json({ message: "Could not process PayHere notification." }, { status: 500 });
  }
}