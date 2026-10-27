import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuthToken, type DecodedAuthUser } from "@/lib/firebase-admin";
import { User } from "@/models/User";

const ROOT_ADMIN_EMAIL = "roadgrip@admin.lk";

export async function requireAdmin(req: Request): Promise<DecodedAuthUser | null> {
  const authUser = await verifyAuthToken(req);
  if (!authUser) return null;
  if (authUser.email.toLowerCase() === ROOT_ADMIN_EMAIL) return authUser;

  await connectToDatabase();
  const user = await User.findOne({ firebaseUid: authUser.uid }).select("role").lean();
  return user?.role === "Admin" ? authUser : null;
}
