import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuthToken } from "@/lib/firebase-admin";
import { LoginLog } from "@/models/LoginLog";

export async function GET(req: Request) {
  try {
    const authUser = await verifyAuthToken(req);
    const { searchParams } = new URL(req.url);
    const uid = authUser?.uid || searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase().catch((err) => {
      console.warn("MongoDB warning in login-history:", err.message);
    });

    const logs = await LoginLog.find({ firebaseUid: uid })
      .sort({ loginTime: -1 })
      .limit(10)
      .lean();

    return NextResponse.json(
      logs.map((log: any) => ({
        id: log._id.toString(),
        loginTime: log.loginTime.toISOString(),
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        provider: log.provider,
        status: log.status,
      }))
    );
  } catch (error: any) {
    console.error("Error in login-history:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
