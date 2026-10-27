import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type Auth,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.length > 5 &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (err) {
    console.warn("Failed to initialize Firebase app:", err);
  }
}

export { auth };

export async function registerWithEmail(email: string, pass: string, displayName?: string, phone?: string) {
  if (!auth) throw new Error("Firebase is not configured. Please add your credentials in .env");
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  // If phone was provided, store it via backend (Firebase Auth email/password doesn't hold phone natively)
  if (phone && userCredential.user) {
    try {
      const token = await userCredential.user.getIdToken();
      const nameParts = (displayName || "").trim().split(" ");
      await fetch("/api/auth/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firebaseUid: userCredential.user.uid,
          email,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          phone,
          provider: "password",
        }),
      });
    } catch (syncErr) {
      console.warn("Could not sync phone to MongoDB after registration:", syncErr);
    }
  }
  return userCredential.user;
}

export async function loginWithEmail(email: string, pass: string) {
  if (!auth) throw new Error("Firebase is not configured. Please add your credentials in .env");
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
}

export async function loginWithGoogle() {
  if (!auth) throw new Error("Firebase is not configured. Please add your credentials in .env");
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logoutUser() {
  if (!auth) return;
  await signOut(auth);
}

export async function resetPassword(email: string) {
  if (!auth) throw new Error("Firebase is not configured. Please add your credentials in .env");
  await sendPasswordResetEmail(auth, email);
}

export async function getFirebaseToken(): Promise<string | null> {
  if (!auth || !auth.currentUser) return null;
  return await auth.currentUser.getIdToken();
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
