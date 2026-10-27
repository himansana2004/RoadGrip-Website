import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuthToken } from "@/lib/firebase-admin";
import { createPayHereCheckoutHash, getPayHereCredentials, PAYHERE_CURRENCY } from "@/lib/payhere";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

const SANDBOX_CHECKOUT_URL = "https://sandbox.payhere.lk/pay/checkout";

export async function POST(req: Request) {
  try {
    const authUser = await verifyAuthToken(req);
    if (!authUser) return NextResponse.json({ message: "Sign in before placing an order." }, { status: 401 });

    const body = await req.json();
    const items = body.items as { productId: number; quantity: number }[];
    const shipping = body.shipping;
    if (!Array.isArray(items) || items.length === 0 || !shipping) {
      return NextResponse.json({ message: "Your cart or shipping details are incomplete." }, { status: 400 });
    }
    if (!shipping.firstName || !shipping.lastName || !shipping.email || !shipping.phone || !shipping.address || !shipping.city || !shipping.country) {
      return NextResponse.json({ message: "Complete all required shipping details." }, { status: 400 });
    }
    if (items.some((item) => !Number.isInteger(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20)) {
      return NextResponse.json({ message: "One or more cart quantities are invalid." }, { status: 400 });
    }

    await connectToDatabase();
    const products = await Product.find({ id: { $in: items.map((item) => item.productId) } }).lean();
    if (products.length !== items.length) {
      return NextResponse.json({ message: "A product in your cart is no longer available." }, { status: 400 });
    }
    const productById = new Map(products.map((product) => [product.id, product]));
    for (const item of items) {
      const product = productById.get(item.productId);
      if (!product || product.stock < item.quantity) {
        return NextResponse.json({ message: "A product in your cart does not have enough stock." }, { status: 400 });
      }
    }

    const subtotal = items.reduce((sum, item) => sum + productById.get(item.productId)!.price * item.quantity, 0);
    const delivery = subtotal >= 150 ? 0 : 9.99;
    const total = Number((subtotal + delivery).toFixed(2));
    const orderId = `RG-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
    const amount = total.toFixed(2);
    const { merchantId, merchantSecret } = getPayHereCredentials();
    const appUrl = process.env.APP_URL?.replace(/\/$/, "");
    const notifyUrl = process.env.PAYHERE_NOTIFY_URL;
    if (!appUrl || !notifyUrl) {
      return NextResponse.json({ message: "Set APP_URL and PAYHERE_NOTIFY_URL in the backend environment." }, { status: 503 });
    }

    const orderItems = items.map((item) => {
      const product = productById.get(item.productId)!;
      return {
        name: product.name,
        brand: product.brand,
        size: product.size,
        quantity: item.quantity,
        price: product.price,
        imageUrl: product.image,
      };
    });
    const shippingAddress = `${shipping.address}, ${shipping.city}, ${shipping.postcode || ""}, ${shipping.country}`;
    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

    await Order.create({
      orderId,
      userId: authUser.uid,
      date,
      status: "Pending Payment",
      paymentStatus: "Pending",
      items: orderItems,
      itemSummary: orderItems.map((item) => `${item.name} ×${item.quantity}`).join(", "),
      subtotal,
      delivery,
      total,
      shippingAddress,
      paymentMethod: "PayHere Sandbox",
      trackingNumber: "",
      carrier: "RoadGrip Express Logistics",
      estimatedDelivery: "Expected in 1–2 business days",
    });

    const fields: Record<string, string> = {
      sandbox: "true",
      merchant_id: merchantId,
      return_url: `${appUrl}/checkout?payment=return&order_id=${encodeURIComponent(orderId)}`,
      cancel_url: `${appUrl}/checkout?payment=cancel&order_id=${encodeURIComponent(orderId)}`,
      notify_url: notifyUrl,
      order_id: orderId,
      items: orderItems.map((item) => `${item.name} x ${item.quantity}`).join(", "),
      currency: PAYHERE_CURRENCY,
      amount,
      first_name: shipping.firstName,
      last_name: shipping.lastName,
      email: shipping.email,
      phone: shipping.phone,
      address: shipping.address,
      city: shipping.city,
      country: shipping.country,
      delivery_address: shipping.address,
      delivery_city: shipping.city,
      delivery_country: shipping.country,
      hash: createPayHereCheckoutHash(merchantId, merchantSecret, orderId, amount, PAYHERE_CURRENCY),
    };

    return NextResponse.json({ action: SANDBOX_CHECKOUT_URL, fields, orderId });
  } catch (error) {
    console.error("Could not create PayHere checkout:", error);
    const message = error instanceof Error ? error.message : "Could not start payment.";
    return NextResponse.json({ message }, { status: 500 });
  }
}