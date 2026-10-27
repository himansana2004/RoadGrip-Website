import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let isInitialized = false;

function initFirebaseAdmin() {
  if (isInitialized || getApps().length > 0) {
    isInitialized = true;
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    try {
      privateKey = privateKey.replace(/\\n/g, "\n");

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      isInitialized = true;
      console.log("Firebase Admin initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize Firebase Admin:", error);
    }
  } else {
    console.warn(
      "[DEV NOTICE] Firebase Admin credentials not configured in environment. Running in development token mode."
    );
  }
}

export interface DecodedAuthUser {
  uid: string;
  email: string;
  name?: string;
}

export async function verifyAuthToken(req: Request): Promise<DecodedAuthUser | null> {
  initFirebaseAdmin();

  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split("Bearer ")[1]?.trim();
  if (!token) return null;

  // 1. If Firebase Admin is initialized, verify cryptographically
  if (getApps().length > 0) {
    try {
      const decoded = await getAuth().verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email || "",
        name: decoded.name,
      };
    } catch (err) {
      console.error("Firebase token verification failed:", err);
      return null;
    }
  }

  // 2. Development fallback: parse JWT payload without signature verification if admin keys not yet configured
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
      return {
        uid: payload.user_id || payload.sub || "demo-uid",
        email: payload.email || "user@example.com",
        name: payload.name,
      };
    }
  } catch (parseErr) {
    console.warn("Could not parse token in dev mode:", parseErr);
  }

  return null;
}
