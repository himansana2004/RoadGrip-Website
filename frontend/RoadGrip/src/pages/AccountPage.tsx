import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import type { AccountTab, UserAddress, UserOrder } from "../context/AppContext";
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  resetPassword,
  isFirebaseConfigured,
} from "../lib/firebase";
import {
  User,
  Package,
  MapPin,
  Settings,
  Check,
  ChevronRight,
  Trash,
  Plus,
  Lock,
  Eye,
  EyeOff,
  Bell,
  RefreshCw,
  Search,
  CheckCircle,
  Truck,
  CreditCard,
  X,
  Phone,
  Mail,
  Edit,
  Shield,
} from "../components/Icons";

const STATUS_STYLES: Record<string, string> = {
  Delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  "In Transit": "bg-amber-100 text-amber-800 border-amber-200",
  "Pending Payment": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Processing: "bg-blue-100 text-blue-800 border-blue-200",
  Cancelled: "bg-rose-100 text-rose-800 border-rose-200",
};

interface Toast {
  id: number;
  message: string;
  type?: "success" | "info" | "error";
}

export default function AccountPage() {
  const {
    isLoggedIn,
    login,
    logout,
    user,
    updateUserProfile,
    changePassword,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    orders,
    accountTab,
    setAccountTab,
    addToCart,
    products,
    navigate,
    loginHistory,
    fetchLoginHistory,
    needsOnboarding,
    onboardingPreFill,
    completeOnboarding,
  } = useApp();

  // Auth View State
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ firstName: "", lastName: "", phone: "", email: "", password: "", confirm: "" });

  // Google Onboarding Modal State
  const [onboardingForm, setOnboardingForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  // Sync onboarding pre-fill when needsOnboarding becomes true
  useEffect(() => {
    if (needsOnboarding) {
      setOnboardingForm({
        firstName: onboardingPreFill.firstName,
        lastName: onboardingPreFill.lastName,
        phone: "",
      });
    }
  }, [needsOnboarding, onboardingPreFill]);
  const [authLoading, setAuthLoading] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(message: string, type: "success" | "info" | "error" = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }

  // Account Settings Form State
  const [nameForm, setNameForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
  });

  const [phoneForm, setPhoneForm] = useState({
    phone: user.phone,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    smsShipping: true,
    maintenanceAlerts: false,
    promotions: true,
  });

  // Orders State
  const [orderFilter, setOrderFilter] = useState<"All" | "In Transit" | "Delivered" | "Cancelled">("All");
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<UserOrder | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<UserOrder | null>(null);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<UserAddress, "id">>({
    label: "Home",
    fullName: `${user.firstName} ${user.lastName}`,
    phone: user.phone,
    street: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
    isDefault: false,
    notes: "",
  });

  // Address Delete Confirmation State
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  // Sync initial user details into form
  useEffect(() => {
    setNameForm({ firstName: user.firstName, lastName: user.lastName });
    setPhoneForm({ phone: user.phone });
  }, [user]);

  // Fetch MongoDB login audit history when switching to settings tab
  useEffect(() => {
    if (accountTab === "settings" && isLoggedIn) {
      fetchLoginHistory();
    }
  }, [accountTab, isLoggedIn]);

  // ----------------------------------------------------
  // Firebase Auth Handlers
  // ----------------------------------------------------
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);

    if (!isFirebaseConfigured) {
      // Demo / fallback mode when Firebase credentials not yet populated in .env
      await login(loginData.email, "John Smith");
      showToast("Signed in as John Smith (Local & MongoDB Demo Mode)");
      setAuthLoading(false);
      return;
    }

    try {
      await loginWithEmail(loginData.email, loginData.password);
      showToast("Signed in with Firebase successfully!");
    } catch (err: any) {
      showToast(err.message || "Login failed. Please check credentials.", "error");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleEmailRegister(e: React.FormEvent) {
    e.preventDefault();
    if (registerData.password !== registerData.confirm) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (!registerData.phone.trim()) {
      showToast("Phone number is required", "error");
      return;
    }

    setAuthLoading(true);

    if (!isFirebaseConfigured) {
      await login(registerData.email, `${registerData.firstName} ${registerData.lastName}`, registerData.phone);
      showToast("Account created (Demo Mode — add Firebase keys to connect)!");
      setAuthLoading(false);
      return;
    }

    try {
      await registerWithEmail(
        registerData.email,
        registerData.password,
        `${registerData.firstName} ${registerData.lastName}`,
        registerData.phone
      );
      showToast("Account created! Welcome to RoadGrip.");
    } catch (err: any) {
      showToast(err.message || "Registration failed.", "error");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleCompleteOnboarding(e: React.FormEvent) {
    e.preventDefault();
    if (!onboardingForm.phone.trim()) {
      showToast("Phone number is required", "error");
      return;
    }
    setOnboardingLoading(true);
    try {
      await completeOnboarding({
        firstName: onboardingForm.firstName,
        lastName: onboardingForm.lastName,
        phone: onboardingForm.phone,
      });
      showToast("Profile complete! Welcome to RoadGrip.");
    } catch (err: any) {
      showToast(err.message || "Failed to save profile. Please try again.", "error");
    } finally {
      setOnboardingLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setAuthLoading(true);
    if (!isFirebaseConfigured) {
      await login("john.google@example.com", "John Smith");
      showToast("Signed in with Google (Demo Mode)");
      setAuthLoading(false);
      return;
    }

    try {
      await loginWithGoogle();
      showToast("Signed in with Google Firebase Auth!");
    } catch (err: any) {
      showToast(err.message || "Google sign in was cancelled or failed.", "error");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSendPasswordReset(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotLoading(true);
    if (!isFirebaseConfigured) {
      showToast(`Password reset link simulated for ${forgotEmail}`);
      setIsForgotModalOpen(false);
      setForgotLoading(false);
      return;
    }

    try {
      await resetPassword(forgotEmail);
      showToast(`Password reset email sent to ${forgotEmail}`);
      setIsForgotModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "Could not send password reset email.", "error");
    } finally {
      setForgotLoading(false);
    }
  }

  // ----------------------------------------------------
  // Logged-out Screen: Login / Register Form
  // ----------------------------------------------------
  // Google onboarding modal (shown when new Google user has no phone)
  if (isLoggedIn && needsOnboarding) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-brand-black via-gray-900 to-gray-800 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-red to-rose-600 p-6 text-white">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3">
              <User size={24} />
            </div>
            <h2 className="font-display font-800 text-2xl">Complete Your Profile</h2>
            <p className="text-white/80 text-sm mt-1">
              Just a few more details to get you started with RoadGrip.
            </p>
          </div>

          <form onSubmit={handleCompleteOnboarding} className="p-6 space-y-4">
            {/* Email (read-only from Google) */}
            <div>
              <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">
                Email Address
              </label>
              <input
                value={onboardingPreFill.email}
                readOnly
                className="input-field bg-brand-light text-brand-gray cursor-not-allowed"
                type="email"
              />
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">
                  First Name
                </label>
                <input
                  value={onboardingForm.firstName}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, firstName: e.target.value })}
                  className="input-field"
                  required
                  placeholder="John"
                />
              </div>
              <div>
                <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">
                  Last Name
                </label>
                <input
                  value={onboardingForm.lastName}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, lastName: e.target.value })}
                  className="input-field"
                  placeholder="Smith"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">
                Phone Number <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" />
                <input
                  value={onboardingForm.phone}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, phone: e.target.value })}
                  className="input-field pl-9"
                  type="tel"
                  required
                  placeholder="+44 7700 900000"
                />
              </div>
              <p className="text-[11px] text-brand-gray mt-1">
                Used for delivery updates and account security only.
              </p>
            </div>

            <button
              type="submit"
              disabled={onboardingLoading}
              className="btn-primary w-full justify-center py-3 text-base shadow-md disabled:opacity-50 mt-2"
            >
              {onboardingLoading ? "Saving..." : "Complete Registration"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Brand header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-red rounded-full text-white font-display font-900 text-lg mb-3 shadow-md">
              RG
            </div>
            <h1 className="font-display font-800 text-brand-black text-3xl">RoadGrip Account</h1>
            <p className="text-brand-gray text-sm mt-1">Sign in to manage your RoadGrip account</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-white p-1.5 shadow-sm mb-6 border border-brand-border">
            {(["login", "register"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setAuthView(v)}
                className={`flex-1 py-2.5 text-sm font-display font-600 rounded-lg transition ${
                  authView === v ? "bg-brand-red text-white shadow-sm" : "text-brand-gray hover:text-brand-black"
                }`}
              >
                {v === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-brand-border">
            {authView === "login" ? (
              <>
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">
                      Email Address
                    </label>
                    <input
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="input-field"
                      type="email"
                      required
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(loginData.email);
                          setIsForgotModalOpen(true);
                        }}
                        className="text-xs text-brand-red hover:underline font-display font-600"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="input-field"
                      type="password"
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="btn-primary w-full justify-center py-3 text-base mt-2 shadow-md disabled:opacity-50"
                  >
                    {authLoading ? "Signing in..." : "Sign In with Email"}
                  </button>
                </form>

                {/* Social Auth */}
                <div className="mt-5">
                  <div className="relative flex items-center justify-center text-xs text-brand-gray mb-4">
                    <span className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-brand-border" />
                    </span>
                    <span className="relative bg-white px-3 font-display font-600">or continue with</span>
                  </div>

                  <button
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    className="w-full flex items-center justify-center gap-3 py-2.5 border border-brand-border rounded-xl text-sm font-display font-600 text-brand-black hover:bg-brand-light hover:border-gray-400 transition"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Continue with Google
                  </button>


                </div>
              </>
            ) : (
              <form onSubmit={handleEmailRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">First Name</label>
                    <input
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      className="input-field"
                      required
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Last Name</label>
                    <input
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      className="input-field"
                      required
                      placeholder="Smith"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">
                    Phone Number <span className="text-brand-red">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" />
                    <input
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className="input-field pl-9"
                      type="tel"
                      required
                      placeholder="+44 7700 900000"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Email Address</label>
                  <input
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="input-field"
                    type="email"
                    required
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Password</label>
                  <input
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="input-field"
                    type="password"
                    required
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Confirm Password</label>
                  <input
                    value={registerData.confirm}
                    onChange={(e) => setRegisterData({ ...registerData, confirm: e.target.value })}
                    className="input-field"
                    type="password"
                    required
                    placeholder="Repeat password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-primary w-full justify-center py-3 text-base mt-2 shadow-md disabled:opacity-50"
                >
                  {authLoading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Forgot password modal */}
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-brand-border">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border">
                <h4 className="font-display font-700 text-brand-black text-base">Reset Password</h4>
                <button onClick={() => setIsForgotModalOpen(false)} className="text-gray-400 hover:text-brand-black">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-brand-gray mb-4">
                Enter your registered email address and we'll send a Firebase password reset link.
              </p>
              <form onSubmit={handleSendPasswordReset} className="space-y-4">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="btn-outline !text-xs py-2 px-3.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="btn-primary !text-xs py-2 px-4"
                  >
                    {forgotLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // Filtered Orders
  // ----------------------------------------------------
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = orderFilter === "All" || order.status === orderFilter;
    const matchesSearch =
      orderSearch === "" ||
      order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.itemSummary.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.items.some((i) => i.name.toLowerCase().includes(orderSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Calculate Dashboard Metrics
  const totalOrdersCount = orders.length;
  const inTransitCount = orders.filter((o) => o.status === "In Transit" || o.status === "Processing").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;
  const totalSpent = orders.reduce((sum, o) => (o.status !== "Cancelled" ? sum + o.total : sum), 0);
  const totalTyres = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.items.reduce((isum, item) => isum + item.quantity, 0), 0);

  // Address Handlers
  function openAddAddressModal() {
    setEditingAddressId(null);
    setAddressForm({
      label: "Home",
      fullName: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      street: "",
      city: "",
      postcode: "",
      country: "United Kingdom",
      isDefault: addresses.length === 0,
      notes: "",
    });
    setIsAddressModalOpen(true);
  }

  function openEditAddressModal(addr: UserAddress) {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      postcode: addr.postcode,
      country: addr.country,
      isDefault: addr.isDefault,
      notes: addr.notes || "",
    });
    setIsAddressModalOpen(true);
  }

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.postcode) {
      showToast("Please fill all required address fields", "error");
      return;
    }

    if (editingAddressId) {
      await updateAddress(editingAddressId, addressForm);
      showToast("Address updated in MongoDB successfully!");
    } else {
      await addAddress(addressForm);
      showToast("New address saved to MongoDB!");
    }
    setIsAddressModalOpen(false);
  }

  // Re-order handler
  function handleReorder(order: UserOrder) {
    order.items.forEach((item) => {
      const found = products.find(
        (p) =>
          p.name.toLowerCase().includes(item.name.toLowerCase()) ||
          item.name.toLowerCase().includes(p.name.toLowerCase())
      );
      if (found) {
        addToCart(found, item.quantity);
      } else if (products[0]) {
        addToCart(products[0], item.quantity);
      }
    });
    showToast(`Added items from order #${order.id} to your cart!`);
    navigate("cart");
  }

  // Save Settings Handlers
  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!nameForm.firstName.trim() || !nameForm.lastName.trim()) {
      showToast("Name cannot be empty", "error");
      return;
    }
    await updateUserProfile({
      firstName: nameForm.firstName.trim(),
      lastName: nameForm.lastName.trim(),
    });
    showToast("Profile name updated and synced with MongoDB!");
  }

  async function handleSavePhone(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneForm.phone.trim()) {
      showToast("Phone number cannot be empty", "error");
      return;
    }
    await updateUserProfile({ phone: phoneForm.phone.trim() });
    showToast("Phone number saved to MongoDB!");
  }

  function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      showToast("Please enter current password", "error");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    const res = changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (res.success) {
      showToast(res.message);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  }

  // Password strength calculation
  const passLength = passwordForm.newPassword.length;
  const passHasNumber = /\d/.test(passwordForm.newPassword);
  const passHasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword);
  let passStrength = "Weak";
  let passStrengthColor = "bg-rose-500 w-1/4";
  if (passLength >= 8 && passHasNumber && passHasSpecial) {
    passStrength = "Strong";
    passStrengthColor = "bg-emerald-500 w-full";
  } else if (passLength >= 6 && (passHasNumber || passHasSpecial)) {
    passStrength = "Medium";
    passStrengthColor = "bg-amber-500 w-2/3";
  } else if (passLength > 0) {
    passStrength = "Weak";
    passStrengthColor = "bg-rose-500 w-1/4";
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  const TABS: { id: AccountTab; label: string; icon: typeof User; count?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: User },
    { id: "orders", label: "My Orders", icon: Package, count: orders.length },
    { id: "addresses", label: "Multiple Addresses", icon: MapPin, count: addresses.length },
    { id: "settings", label: "Account Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-brand-light pb-16">
      {/* Toast notifications */}
      <div className="fixed top-20 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-display font-600 animate-in fade-in slide-in-from-top-4 duration-200 ${
              toast.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-white border-emerald-200 text-brand-black"
            }`}
          >
            {toast.type === "error" ? (
              <X size={18} className="text-rose-600 shrink-0" />
            ) : (
              <CheckCircle size={18} className="text-emerald-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Hero Banner with User Profile Details */}
      <div className="bg-brand-black text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-brand-red flex items-center justify-center text-white font-display font-800 text-2xl shadow-lg ring-4 ring-white/10 shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-800 text-2xl sm:text-3xl text-white">
                  {user.firstName} {user.lastName}
                </h1>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs px-2.5 py-0.5 rounded-full font-display font-700 uppercase tracking-wide">
                  ★ {user.loyaltyTier} Member
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-300 mt-1 flex-wrap font-body">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-gray-400" /> {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-gray-400" /> {user.phone}
                </span>
                <span className="text-gray-400">· Member since {user.memberSince}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAccountTab("settings")}
              className="btn-outline !text-white !border-white/20 hover:!border-white hover:!bg-white/10 text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Edit size={14} /> Edit Profile
            </button>
            <button
              onClick={async () => {
                await logout();
                showToast("Signed out successfully");
              }}
              className="px-4 py-2 text-xs font-display font-600 text-rose-400 hover:text-rose-300 bg-white/5 hover:bg-white/10 rounded-full transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Navigation Tabs Bar */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-brand-border flex items-center gap-2 overflow-x-auto mb-8">
          {TABS.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setAccountTab(id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-display font-600 whitespace-nowrap transition ${
                accountTab === id
                  ? "bg-brand-red text-white shadow-sm"
                  : "text-brand-gray hover:text-brand-black hover:bg-brand-light"
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
              {count !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    accountTab === id ? "bg-white/20 text-white" : "bg-gray-100 text-brand-gray"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: DASHBOARD (Overview, User Details, Summary, Recent Orders) */}
        {/* ======================================================== */}
        {accountTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Stat Cards / Order Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-border">
                <div className="flex items-center justify-between text-brand-gray text-xs font-display font-600 uppercase tracking-wide">
                  <span>Total Orders</span>
                  <Package size={16} className="text-brand-red" />
                </div>
                <p className="font-display font-800 text-2xl text-brand-black mt-2">{totalOrdersCount}</p>
                <p className="text-[11px] text-brand-gray mt-1">Lifetime purchases</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-border">
                <div className="flex items-center justify-between text-brand-gray text-xs font-display font-600 uppercase tracking-wide">
                  <span>In Transit</span>
                  <Truck size={16} className="text-amber-500" />
                </div>
                <p className="font-display font-800 text-2xl text-amber-600 mt-2">{inTransitCount}</p>
                <p className="text-[11px] text-brand-gray mt-1">Active deliveries</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-border">
                <div className="flex items-center justify-between text-brand-gray text-xs font-display font-600 uppercase tracking-wide">
                  <span>Delivered</span>
                  <CheckCircle size={16} className="text-emerald-500" />
                </div>
                <p className="font-display font-800 text-2xl text-emerald-600 mt-2">{deliveredCount}</p>
                <p className="text-[11px] text-brand-gray mt-1">Completed orders</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-border">
                <div className="flex items-center justify-between text-brand-gray text-xs font-display font-600 uppercase tracking-wide">
                  <span>Total Spent</span>
                  <CreditCard size={16} className="text-brand-red" />
                </div>
                <p className="font-display font-800 text-2xl text-brand-black mt-2">Rs {totalSpent.toFixed(2)}</p>
                <p className="text-[11px] text-brand-gray mt-1">{totalTyres} Tyres bought</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 shadow-sm text-white col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-xs font-display font-600 uppercase tracking-wide text-amber-100">
                  <span>RoadGrip Points</span>
                  <span>★</span>
                </div>
                <p className="font-display font-800 text-2xl text-white mt-2">{user.loyaltyPoints.toLocaleString()} pts</p>
                <p className="text-[11px] text-amber-100 mt-1">Earn 1 pt per Rs 1 spent</p>
              </div>
            </div>

            {/* Split Section: User Details Card + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Details Overview Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-border lg:col-span-2">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-border">
                  <h3 className="font-display font-700 text-brand-black text-lg">User Profile Details</h3>
                  <button
                    onClick={() => setAccountTab("settings")}
                    className="text-xs text-brand-red font-display font-600 hover:underline flex items-center gap-1"
                  >
                    Edit in Settings <ChevronRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-brand-light">
                    <p className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide">Full Name</p>
                    <p className="font-display font-700 text-brand-black text-sm mt-1">{user.firstName} {user.lastName}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-brand-light">
                    <p className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide">Email Address</p>
                    <p className="font-display font-700 text-brand-black text-sm mt-1">{user.email}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-brand-light">
                    <p className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide">Primary Phone</p>
                    <p className="font-display font-700 text-brand-black text-sm mt-1">{user.phone}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-brand-light">
                    <p className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide">Default Delivery Address</p>
                    <p className="font-display font-700 text-brand-black text-sm mt-1 truncate">
                      {addresses.find((a) => a.isDefault)?.street || "No default address set"}
                    </p>
                  </div>
                </div>

                {/* Membership perks banner */}
                <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-sm">
                      ★
                    </div>
                    <div>
                      <p className="text-xs font-display font-700 text-brand-black">RoadGrip VIP Status: {user.loyaltyTier}</p>
                      <p className="text-xs text-brand-gray">Free priority mobile fitting & 10% discount on tyre accessories</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("shop")}
                    className="btn-primary !text-xs py-1.5 px-3.5"
                  >
                    Shop Deals
                  </button>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-border flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-700 text-brand-black text-lg mb-4 pb-3 border-b border-brand-border">
                    Quick Shortcuts
                  </h3>
                  <div className="space-y-2.5">
                    <button
                      onClick={() => setAccountTab("orders")}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-light hover:bg-gray-200 transition text-left text-xs font-display font-600 text-brand-black"
                    >
                      <span className="flex items-center gap-2.5">
                        <Package size={16} className="text-brand-red" /> View All Orders ({orders.length})
                      </span>
                      <ChevronRight size={14} className="text-brand-gray" />
                    </button>

                    <button
                      onClick={() => {
                        setAccountTab("addresses");
                        openAddAddressModal();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-light hover:bg-gray-200 transition text-left text-xs font-display font-600 text-brand-black"
                    >
                      <span className="flex items-center gap-2.5">
                        <Plus size={16} className="text-brand-red" /> Add New Address
                      </span>
                      <ChevronRight size={14} className="text-brand-gray" />
                    </button>

                    <button
                      onClick={() => setAccountTab("settings")}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-light hover:bg-gray-200 transition text-left text-xs font-display font-600 text-brand-black"
                    >
                      <span className="flex items-center gap-2.5">
                        <Lock size={16} className="text-brand-red" /> Change Password & Security
                      </span>
                      <ChevronRight size={14} className="text-brand-gray" />
                    </button>

                    <button
                      onClick={() => navigate("shop")}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-light hover:bg-gray-200 transition text-left text-xs font-display font-600 text-brand-black"
                    >
                      <span className="flex items-center gap-2.5">
                        <Truck size={16} className="text-brand-red" /> Browse Tyres Catalog
                      </span>
                      <ChevronRight size={14} className="text-brand-gray" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-brand-border text-xs text-brand-gray text-center">
                  Need assistance? Call support: <a href="tel:0775696373" className="font-bold text-brand-black hover:text-brand-red">0775696373</a>
                </div>
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-border">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display font-700 text-brand-black text-lg">Recent Orders</h3>
                  <p className="text-xs text-brand-gray">Latest purchases from MongoDB database</p>
                </div>
                <button
                  onClick={() => setAccountTab("orders")}
                  className="btn-outline !text-xs py-1.5 px-3.5 flex items-center gap-1"
                >
                  View All Orders ({orders.length}) <ChevronRight size={14} />
                </button>
              </div>

              <div className="divide-y divide-brand-border">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-light rounded-xl flex items-center justify-center text-brand-red shrink-0 border border-brand-border">
                        <Package size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-700 text-brand-black text-sm">{order.id}</p>
                          <span className={`text-[11px] font-display font-700 px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-brand-gray mt-0.5">
                          Placed on {order.date} · {order.itemSummary}
                        </p>
                        <p className="text-xs text-brand-gray mt-0.5">
                          Deliver to: <span className="text-brand-black">{order.shippingAddress}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <div className="text-right mr-2">
                        <p className="font-display font-800 text-brand-black text-base">Rs {order.total.toFixed(2)}</p>
                        <p className="text-[10px] text-brand-gray">{order.paymentMethod}</p>
                      </div>

                      <button
                        onClick={() => setSelectedOrderForTracking(order)}
                        className="btn-outline !text-xs py-1.5 px-3"
                      >
                        Track
                      </button>

                      <button
                        onClick={() => setSelectedOrderForInvoice(order)}
                        className="p-2 text-brand-gray hover:text-brand-black border border-brand-border rounded-lg hover:bg-brand-light transition text-xs font-display font-600"
                        title="View Invoice"
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MY ORDERS (Filterable, Searchable, Tracking, Invoices) */}
        {/* ======================================================== */}
        {accountTab === "orders" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter and Search Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {(["All", "In Transit", "Delivered", "Cancelled"] as const).map((status) => {
                  const count = status === "All" ? orders.length : orders.filter((o) => o.status === status).length;
                  return (
                    <button
                      key={status}
                      onClick={() => setOrderFilter(status)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-600 whitespace-nowrap transition ${
                        orderFilter === status
                          ? "bg-brand-black text-white"
                          : "bg-brand-light text-brand-gray hover:text-brand-black"
                      }`}
                    >
                      {status} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder="Search by Order # or Tyre..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="input-field !py-2 text-xs pr-8"
                />
                <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-brand-border shadow-sm">
                <Package size={40} className="mx-auto text-gray-300 mb-3" />
                <h4 className="font-display font-700 text-brand-black text-lg">No orders found</h4>
                <p className="text-brand-gray text-xs mt-1">No orders match your filter criteria in MongoDB.</p>
                <button
                  onClick={() => {
                    setOrderFilter("All");
                    setOrderSearch("");
                  }}
                  className="btn-outline !text-xs mt-4"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-brand-border overflow-hidden">
                    {/* Header */}
                    <div className="bg-brand-light/60 px-5 py-3.5 border-b border-brand-border flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div>
                          <span className="text-brand-gray">Order Placed</span>
                          <p className="font-display font-700 text-brand-black">{order.date}</p>
                        </div>
                        <div>
                          <span className="text-brand-gray">Order ID</span>
                          <p className="font-display font-700 text-brand-black">{order.id}</p>
                        </div>
                        <div>
                          <span className="text-brand-gray">Total</span>
                          <p className="font-display font-700 text-brand-black">Rs {order.total.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-display font-700 px-3 py-1 rounded-full border ${STATUS_STYLES[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Body */}
                    <div className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Items list */}
                        <div className="space-y-3 flex-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-brand-light border border-brand-border overflow-hidden flex items-center justify-center shrink-0">
                                <img
                                  src={item.imageUrl || "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=200&auto=format&fit=crop&q=80"}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-display font-700 text-brand-black text-sm truncate">{item.name}</p>
                                <p className="text-xs text-brand-gray">
                                  {item.brand && `${item.brand} · `}Size: {item.size || "Standard"} · Qty: {item.quantity}
                                </p>
                              </div>
                              <div className="text-right font-display font-700 text-brand-black text-sm">
                                Rs {(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ))}

                          <div className="pt-2 text-xs text-brand-gray">
                            <span className="font-semibold text-brand-black">Delivery Address: </span>
                            {order.shippingAddress}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-48 shrink-0">
                          <button
                            onClick={() => setSelectedOrderForTracking(order)}
                            className="btn-primary !text-xs py-2.5 justify-center flex items-center gap-2"
                          >
                            <Truck size={15} /> Track Delivery
                          </button>

                          <button
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="btn-outline !text-xs py-2 justify-center flex items-center gap-1.5"
                          >
                            View Receipt
                          </button>

                          <button
                            onClick={() => handleReorder(order)}
                            className="px-3 py-2 bg-brand-light hover:bg-gray-200 text-brand-black rounded-full text-xs font-display font-600 transition flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw size={13} /> Buy Again
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MULTIPLE ADDRESSES (MongoDB CRUD) */}
        {/* ======================================================== */}
        {accountTab === "addresses" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header with Add Button */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-border flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-display font-700 text-brand-black text-lg">Saved Delivery Addresses</h3>
                <p className="text-xs text-brand-gray">Stored securely in MongoDB for quick checkout selection</p>
              </div>
              <button
                onClick={openAddAddressModal}
                className="btn-primary !text-xs py-2.5 px-4 flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={16} /> Add New Address
              </button>
            </div>

            {/* Addresses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white rounded-2xl p-5 shadow-sm border transition flex flex-col justify-between ${
                    addr.isDefault ? "border-brand-red ring-1 ring-brand-red/30 shadow-md" : "border-brand-border hover:border-gray-400"
                  }`}
                >
                  <div>
                    {/* Tags */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="badge badge-gray font-display font-700 text-[11px] uppercase tracking-wider">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="badge badge-red font-display font-700 text-[10px] flex items-center gap-1">
                          <Check size={12} /> Default Address
                        </span>
                      )}
                    </div>

                    <p className="font-display font-700 text-brand-black text-base">{addr.fullName}</p>
                    <p className="text-xs text-brand-gray mt-1 leading-relaxed">
                      {addr.street}<br />
                      {addr.city}, {addr.postcode}<br />
                      {addr.country}
                    </p>

                    <p className="text-xs text-brand-gray mt-2 flex items-center gap-1">
                      <Phone size={12} className="text-gray-400" /> {addr.phone}
                    </p>

                    {addr.notes && (
                      <p className="text-[11px] bg-brand-light p-2 rounded-lg text-brand-gray mt-3 italic">
                        "{addr.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 mt-5 border-t border-brand-border flex items-center justify-between text-xs font-display font-600">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEditAddressModal(addr)}
                        className="text-brand-red hover:underline flex items-center gap-1"
                      >
                        <Edit size={13} /> Edit
                      </button>

                      <button
                        onClick={() => setAddressToDelete(addr.id)}
                        className="text-gray-400 hover:text-rose-600 flex items-center gap-1 transition"
                      >
                        <Trash size={13} /> Delete
                      </button>
                    </div>

                    {!addr.isDefault && (
                      <button
                        onClick={async () => {
                          await setDefaultAddress(addr.id);
                          showToast(`Set "${addr.label}" as default in MongoDB`);
                        }}
                        className="text-brand-black hover:text-brand-red transition"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add New Address Card Placeholder */}
              <button
                onClick={openAddAddressModal}
                className="border-2 border-dashed border-gray-300 hover:border-brand-red rounded-2xl p-8 flex flex-col items-center justify-center text-center text-brand-gray hover:text-brand-red bg-white/50 hover:bg-white transition group min-h-[220px]"
              >
                <div className="w-12 h-12 rounded-full bg-brand-light group-hover:bg-red-50 flex items-center justify-center text-brand-gray group-hover:text-brand-red mb-3 transition">
                  <Plus size={22} />
                </div>
                <p className="font-display font-700 text-sm">Add Another Address</p>
                <p className="text-xs text-brand-gray mt-1">Garage, workshop, or secondary residence</p>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ACCOUNT SETTINGS (Profile, Password, Login Activity) */}
        {/* ======================================================== */}
        {accountTab === "settings" && (
          <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
            {/* Section 1: Personal Details (Change Name) */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-brand-border">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-brand-border">
                <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center text-brand-red">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="font-display font-700 text-brand-black text-base">Change Name</h3>
                  <p className="text-xs text-brand-gray">Update your first and last name in your MongoDB account record</p>
                </div>
              </div>

              <form onSubmit={handleSaveName} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={nameForm.firstName}
                      onChange={(e) => setNameForm({ ...nameForm, firstName: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={nameForm.lastName}
                      onChange={(e) => setNameForm({ ...nameForm, lastName: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="btn-primary !text-xs py-2 px-5">
                    Save Name
                  </button>
                </div>
              </form>
            </div>

            {/* Section 2: Contact Information (Change Phone) */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-brand-border">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-brand-border">
                <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center text-brand-red">
                  <Phone size={18} />
                </div>
                <div>
                  <h3 className="font-display font-700 text-brand-black text-base">Change Phone Number</h3>
                  <p className="text-xs text-brand-gray">Used for delivery updates, driver notifications, and tyre fitting alerts</p>
                </div>
              </div>

              <form onSubmit={handleSavePhone} className="space-y-4">
                <div className="max-w-md">
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneForm.phone}
                    onChange={(e) => setPhoneForm({ phone: e.target.value })}
                    className="input-field"
                    placeholder="+44 7700 900123"
                    required
                  />
                  <p className="text-[11px] text-brand-gray mt-1">Include country code for SMS delivery updates</p>
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="btn-primary !text-xs py-2 px-5">
                    Update Phone Number
                  </button>
                </div>
              </form>
            </div>

            {/* Section 3: Security (Change Password) */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-brand-border">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-brand-border">
                <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center text-brand-red">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="font-display font-700 text-brand-black text-base">Change Password</h3>
                  <p className="text-xs text-brand-gray">Update your authentication password</p>
                </div>
              </div>

              <form onSubmit={handleSavePassword} className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="input-field pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-black"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="input-field pr-10"
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>

                  {/* Password Strength Indicator */}
                  {passwordForm.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] font-display font-600 text-brand-gray mb-1">
                        <span>Strength:</span>
                        <span className={passStrength === "Strong" ? "text-emerald-600" : passStrength === "Medium" ? "text-amber-600" : "text-rose-600"}>
                          {passStrength}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${passStrengthColor}`} />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="input-field"
                    placeholder="Repeat new password"
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" className="btn-primary !text-xs py-2 px-5">
                    Update Password
                  </button>
                </div>
              </form>
            </div>

            {/* Section 4: MongoDB Login History Audit Log */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-brand-border">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-brand-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center text-brand-red">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-700 text-brand-black text-base">Recent Login Activity</h3>
                    <p className="text-xs text-brand-gray">Session logs recorded in MongoDB database for your account</p>
                  </div>
                </div>
                <button
                  onClick={() => fetchLoginHistory()}
                  className="text-xs text-brand-red font-display font-600 hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>

              {loginHistory.length === 0 ? (
                <div className="p-4 rounded-xl bg-brand-light text-center text-xs text-brand-gray">
                  <p>Current active session: <strong>{user.email}</strong></p>
                  <p className="text-[11px] mt-1 text-emerald-600 font-semibold">✓ Login verified in MongoDB</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-brand-border text-brand-gray">
                        <th className="py-2 font-display font-600">Timestamp</th>
                        <th className="py-2 font-display font-600">IP Address</th>
                        <th className="py-2 font-display font-600">Method</th>
                        <th className="py-2 font-display font-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {loginHistory.slice(0, 5).map((log) => (
                        <tr key={log.id} className="text-brand-black">
                          <td className="py-2.5 font-medium">{new Date(log.loginTime).toLocaleString()}</td>
                          <td className="py-2.5 text-brand-gray font-mono text-[11px]">{log.ipAddress}</td>
                          <td className="py-2.5 capitalize">{log.provider}</td>
                          <td className="py-2.5">
                            <span className="badge badge-green text-[10px] py-0.5">
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section 5: Notification Preferences */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-brand-border">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-brand-border">
                <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center text-brand-red">
                  <Bell size={18} />
                </div>
                <div>
                  <h3 className="font-display font-700 text-brand-black text-base">Notification Preferences</h3>
                  <p className="text-xs text-brand-gray">Choose how you wish to receive updates from RoadGrip</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: "orderUpdates" as const,
                    title: "Order & Dispatch Emails",
                    desc: "Receive immediate tracking updates, shipping confirmations, and invoice receipts.",
                  },
                  {
                    key: "smsShipping" as const,
                    title: "SMS Delivery Alerts",
                    desc: "Real-time mobile text notifications when tyres are out for delivery with your courier driver.",
                  },
                  {
                    key: "maintenanceAlerts" as const,
                    title: "Tyre Pressure & Maintenance Reminders",
                    desc: "Quarterly reminders to check tyre tread depth and pressure for maximum safety.",
                  },
                  {
                    key: "promotions" as const,
                    title: "Special VIP Discounts & Tyre Rebates",
                    desc: "Exclusive seasonal tyre sales from Michelin, Pirelli, Continental, and Goodyear.",
                  },
                ].map(({ key, title, desc }) => (
                  <div key={key} className="flex items-center justify-between gap-4 py-2">
                    <div>
                      <p className="font-display font-600 text-brand-black text-sm">{title}</p>
                      <p className="text-xs text-brand-gray">{desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={notifications[key]}
                        onChange={(e) => {
                          setNotifications({ ...notifications, [key]: e.target.checked });
                          showToast("Preferences updated");
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-red"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT ADDRESS */}
      {/* ======================================================== */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 sm:p-7 border border-brand-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-brand-border">
              <h3 className="font-display font-700 text-brand-black text-lg">
                {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-brand-black transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">
                  Address Tag
                </label>
                <div className="flex gap-2">
                  {["Home", "Work", "Garage", "Other"].map((lbl) => (
                    <button
                      type="button"
                      key={lbl}
                      onClick={() => setAddressForm({ ...addressForm, label: lbl })}
                      className={`py-1.5 px-3 rounded-lg text-xs font-display font-600 border transition ${
                        addressForm.label === lbl
                          ? "bg-brand-red text-white border-brand-red"
                          : "border-brand-border text-brand-gray hover:border-gray-400"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1 block">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1 block">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1 block">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 42 Elm Road, Unit 5"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1 block">
                    City / Town
                  </label>
                  <input
                    type="text"
                    placeholder="Birmingham"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1 block">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    placeholder="B12 8QR"
                    value={addressForm.postcode}
                    onChange={(e) => setAddressForm({ ...addressForm, postcode: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1 block">
                  Delivery Instructions / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leave with security, ring bell twice"
                  value={addressForm.notes}
                  onChange={(e) => setAddressForm({ ...addressForm, notes: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultAddressCheck"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-red focus:ring-brand-red cursor-pointer"
                />
                <label htmlFor="defaultAddressCheck" className="text-xs font-display font-600 text-brand-black cursor-pointer">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="btn-outline !text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary !text-xs py-2 px-5">
                  {editingAddressId ? "Save Changes" : "Add Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE ADDRESS CONFIRMATION */}
      {/* ======================================================== */}
      {addressToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center border border-brand-border">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash size={22} />
            </div>
            <h4 className="font-display font-700 text-brand-black text-lg">Delete Address?</h4>
            <p className="text-xs text-brand-gray mt-1 leading-relaxed">
              Are you sure you want to remove this delivery address? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setAddressToDelete(null)}
                className="btn-outline !text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteAddress(addressToDelete);
                  setAddressToDelete(null);
                  showToast("Address deleted");
                }}
                className="btn-primary !bg-rose-600 hover:!bg-rose-700 !text-xs py-2 px-4"
              >
                Delete Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ORDER TRACKING TIMELINE */}
      {/* ======================================================== */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 sm:p-7 border border-brand-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-brand-border">
              <div>
                <h3 className="font-display font-700 text-brand-black text-lg">Order Tracking</h3>
                <p className="text-xs text-brand-gray">Tracking #{selectedOrderForTracking.trackingNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-brand-black transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Carrier Info Card */}
            <div className="bg-brand-light p-4 rounded-xl mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide">Courier</p>
                <p className="font-display font-700 text-brand-black text-sm">{selectedOrderForTracking.carrier || "RoadGrip Logistics"}</p>
                <p className="text-xs text-brand-red font-semibold mt-0.5">{selectedOrderForTracking.estimatedDelivery}</p>
              </div>
              <span className={`text-xs font-display font-700 px-3 py-1 rounded-full border ${STATUS_STYLES[selectedOrderForTracking.status]}`}>
                {selectedOrderForTracking.status}
              </span>
            </div>

            {/* Timeline Stepper */}
            <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {[
                {
                  title: "Order Placed & Confirmed",
                  time: selectedOrderForTracking.date,
                  done: true,
                  desc: "Payment verified and order transmitted to our distribution hub.",
                },
                {
                  title: "Quality Check & Tyre Packing",
                  time: "Day 1, 10:30 AM",
                  done: selectedOrderForTracking.status !== "Cancelled",
                  desc: "Tyres inspected for DOT date, balance, and manufacturer seal.",
                },
                {
                  title: "Dispatched with Courier",
                  time: "Day 1, 04:15 PM",
                  done: selectedOrderForTracking.status === "In Transit" || selectedOrderForTracking.status === "Delivered",
                  desc: "Departed RoadGrip Central Logistics Hub, Birmingham.",
                },
                {
                  title: "Out for Delivery",
                  time: "Day 2, 08:30 AM",
                  done: selectedOrderForTracking.status === "Delivered",
                  desc: "On mobile fitting vehicle or delivery van with courier.",
                },
                {
                  title: "Delivered",
                  time: selectedOrderForTracking.status === "Delivered" ? "Delivered" : "Pending",
                  done: selectedOrderForTracking.status === "Delivered",
                  desc: selectedOrderForTracking.status === "Delivered" ? "Signed and received at delivery address." : "Awaiting final delivery.",
                },
              ].map((step, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                      step.done ? "bg-brand-red text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <Check size={11} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <p className={`font-display font-700 text-sm ${step.done ? "text-brand-black" : "text-gray-400"}`}>
                        {step.title}
                      </p>
                      <span className="text-[11px] text-gray-400">{step.time}</span>
                    </div>
                    <p className="text-xs text-brand-gray mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-brand-border flex justify-end">
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="btn-primary !text-xs py-2 px-5"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ORDER INVOICE / RECEIPT */}
      {/* ======================================================== */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-7 border border-brand-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-brand-border">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-brand-red rounded-full flex items-center justify-center text-white font-bold text-xs">
                    RG
                  </div>
                  <span className="font-display font-800 text-brand-black text-lg">
                    Road<span className="text-brand-red">Grip</span>
                  </span>
                </div>
                <p className="text-[11px] text-brand-gray mt-1">Official Tax Invoice & Order Receipt</p>
              </div>

              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-brand-black transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-brand-border">
              <div>
                <p className="text-brand-gray">Billed To:</p>
                <p className="font-display font-700 text-brand-black">{user.firstName} {user.lastName}</p>
                <p className="text-brand-gray">{selectedOrderForInvoice.shippingAddress}</p>
                <p className="text-brand-gray">{user.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-brand-gray">Invoice #: <strong className="text-brand-black">{selectedOrderForInvoice.id}</strong></p>
                <p className="text-brand-gray">Date: {selectedOrderForInvoice.date}</p>
                <p className="text-brand-gray">Payment: {selectedOrderForInvoice.paymentMethod}</p>
                <p className="text-brand-gray">Status: <strong className="text-emerald-600">PAID</strong></p>
              </div>
            </div>

            <div className="py-4 space-y-2.5 border-b border-brand-border text-xs">
              <div className="flex justify-between font-display font-700 text-brand-gray uppercase tracking-wide text-[10px] pb-1">
                <span>Description</span>
                <span>Amount</span>
              </div>
              {selectedOrderForInvoice.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <div>
                    <p className="font-display font-600 text-brand-black">{item.name}</p>
                    <p className="text-[11px] text-brand-gray">{item.size || "Standard"} × {item.quantity}</p>
                  </div>
                  <span className="font-display font-700 text-brand-black">
                    Rs {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="py-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-brand-gray">
                <span>Subtotal</span>
                <span>Rs {selectedOrderForInvoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-brand-gray">
                <span>Delivery Charge</span>
                <span>{selectedOrderForInvoice.delivery === 0 ? "FREE" : `Rs ${selectedOrderForInvoice.delivery.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-brand-gray">
                <span>VAT / Tax (Included)</span>
                <span>Rs {(selectedOrderForInvoice.total * 0.15).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-display font-800 text-brand-black pt-2 border-t border-brand-border">
                <span>Total Paid</span>
                <span>Rs {selectedOrderForInvoice.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-brand-border">
              <button
                onClick={() => {
                  window.print();
                }}
                className="btn-outline !text-xs py-2 px-4"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="btn-primary !text-xs py-2 px-5"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
