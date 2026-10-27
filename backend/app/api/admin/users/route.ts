import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin";
import { Order } from "@/models/Order";
import { User } from "@/models/User";

const ROOT_ADMIN_EMAIL = "roadgrip@admin.lk";

export async function GET(req: Request) {
  try {
    if (!(await requireAdmin(req))) return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    await connectToDatabase();
    const [users, orderTotals] = await Promise.all([
      User.find().sort({ createdAt: -1 }).lean(),
      Order.aggregate([
        { $group: { _id: "$userId", orders: { $sum: 1 }, totalSpent: { $sum: "$total" } } },
      ]),
    ]);
    const totalsByUser = new Map(orderTotals.map((entry) => [entry._id, entry]));
    return NextResponse.json(users.map((user) => ({
      id: user.firebaseUid,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      memberSince: user.memberSince,
      loyaltyPoints: user.loyaltyPoints,
      role: user.email.toLowerCase() === ROOT_ADMIN_EMAIL ? "Admin" : user.role || "Customer",
      orders: totalsByUser.get(user.firebaseUid)?.orders || 0,
      totalSpent: totalsByUser.get(user.firebaseUid)?.totalSpent || 0,
    })));
  } catch (error) {
    console.error("Could not load admin users:", error);
    return NextResponse.json({ message: "Could not load users" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    const body = await req.json();
    if (typeof body.userId !== "string" || !["Admin", "Customer"].includes(body.role)) {
      return NextResponse.json({ message: "A valid user ID and role are required" }, { status: 400 });
    }
    if (body.userId === admin.uid) return NextResponse.json({ message: "You cannot change your own role" }, { status: 400 });

    await connectToDatabase();
    const target = await User.findOne({ firebaseUid: body.userId }).select("email").lean();
    if (!target) return NextResponse.json({ message: "User not found" }, { status: 404 });
    if (target.email.toLowerCase() === ROOT_ADMIN_EMAIL) {
      return NextResponse.json({ message: "The primary admin role cannot be changed" }, { status: 400 });
    }
    const user = await User.findOneAndUpdate(
      { firebaseUid: body.userId },
      { role: body.role },
      { new: true, runValidators: true }
    ).select("firebaseUid role").lean();
    return NextResponse.json({ id: user?.firebaseUid, role: user?.role });
  } catch (error) {
    console.error("Could not update admin user:", error);
    return NextResponse.json({ message: "Could not update user role" }, { status: 500 });
  }
}
