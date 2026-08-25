import { useState } from "react";
import { Check, Package, MapPin, User, ChevronRight } from "../components/Icons";

type AuthView = "login" | "register";
type DashboardTab = "overview" | "orders" | "addresses" | "profile";

const MOCK_ORDERS = [
  { id: "RG-2026-48291", date: "18 Aug 2026", status: "Delivered", total: 379.98, items: "Michelin Pilot Sport 4S ×2" },
  { id: "RG-2026-39017", date: "3 Jul 2026", status: "In Transit", total: 219.99, items: "Pirelli P Zero ×1" },
  { id: "RG-2026-22104", date: "11 May 2026", status: "Delivered", total: 519.96, items: "Continental SportContact 7 ×2, Bridgestone Turanza ×1" },
  { id: "RG-2026-15388", date: "2 Feb 2026", status: "Cancelled", total: 129.99, items: "Bridgestone Turanza T005 ×1" },
];

const STATUS_STYLES: Record<string, string> = {
  Delivered: "badge-green",
  "In Transit": "badge-yellow",
  Processing: "badge-gray",
  Cancelled: "badge-red",
};

export default function AccountPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [dashTab, setDashTab] = useState<DashboardTab>("overview");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex rounded-xl bg-white p-1 shadow-sm mb-6">
            {(["login", "register"] as AuthView[]).map((v) => (
              <button
                key={v}
                onClick={() => setAuthView(v)}
                className={`flex-1 py-2.5 text-sm font-display font-600 rounded-lg transition ${
                  authView === v ? "bg-brand-red text-white" : "text-brand-gray hover:text-brand-black"
                }`}
              >
                {v === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-7 shadow-sm">
            {authView === "login" ? (
              <>
                <div className="text-center mb-6">
                  <h1 className="font-display font-800 text-brand-black text-2xl">Welcome back</h1>
                  <p className="text-brand-gray text-sm mt-1">Sign in to your RoadGrip account</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Email</label>
                    <input value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} className="input-field" type="email" placeholder="you@example.com" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide">Password</label>
                      <a href="#" className="text-xs text-brand-red hover:underline">Forgot password?</a>
                    </div>
                    <input value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} className="input-field" type="password" placeholder="••••••••" />
                  </div>
                  <button onClick={() => setIsLoggedIn(true)} className="btn-primary w-full justify-center py-3 text-base mt-2">
                    Sign In
                  </button>
                </div>
                <div className="mt-5">
                  <div className="relative flex items-center justify-center text-xs text-brand-gray mb-4">
                    <span className="absolute inset-0 flex items-center"><span className="w-full border-t border-brand-border" /></span>
                    <span className="relative bg-white px-3">or continue with</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {["Google", "Apple"].map((s) => (
                      <button key={s} className="flex items-center justify-center gap-2 py-2.5 border border-brand-border rounded-xl text-sm font-display font-600 text-brand-gray hover:border-brand-black hover:text-brand-black transition">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h1 className="font-display font-800 text-brand-black text-2xl">Create account</h1>
                  <p className="text-brand-gray text-sm mt-1">Join thousands of happy customers</p>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">First Name</label>
                      <input value={registerData.firstName} onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })} className="input-field" placeholder="John" />
                    </div>
                    <div>
                      <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Last Name</label>
                      <input value={registerData.lastName} onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })} className="input-field" placeholder="Smith" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Email</label>
                    <input value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} className="input-field" type="email" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Password</label>
                    <input value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} className="input-field" type="password" placeholder="Min. 8 characters" />
                  </div>
                  <div>
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Confirm Password</label>
                    <input value={registerData.confirm} onChange={(e) => setRegisterData({ ...registerData, confirm: e.target.value })} className="input-field" type="password" placeholder="Repeat password" />
                  </div>
                  <button onClick={() => setIsLoggedIn(true)} className="btn-primary w-full justify-center py-3 text-base mt-2">
                    Create Account
                  </button>
                  <p className="text-xs text-brand-gray text-center">By registering, you agree to our <a href="#" className="text-brand-red hover:underline">Terms</a> and <a href="#" className="text-brand-red hover:underline">Privacy Policy</a></p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  const DASH_TABS: { id: DashboardTab; label: string; icon: typeof User }[] = [
    { id: "overview", label: "Overview", icon: User },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-800 text-brand-black text-2xl">My Account</h1>
            <p className="text-brand-gray text-sm">Welcome back, John Smith</p>
          </div>
          <button onClick={() => setIsLoggedIn(false)} className="text-sm text-brand-red font-display font-600 hover:underline">
            Sign Out
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-brand-border">
                <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center text-white font-display font-700">
                  JS
                </div>
                <div>
                  <p className="font-display font-700 text-brand-black text-sm">John Smith</p>
                  <p className="text-xs text-brand-gray">j.smith@email.com</p>
                </div>
              </div>
              <nav className="space-y-1">
                {DASH_TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setDashTab(id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-display font-600 transition ${
                      dashTab === id
                        ? "bg-brand-red text-white"
                        : "text-brand-gray hover:bg-brand-light hover:text-brand-black"
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {dashTab === "overview" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Total Orders", value: "4", color: "text-brand-red" },
                    { label: "Tyres Purchased", value: "8", color: "text-brand-black" },
                    { label: "Total Spent", value: "£1,249.92", color: "text-green-600" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
                      <p className="text-brand-gray text-xs font-display font-600 uppercase tracking-wide">{label}</p>
                      <p className={`font-display font-800 text-2xl mt-1 ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display font-700 text-brand-black mb-4">Recent Orders</h3>
                  {MOCK_ORDERS.slice(0, 2).map((order) => (
                    <div key={order.id} className="flex items-center justify-between py-3 border-b border-brand-border last:border-0">
                      <div>
                        <p className="font-display font-600 text-brand-black text-sm">{order.id}</p>
                        <p className="text-xs text-brand-gray">{order.date} · {order.items}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge ${STATUS_STYLES[order.status]}`}>{order.status}</span>
                        <span className="font-display font-700 text-brand-black text-sm">£{order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setDashTab("orders")} className="text-brand-red text-sm font-display font-600 hover:underline mt-3 flex items-center gap-1">
                    View all orders <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {dashTab === "orders" && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-brand-border">
                  <h3 className="font-display font-700 text-brand-black">Order History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-brand-light">
                        <th className="text-left py-3 px-5 font-display font-600 text-brand-gray text-xs uppercase tracking-wide">Order ID</th>
                        <th className="text-left py-3 px-4 font-display font-600 text-brand-gray text-xs uppercase tracking-wide">Date</th>
                        <th className="text-left py-3 px-4 font-display font-600 text-brand-gray text-xs uppercase tracking-wide">Items</th>
                        <th className="text-left py-3 px-4 font-display font-600 text-brand-gray text-xs uppercase tracking-wide">Status</th>
                        <th className="text-right py-3 px-5 font-display font-600 text-brand-gray text-xs uppercase tracking-wide">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_ORDERS.map((order) => (
                        <tr key={order.id} className="border-b border-brand-border hover:bg-brand-light transition">
                          <td className="py-3.5 px-5 font-display font-600 text-brand-black">{order.id}</td>
                          <td className="py-3.5 px-4 text-brand-gray">{order.date}</td>
                          <td className="py-3.5 px-4 text-brand-gray max-w-48 truncate">{order.items}</td>
                          <td className="py-3.5 px-4">
                            <span className={`badge ${STATUS_STYLES[order.status]}`}>{order.status}</span>
                          </td>
                          <td className="py-3.5 px-5 text-right font-display font-700 text-brand-black">£{order.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {dashTab === "addresses" && (
              <div className="space-y-4">
                {[
                  { label: "Default", name: "John Smith", address: "42 Elm Road, Birmingham, B12 8QR", phone: "+44 7700 900123" },
                  { label: "Work", name: "John Smith", address: "Unit 5 Business Park, Solihull, B91 2AA", phone: "+44 121 456 7890" },
                ].map((addr) => (
                  <div key={addr.label} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`badge ${addr.label === "Default" ? "badge-red" : "badge-gray"} mb-2`}>{addr.label}</span>
                        <p className="font-display font-700 text-brand-black">{addr.name}</p>
                        <p className="text-brand-gray text-sm mt-0.5">{addr.address}</p>
                        <p className="text-brand-gray text-sm">{addr.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-sm text-brand-red hover:underline font-display font-600">Edit</button>
                        <button className="text-sm text-gray-400 hover:text-brand-black font-display font-600">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="btn-outline text-sm">+ Add New Address</button>
              </div>
            )}

            {dashTab === "profile" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm max-w-lg">
                <h3 className="font-display font-700 text-brand-black mb-5">Profile Information</h3>
                <div className="space-y-4">
                  {[
                    { label: "First Name", val: "John" },
                    { label: "Last Name", val: "Smith" },
                    { label: "Email", val: "j.smith@email.com" },
                    { label: "Phone", val: "+44 7700 900123" },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">{label}</label>
                      <input defaultValue={val} className="input-field" />
                    </div>
                  ))}
                  <button className="btn-primary mt-2">
                    <Check size={16} /> Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
