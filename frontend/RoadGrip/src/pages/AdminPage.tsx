import { useState } from "react";
import { products } from "../data/products";
import StarRating from "../components/StarRating";
import {
  BarChart as BarChartIcon, Home, Package, Users, Tag,
  Settings, AlertTriangle, TrendingUp, ShoppingCart, Edit, Trash, Eye, Plus, X
} from "../components/Icons";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

type AdminTab = "dashboard" | "products" | "orders" | "customers" | "reviews" | "reports" | "settings";

const SALES_DATA = [
  { month: "Feb", revenue: 12400, orders: 89 },
  { month: "Mar", revenue: 18200, orders: 134 },
  { month: "Apr", revenue: 15800, orders: 112 },
  { month: "May", revenue: 22600, orders: 167 },
  { month: "Jun", revenue: 28400, orders: 198 },
  { month: "Jul", revenue: 24900, orders: 182 },
  { month: "Aug", revenue: 31200, orders: 221 },
];

const ORDERS = [
  { id: "RG-2026-48291", customer: "James Thornton", date: "20 Aug 2026", items: 2, total: 379.98, status: "Delivered" },
  { id: "RG-2026-48156", customer: "Sarah Mitchell", date: "19 Aug 2026", items: 4, total: 759.96, status: "In Transit" },
  { id: "RG-2026-48044", customer: "Ravi Patel", date: "18 Aug 2026", items: 1, total: 219.99, status: "Processing" },
  { id: "RG-2026-47932", customer: "Emma Chen", date: "17 Aug 2026", items: 2, total: 499.98, status: "Delivered" },
  { id: "RG-2026-47816", customer: "Tom Whitfield", date: "16 Aug 2026", items: 1, total: 129.99, status: "Cancelled" },
  { id: "RG-2026-47701", customer: "Priya Sharma", date: "15 Aug 2026", items: 3, total: 639.97, status: "Delivered" },
];

const CUSTOMERS = [
  { id: "C-1042", name: "James Thornton", email: "j.thornton@email.com", orders: 7, spent: 1849.93, joined: "Jan 2025" },
  { id: "C-1041", name: "Sarah Mitchell", email: "s.mitchell@email.co.uk", orders: 3, spent: 949.95, joined: "Mar 2025" },
  { id: "C-1040", name: "Ravi Patel", email: "ravi.p@gmail.com", orders: 5, spent: 1249.95, joined: "Dec 2024" },
  { id: "C-1039", name: "Emma Chen", email: "emma.chen@outlook.com", orders: 2, spent: 499.98, joined: "May 2026" },
  { id: "C-1038", name: "Tom Whitfield", email: "tom.w@email.com", orders: 9, spent: 2119.91, joined: "Aug 2024" },
];

const STATUS_STYLES: Record<string, string> = {
  Delivered: "badge-green",
  "In Transit": "badge-yellow",
  Processing: "badge-gray",
  Cancelled: "badge-red",
};

const CATEGORY_SALES = [
  { name: "Car", sales: 1240 },
  { name: "SUV", sales: 640 },
  { name: "Bike", sales: 280 },
  { name: "Van", sales: 380 },
];

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [searchOrder, setSearchOrder] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);

  const NAV_ITEMS: { id: AdminTab; label: string; icon: typeof Home }[] = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "customers", label: "Customers", icon: Users },
    { id: "reviews", label: "Reviews", icon: Tag },
    { id: "reports", label: "Reports", icon: BarChartIcon },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const filteredOrders = ORDERS.filter(
    (o) =>
      o.id.toLowerCase().includes(searchOrder.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchOrder.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-brand-light overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-brand-black flex flex-col shrink-0">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-red rounded-full flex items-center justify-center">
              <span className="text-white font-display font-900 text-xs">RG</span>
            </div>
            <span className="font-display font-800 text-white text-base">
              Road<span className="text-brand-red">Grip</span>
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-0.5 font-body">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`sidebar-link w-full ${tab === id ? "active" : ""}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-red/30 rounded-full flex items-center justify-center text-white font-display font-700 text-xs">
              AD
            </div>
            <div>
              <p className="text-white text-xs font-display font-600">Admin User</p>
              <p className="text-gray-500 text-xs">admin@roadgrip.co.uk</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="bg-white border-b border-brand-border px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="font-display font-700 text-brand-black text-lg capitalize">{tab}</h1>
            <p className="text-brand-gray text-xs">Road Grip Tyre Shop · Admin</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-red-50 text-brand-red px-3 py-1.5 rounded-lg text-xs font-display font-600">
              <AlertTriangle size={13} />
              3 Low Stock Alerts
            </div>
            <button onClick={() => setShowAddProduct(true)} className="btn-primary text-sm py-2 px-4">
              <Plus size={15} /> Add Product
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* Dashboard */}
          {tab === "dashboard" && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue (Aug)", value: "£31,200", change: "+24.7%", up: true, icon: TrendingUp },
                  { label: "Total Orders", value: "221", change: "+21.4%", up: true, icon: ShoppingCart },
                  { label: "Total Customers", value: "1,842", change: "+8.2%", up: true, icon: Users },
                  { label: "Low Stock Items", value: "3", change: "Restock needed", up: false, icon: AlertTriangle },
                ].map(({ label, value, change, up, icon: Icon }) => (
                  <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-brand-gray text-xs font-display font-600 uppercase tracking-wide">{label}</p>
                        <p className="font-display font-800 text-brand-black text-2xl mt-1">{value}</p>
                        <p className={`text-xs mt-1 font-display font-600 ${up ? "text-green-600" : "text-brand-red"}`}>{change}</p>
                      </div>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${up ? "bg-green-100" : "bg-red-100"}`}>
                        <Icon size={18} className={up ? "text-green-600" : "text-brand-red"} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Revenue chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-display font-700 text-brand-black mb-4">Revenue & Orders (2026)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={SALES_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#B22222" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#B22222" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F2" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "1px solid #E0E0E0", fontSize: 12, fontFamily: "Poppins" }}
                        formatter={(val, name) => [name === "revenue" ? `£${Number(val).toLocaleString()}` : val, name === "revenue" ? "Revenue" : "Orders"]}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#B22222" strokeWidth={2} fill="url(#revGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Category bar chart */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-display font-700 text-brand-black mb-4">Sales by Category</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={CATEGORY_SALES} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F2" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "1px solid #E0E0E0", fontSize: 12, fontFamily: "Poppins" }}
                      />
                      <Bar dataKey="sales" fill="#B22222" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent orders */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
                  <h3 className="font-display font-700 text-brand-black">Recent Orders</h3>
                  <button onClick={() => setTab("orders")} className="text-xs text-brand-red font-display font-600 hover:underline">View all</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-brand-light">
                        {["Order ID", "Customer", "Date", "Items", "Total", "Status", "Actions"].map((h) => (
                          <th key={h} className="text-left py-3 px-4 font-display font-600 text-brand-gray text-xs uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ORDERS.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b border-brand-border hover:bg-brand-light transition">
                          <td className="py-3 px-4 font-display font-600 text-brand-black text-xs">{order.id}</td>
                          <td className="py-3 px-4 text-brand-gray text-xs">{order.customer}</td>
                          <td className="py-3 px-4 text-brand-gray text-xs">{order.date}</td>
                          <td className="py-3 px-4 text-brand-gray text-xs">{order.items}</td>
                          <td className="py-3 px-4 font-display font-700 text-brand-black text-xs">£{order.total.toFixed(2)}</td>
                          <td className="py-3 px-4"><span className={`badge ${STATUS_STYLES[order.status]}`}>{order.status}</span></td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1.5">
                              <button className="p-1.5 rounded-lg text-brand-gray hover:bg-brand-light hover:text-brand-black transition"><Eye size={14} /></button>
                              <button className="p-1.5 rounded-lg text-brand-gray hover:bg-brand-light hover:text-brand-black transition"><Edit size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          {tab === "products" && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-brand-border flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display font-700 text-brand-black">All Products</h3>
                <button onClick={() => setShowAddProduct(true)} className="btn-primary text-sm py-2 px-4">
                  <Plus size={15} /> Add Product
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-brand-light">
                      {["Product", "Brand", "Category", "Size", "Price", "Stock", "Rating", "Actions"].map((h) => (
                        <th key={h} className="text-left py-3 px-4 font-display font-600 text-brand-gray text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-brand-border hover:bg-brand-light transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 bg-brand-light rounded-lg overflow-hidden shrink-0">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-display font-600 text-brand-black text-xs whitespace-nowrap">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-brand-gray text-xs">{p.brand}</td>
                        <td className="py-3 px-4 text-brand-gray text-xs">{p.category}</td>
                        <td className="py-3 px-4 text-brand-gray text-xs font-body">{p.size}</td>
                        <td className="py-3 px-4 font-display font-700 text-brand-red text-xs">£{p.price.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`badge ${p.stock <= 10 ? "badge-red" : p.stock <= 20 ? "badge-yellow" : "badge-green"}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <StarRating rating={p.rating} size="sm" />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1.5">
                            <button className="p-1.5 rounded-lg text-brand-gray hover:bg-brand-light hover:text-brand-black transition"><Eye size={13} /></button>
                            <button className="p-1.5 rounded-lg text-brand-gray hover:bg-brand-light hover:text-brand-black transition"><Edit size={13} /></button>
                            <button className="p-1.5 rounded-lg text-brand-gray hover:bg-red-50 hover:text-brand-red transition"><Trash size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders */}
          {tab === "orders" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <input
                  value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)}
                  placeholder="Search orders or customers..."
                  className="input-field max-w-72"
                />
                <select className="input-field max-w-40">
                  <option>All Status</option>
                  <option>Delivered</option>
                  <option>In Transit</option>
                  <option>Processing</option>
                  <option>Cancelled</option>
                </select>
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-brand-light">
                        {["Order ID", "Customer", "Date", "Items", "Total", "Status", "Actions"].map((h) => (
                          <th key={h} className="text-left py-3 px-4 font-display font-600 text-brand-gray text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b border-brand-border hover:bg-brand-light transition">
                          <td className="py-3.5 px-4 font-display font-600 text-brand-black text-xs">{order.id}</td>
                          <td className="py-3.5 px-4 text-brand-gray text-xs">{order.customer}</td>
                          <td className="py-3.5 px-4 text-brand-gray text-xs whitespace-nowrap">{order.date}</td>
                          <td className="py-3.5 px-4 text-brand-gray text-xs">{order.items}</td>
                          <td className="py-3.5 px-4 font-display font-700 text-brand-black text-xs">£{order.total.toFixed(2)}</td>
                          <td className="py-3.5 px-4"><span className={`badge ${STATUS_STYLES[order.status]}`}>{order.status}</span></td>
                          <td className="py-3.5 px-4">
                            <div className="flex gap-1.5">
                              <button className="p-1.5 rounded-lg text-brand-gray hover:text-brand-black transition"><Eye size={14} /></button>
                              <button className="p-1.5 rounded-lg text-brand-gray hover:text-brand-black transition"><Edit size={14} /></button>
                              <button className="p-1.5 rounded-lg text-brand-gray hover:text-brand-red transition"><Trash size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Customers */}
          {tab === "customers" && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-brand-light">
                      {["Customer ID", "Name", "Email", "Orders", "Total Spent", "Member Since", "Actions"].map((h) => (
                        <th key={h} className="text-left py-3 px-4 font-display font-600 text-brand-gray text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CUSTOMERS.map((c) => (
                      <tr key={c.id} className="border-b border-brand-border hover:bg-brand-light transition">
                        <td className="py-3.5 px-4 font-display font-600 text-brand-gray text-xs">{c.id}</td>
                        <td className="py-3.5 px-4 font-display font-600 text-brand-black text-xs">{c.name}</td>
                        <td className="py-3.5 px-4 text-brand-gray text-xs">{c.email}</td>
                        <td className="py-3.5 px-4 text-brand-gray text-xs">{c.orders}</td>
                        <td className="py-3.5 px-4 font-display font-700 text-green-600 text-xs">£{c.spent.toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-brand-gray text-xs">{c.joined}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex gap-1.5">
                            <button className="p-1.5 rounded-lg text-brand-gray hover:text-brand-black transition"><Eye size={14} /></button>
                            <button className="p-1.5 rounded-lg text-brand-gray hover:text-brand-black transition"><Edit size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "reviews" && (
            <div className="space-y-4">
              {[
                { author: "James Thornton", product: "Michelin Pilot Sport 4S", rating: 5, date: "20 Aug 2026", comment: "Absolutely superb tyre. Transformed my BMW M3's handling.", status: "Published" },
                { author: "Sarah Mitchell", product: "Continental SportContact 7", rating: 4, date: "18 Aug 2026", comment: "Great grip in wet conditions. Slightly noisy at motorway speeds.", status: "Published" },
                { author: "Anonymous", product: "Goodyear Eagle F1", rating: 2, date: "17 Aug 2026", comment: "Tyre deflated after 3 weeks. Very disappointed.", status: "Flagged" },
              ].map((r) => (
                <div key={r.author + r.date} className="bg-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-700 text-brand-black text-sm">{r.author}</p>
                      <span className="text-xs text-brand-gray">·</span>
                      <p className="text-xs text-brand-gray">{r.product}</p>
                      <span className="text-xs text-brand-gray">·</span>
                      <p className="text-xs text-brand-gray">{r.date}</p>
                    </div>
                    <StarRating rating={r.rating} size="sm" />
                    <p className="text-sm text-brand-gray mt-2">{r.comment}</p>
                  </div>
                  <div className="flex items-start gap-2 shrink-0">
                    <span className={`badge ${r.status === "Published" ? "badge-green" : "badge-red"}`}>{r.status}</span>
                    <button className="p-1.5 rounded-lg text-brand-gray hover:text-brand-black transition"><Edit size={14} /></button>
                    <button className="p-1.5 rounded-lg text-brand-gray hover:text-brand-red transition"><Trash size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "reports" && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-display font-700 text-brand-black mb-4">Monthly Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={SALES_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B22222" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#B22222" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F2" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: 12 }} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" name="Revenue (£)" stroke="#B22222" strokeWidth={2} fill="url(#revGrad2)" />
                    <Area type="monotone" dataKey="orders" name="Orders" stroke="#111111" strokeWidth={2} fill="none" strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm max-w-lg">
              <h3 className="font-display font-700 text-brand-black mb-5">Store Settings</h3>
              <div className="space-y-4">
                {[
                  { label: "Store Name", val: "Road Grip Tyre Shop" },
                  { label: "Contact Email", val: "info@roadgrip.co.uk" },
                  { label: "Phone Number", val: "0800 123 4567" },
                  { label: "Free Delivery Threshold (£)", val: "150" },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">{label}</label>
                    <input defaultValue={val} className="input-field" />
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-2">
                  <input type="checkbox" id="maintenance" className="w-4 h-4 rounded accent-brand-red" />
                  <label htmlFor="maintenance" className="text-sm text-brand-gray">Enable maintenance mode</label>
                </div>
                <button className="btn-primary mt-2">Save Settings</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-brand-border">
              <h3 className="font-display font-700 text-brand-black">Add New Product</h3>
              <button onClick={() => setShowAddProduct(false)} className="text-brand-gray hover:text-brand-black transition">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Product Name", placeholder: "e.g. Pilot Sport 5" },
                { label: "Brand", placeholder: "e.g. Michelin" },
              ].map(({ label, placeholder }) => (
                <div key={label}>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">{label}</label>
                  <input className="input-field" placeholder={placeholder} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Category</label>
                  <select className="input-field">
                    <option>Car</option><option>SUV</option><option>Bike</option><option>Van</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Price (£)</label>
                  <input className="input-field" placeholder="149.99" type="number" />
                </div>
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Tyre Size</label>
                  <input className="input-field" placeholder="225/45 R17" />
                </div>
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Stock</label>
                  <input className="input-field" placeholder="24" type="number" />
                </div>
              </div>
              <div>
                <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Description</label>
                <textarea className="input-field min-h-20 resize-none" placeholder="Product description..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddProduct(false)} className="btn-outline flex-1 justify-center text-sm py-2.5">Cancel</button>
                <button onClick={() => setShowAddProduct(false)} className="btn-primary flex-1 justify-center text-sm py-2.5">Add Product</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
