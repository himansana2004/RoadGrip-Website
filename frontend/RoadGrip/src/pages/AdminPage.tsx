import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useApp } from "../context/AppContext";
import type { Product } from "../data/products";
import {
  CreditCard,
  Edit,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash,
  TrendingUp,
  Users,
  X,
} from "../components/Icons";
import {
  api,
  type AdminOrder,
  type AdminOrderStatus,
  type AdminUser,
} from "../lib/api";

type AdminTab = "overview" | "products" | "categories" | "brands" | "orders" | "users";
type CatalogKind = "brand" | "category";

const emptyProduct: Omit<Product, "id"> = {
  name: "",
  brand: "",
  category: "Car",
  price: 0,
  rating: 0,
  reviewCount: 0,
  size: "",
  width: 0,
  aspectRatio: 0,
  rimDiameter: 0,
  stock: 0,
  image: "",
  description: "",
  loadIndex: "",
  speedRating: "",
};

const orderStatuses: AdminOrderStatus[] = [
  "Pending Payment",
  "Processing",
  "In Transit",
  "Delivered",
  "Cancelled",
];

const navItems: { id: AdminTab; label: string; icon: typeof Package }[] = [
  { id: "overview", label: "Dashboard overview", icon: TrendingUp },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories & vehicle types", icon: Package },
  { id: "brands", label: "Brands", icon: Package },
  { id: "orders", label: "Orders", icon: CreditCard },
  { id: "users", label: "Users", icon: Users },
];

function formatLkr(amount: number) {
  return `LKR ${amount.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}

export default function AdminPage() {
  const { products, refreshProducts } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<Omit<Product, "id">>(emptyProduct);
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [catalogBusy, setCatalogBusy] = useState<string | null>(null);

  function fetchAdminData() {
    return Promise.all([
        api.getAdminOrders(),
        api.getAdminUsers(),
        api.getCatalog("category"),
        api.getCatalog("brand"),
      ]);
  }

  function applyAdminData([nextOrders, nextUsers, nextCategories, nextBrands]: Awaited<ReturnType<typeof fetchAdminData>>) {
      setOrders(nextOrders);
      setUsers(nextUsers);
      setCategories(nextCategories);
      setBrands(nextBrands);
      setError("");
  }

  async function reloadAdminData() {
    setLoading(true);
    try {
      applyAdminData(await fetchAdminData());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetchAdminData()
      .then((data) => {
        if (active) applyAdminData(data);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load admin data");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const visibleProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      [product.name, product.brand, product.category, product.size]
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [products, productSearch]);

  const visibleOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((order) =>
      [order.id, order.customerName, order.customerEmail, order.status, order.paymentMethod]
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [orders, orderSearch]);

  const visibleUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      [`${user.firstName} ${user.lastName}`, user.email, user.phone, user.role]
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [users, userSearch]);

  const paidRevenue = orders
    .filter((order) => order.paymentStatus === "Paid" || (order.status === "Delivered" && order.paymentStatus === "Not Required"))
    .reduce((total, order) => total + order.total, 0);
  const pendingOrders = orders.filter((order) => order.status === "Pending Payment" || order.status === "Processing").length;
  const paymentMethods = useMemo(() => {
    const totals = new Map<string, { count: number; amount: number }>();
    orders.forEach((order) => {
      const method = order.paymentMethod || "Unspecified";
      const item = totals.get(method) || { count: 0, amount: 0 };
      item.count += 1;
      item.amount += order.total;
      totals.set(method, item);
    });
    return [...totals.entries()]
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);
  const paymentTotal = paymentMethods.reduce((total, method) => total + method.count, 0);
  const paymentColors = ["#B22222", "#111111", "#7f1d1d", "#6b7280", "#d97706", "#9ca3af"];
  let paymentProgress = 0;
  const paymentGradient = paymentMethods.length
    ? `conic-gradient(${paymentMethods.map((method, index) => {
      const start = paymentProgress;
      paymentProgress += paymentTotal ? method.count / paymentTotal * 100 : 0;
      return `${paymentColors[index % paymentColors.length]} ${start}% ${paymentProgress}%`;
    }).join(", ")})`
    : "conic-gradient(#E0E0E0 0% 100%)";

  const categoryDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((product) => counts.set(product.category, (counts.get(product.category) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [products]);
  const maxCategoryCount = Math.max(...categoryDistribution.map(([, count]) => count), 1);

  function openCreate() {
    setError("");
    setForm(emptyProduct);
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setError("");
    setForm(product);
    setEditing(product);
    setFormOpen(true);
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) await api.updateProduct({ ...form, id: editing.id });
      else await api.createProduct(form);
      await Promise.all([refreshProducts(), reloadAdminData()]);
      setEditing(null);
      setFormOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save product");
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(id: number) {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.deleteProduct(id);
      await refreshProducts();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete product");
    }
  }

  function setField<K extends keyof Omit<Product, "id">>(field: K, value: Omit<Product, "id">[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function updateOrderStatus(orderId: string, status: AdminOrderStatus) {
    setBusyOrderId(orderId);
    setError("");
    try {
      await api.updateAdminOrder(orderId, status);
      setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status } : order));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update order");
    } finally {
      setBusyOrderId(null);
    }
  }

  async function updateUserRole(userId: string, role: AdminUser["role"]) {
    setBusyUserId(userId);
    setError("");
    try {
      await api.setAdminUserRole(userId, role);
      setUsers((current) => current.map((user) => user.id === userId ? { ...user, role } : user));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update user role");
    } finally {
      setBusyUserId(null);
    }
  }

  async function addCatalog(kind: CatalogKind) {
    const value = kind === "category" ? newCategory.trim() : newBrand.trim();
    if (!value) return;
    setCatalogBusy(`${kind}:${value}`);
    setError("");
    try {
      await api.createCatalogEntry(kind, value);
      if (kind === "category") {
        setCategories(await api.getCatalog(kind));
        setNewCategory("");
      } else {
        setBrands(await api.getCatalog(kind));
        setNewBrand("");
      }
    } catch (catalogError) {
      setError(catalogError instanceof Error ? catalogError.message : "Could not add catalog entry");
    } finally {
      setCatalogBusy(null);
    }
  }

  async function renameCatalog(kind: CatalogKind, oldName: string) {
    const updatedName = window.prompt(`Rename ${oldName} to:`, oldName)?.trim();
    if (!updatedName || updatedName === oldName) return;
    setCatalogBusy(`${kind}:${oldName}`);
    setError("");
    try {
      await api.renameCatalogEntry(kind, oldName, updatedName);
      if (kind === "category") {
        setCategories(await api.getCatalog(kind));
        await refreshProducts();
      } else {
        setBrands(await api.getCatalog(kind));
        await refreshProducts();
      }
    } catch (catalogError) {
      setError(catalogError instanceof Error ? catalogError.message : "Could not rename catalog entry");
    } finally {
      setCatalogBusy(null);
    }
  }

  async function removeCatalog(kind: CatalogKind, name: string) {
    if (!window.confirm(`Delete "${name}"? Entries used by products cannot be removed.`)) return;
    setCatalogBusy(`${kind}:${name}`);
    setError("");
    try {
      await api.deleteCatalogEntry(kind, name);
      if (kind === "category") setCategories(await api.getCatalog(kind));
      else setBrands(await api.getCatalog(kind));
    } catch (catalogError) {
      setError(catalogError instanceof Error ? catalogError.message : "Could not delete catalog entry");
    } finally {
      setCatalogBusy(null);
    }
  }

  const filteredCatalog = (kind: CatalogKind) => {
    const entries = kind === "category" ? categories : brands;
    const query = (kind === "category" ? categorySearch : brandSearch).trim().toLowerCase();
    return query ? entries.filter((entry) => entry.toLowerCase().includes(query)) : entries;
  };

  return (
    <div className="min-h-screen bg-brand-light text-brand-black">
      <header className="border-b border-brand-border bg-brand-black px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-extrabold text-white">Road<span className="text-brand-red">Grip</span> Admin</h1>
            <p className="mt-1 text-xs text-gray-300">Store operations and analytics</p>
          </div>
          <button onClick={() => void reloadAdminData()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-200 hover:border-brand-red hover:text-white disabled:opacity-50">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh data
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row">
        <aside className="flex shrink-0 gap-2 overflow-x-auto lg:w-60 lg:flex-col lg:overflow-visible">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${activeTab === id ? "bg-brand-red font-semibold text-white" : "text-brand-gray hover:bg-brand-light hover:text-brand-black"}`}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </aside>

        <main className="min-w-0 flex-1 space-y-5">
          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-brand-red">{error}</div>}

          {activeTab === "overview" && (
            <>
              <div>
                <h2 className="font-display text-2xl font-bold">Dashboard Overview</h2>
                <p className="mt-1 text-sm text-brand-gray">Live sales, orders and catalog metrics</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Paid revenue", value: formatLkr(paidRevenue), icon: TrendingUp, color: "text-brand-red", tone: "bg-red-50" },
                  { label: "Total orders", value: orders.length.toLocaleString(), icon: Package, color: "text-brand-black", tone: "bg-gray-100" },
                  { label: "Pending / processing", value: pendingOrders.toLocaleString(), icon: RefreshCw, color: "text-amber-700", tone: "bg-amber-50" },
                  { label: "Customers", value: users.length.toLocaleString(), icon: Users, color: "text-brand-gray", tone: "bg-gray-100" },
                ].map(({ label, value, icon: Icon, color, tone }) => (
                  <div key={label} className="rounded-xl border border-brand-border bg-white p-4 shadow-sm">
                    <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${tone} ${color}`}><Icon size={18} /></div>
                    <p className="text-2xl font-bold text-brand-black">{loading ? "—" : value}</p>
                    <p className="mt-1 text-xs text-brand-gray">{label}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
                <section className="rounded-xl border border-brand-border bg-white p-5 shadow-sm">
                  <div className="mb-5">
                    <h3 className="font-semibold text-brand-black">Payment Methods</h3>
                    <p className="text-xs text-brand-gray">Order payment distribution</p>
                  </div>
                  <div className="flex flex-col items-center gap-6 sm:flex-row">
                    <div className="h-40 w-40 shrink-0 rounded-full" style={{ background: paymentGradient }} aria-label="Payment method distribution">
                      <div className="m-9 flex h-22 w-22 items-center justify-center rounded-full bg-white text-center text-xs text-brand-gray">
                        {paymentTotal} orders
                      </div>
                    </div>
                    <div className="w-full space-y-3">
                      {paymentMethods.length ? paymentMethods.map((method, index) => (
                        <div key={method.name} className="flex items-center gap-2 text-sm">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: paymentColors[index % paymentColors.length] }} />
                          <span className="min-w-0 flex-1 truncate text-brand-gray">{method.name}</span>
                          <span className="text-gray-500">{paymentTotal ? Math.round(method.count / paymentTotal * 100) : 0}%</span>
                          <span className="w-24 text-right font-medium text-brand-black">{formatLkr(method.amount)}</span>
                        </div>
                      )) : <p className="text-sm text-brand-gray">No order payment data yet.</p>}
                    </div>
                  </div>
                </section>
                <section className="rounded-xl border border-brand-border bg-white p-5 shadow-sm">
                  <h3 className="font-semibold text-brand-black">Catalog health</h3>
                  <p className="mb-5 text-xs text-brand-gray">Products by vehicle type</p>
                  {categoryDistribution.length ? <div className="space-y-4">
                    {categoryDistribution.map(([category, count]) => (
                      <div key={category}>
                        <div className="mb-1 flex justify-between text-xs"><span className="text-brand-gray">{category}</span><span className="text-gray-500">{count}</span></div>
                        <div className="h-2 overflow-hidden rounded-full bg-brand-light"><div className="h-full rounded-full bg-brand-red" style={{ width: `${count / maxCategoryCount * 100}%` }} /></div>
                      </div>
                    ))}
                  </div> : <p className="text-sm text-brand-gray">No products in the catalog yet.</p>}
                </section>
              </div>
            </>
          )}

          {activeTab === "products" && (
            <section className="overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border p-4">
                <div><h2 className="font-semibold text-brand-black">Product management</h2><p className="text-xs text-brand-gray">{products.length} products in catalog</p></div>
                <button onClick={openCreate} className="btn-primary rounded-lg px-4 py-2 text-sm"><Plus size={15} /> Add product</button>
              </div>
              <div className="border-b border-brand-border p-4">
                <label className="relative block">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search name, brand, vehicle type or size..." className="input-field py-2.5 pl-9" />
                </label>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-brand-light text-xs uppercase text-brand-gray"><tr>{["Product", "Brand", "Vehicle type", "Size", "Price", "Stock", "Actions"].map((head) => <th key={head} className="whitespace-nowrap px-4 py-3">{head}</th>)}</tr></thead>
                  <tbody>{visibleProducts.map((product) => (
                    <tr key={product.id} className="border-t border-brand-border hover:bg-brand-light/60">
                      <td className="px-4 py-3 font-medium text-brand-black">{product.name}</td><td className="px-4 py-3 text-brand-gray">{product.brand}</td><td className="px-4 py-3 text-brand-gray">{product.category}</td><td className="px-4 py-3 text-brand-gray">{product.size}</td><td className="px-4 py-3 font-semibold text-brand-red">{formatLkr(product.price)}</td><td className="px-4 py-3 text-brand-gray">{product.stock}</td>
                      <td className="px-4 py-3"><div className="flex gap-3"><button onClick={() => openEdit(product)} aria-label={`Edit ${product.name}`} className="text-brand-gray hover:text-brand-black"><Edit size={15} /></button><button onClick={() => void removeProduct(product.id)} aria-label={`Delete ${product.name}`} className="text-brand-gray hover:text-brand-red"><Trash size={15} /></button></div></td>
                    </tr>
                  ))}</tbody>
                </table>
                {!visibleProducts.length && <p className="p-8 text-center text-sm text-brand-gray">No matching products.</p>}
              </div>
            </section>
          )}

          {(activeTab === "categories" || activeTab === "brands") && (() => {
            const kind: CatalogKind = activeTab === "categories" ? "category" : "brand";
            const title = kind === "category" ? "Categories & vehicle types" : "Brands";
            const list = filteredCatalog(kind);
            const searchValue = kind === "category" ? categorySearch : brandSearch;
            const setSearchValue = kind === "category" ? setCategorySearch : setBrandSearch;
            const newValue = kind === "category" ? newCategory : newBrand;
            const setNewValue = kind === "category" ? setNewCategory : setNewBrand;
            return (
              <section className="rounded-xl border border-brand-border bg-white shadow-sm">
                <div className="border-b border-brand-border p-4"><h2 className="font-semibold text-brand-black">{title}</h2><p className="text-xs text-brand-gray">{kind === "category" ? "Manage product vehicle types and categories." : "Manage brands assigned to products."}</p></div>
                <form onSubmit={(event) => { event.preventDefault(); void addCatalog(kind); }} className="flex flex-col gap-3 border-b border-brand-border p-4 sm:flex-row">
                  <input value={newValue} onChange={(event) => setNewValue(event.target.value)} maxLength={80} required placeholder={`Add ${kind === "category" ? "category / vehicle type" : "brand"}...`} className="input-field min-w-0 flex-1 py-2" />
                  <button disabled={Boolean(catalogBusy)} className="btn-primary justify-center rounded-lg px-4 py-2 text-sm disabled:opacity-50"><Plus size={15} /> Add {kind}</button>
                </form>
                <div className="p-4">
                  <input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder={`Search ${kind}s...`} className="input-field mb-3 py-2" />
                  <div className="divide-y divide-brand-border">
                    {list.map((name) => (
                      <div key={name} className="flex items-center justify-between gap-3 py-3">
                        <div><p className="font-medium text-brand-black">{name}</p><p className="text-xs text-brand-gray">{products.filter((product) => (kind === "category" ? product.category : product.brand).toLowerCase() === name.toLowerCase()).length} products</p></div>
                        <div className="flex gap-3"><button disabled={Boolean(catalogBusy)} onClick={() => void renameCatalog(kind, name)} aria-label={`Rename ${name}`} className="text-brand-gray hover:text-brand-black disabled:opacity-40"><Edit size={15} /></button><button disabled={Boolean(catalogBusy)} onClick={() => void removeCatalog(kind, name)} aria-label={`Delete ${name}`} className="text-brand-gray hover:text-brand-red disabled:opacity-40"><Trash size={15} /></button></div>
                      </div>
                    ))}
                    {!list.length && <p className="py-8 text-center text-sm text-brand-gray">No {kind}s found.</p>}
                  </div>
                </div>
              </section>
            );
          })()}

          {activeTab === "orders" && (
            <section className="overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border p-4">
                <div><h2 className="font-semibold text-brand-black">Order management</h2><p className="text-xs text-brand-gray">{orders.length} orders · payment status tracked from checkout</p></div>
                <label className="relative w-full sm:w-80"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="Search order, customer, email..." className="input-field py-2 pl-9" /></label>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-brand-light text-xs uppercase text-brand-gray"><tr>{["Order", "Customer", "Date", "Total", "Payment", "Status"].map((head) => <th key={head} className="whitespace-nowrap px-4 py-3">{head}</th>)}</tr></thead>
                  <tbody>{visibleOrders.map((order) => (
                    <tr key={order.id} className="border-t border-brand-border hover:bg-brand-light/60">
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-brand-red">{order.id}</td><td className="px-4 py-3"><p className="text-brand-black">{order.customerName}</p><p className="text-xs text-brand-gray">{order.customerEmail || "Email unavailable"}</p></td><td className="whitespace-nowrap px-4 py-3 text-brand-gray">{order.date}</td><td className="whitespace-nowrap px-4 py-3 font-semibold text-brand-black">{formatLkr(order.total)}</td><td className="px-4 py-3"><p className="text-brand-gray">{order.paymentMethod}</p><p className="text-xs text-gray-500">{order.paymentStatus}</p></td>
                      <td className="px-4 py-3"><select disabled={busyOrderId === order.id} value={order.status} onChange={(event) => void updateOrderStatus(order.id, event.target.value as AdminOrderStatus)} className="rounded-md border border-brand-border bg-white px-2 py-1.5 text-xs text-brand-black focus:border-brand-red focus:outline-none disabled:opacity-50">{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select></td>
                    </tr>
                  ))}</tbody>
                </table>
                {!visibleOrders.length && <p className="p-8 text-center text-sm text-brand-gray">{loading ? "Loading orders..." : "No matching orders."}</p>}
              </div>
            </section>
          )}

          {activeTab === "users" && (
            <section className="overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border p-4">
                <div><h2 className="font-semibold text-brand-black">User management</h2><p className="text-xs text-brand-gray">{users.length} registered users · role changes are audited by server authorization</p></div>
                <label className="relative w-full sm:w-80"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search name, email or phone..." className="input-field py-2 pl-9" /></label>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-brand-light text-xs uppercase text-brand-gray"><tr>{["User", "Joined", "Points", "Orders", "Total spent", "Role", "Access"].map((head) => <th key={head} className="whitespace-nowrap px-4 py-3">{head}</th>)}</tr></thead>
                  <tbody>{visibleUsers.map((user) => (
                    <tr key={user.id} className="border-t border-brand-border hover:bg-brand-light/60">
                      <td className="px-4 py-3"><p className="font-medium text-brand-black">{[user.firstName, user.lastName].filter(Boolean).join(" ") || "Unnamed user"}</p><p className="text-xs text-brand-gray">{user.email}</p></td><td className="whitespace-nowrap px-4 py-3 text-brand-gray">{user.memberSince}</td><td className="px-4 py-3 text-amber-700">{user.loyaltyPoints.toLocaleString()} pts</td><td className="px-4 py-3 text-brand-gray">{user.orders}</td><td className="whitespace-nowrap px-4 py-3 font-semibold text-brand-red">{formatLkr(user.totalSpent)}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs ${user.role === "Admin" ? "bg-red-50 text-brand-red" : "bg-gray-100 text-brand-gray"}`}>{user.role}</span></td>
                      <td className="px-4 py-3"><button disabled={busyUserId === user.id} onClick={() => void updateUserRole(user.id, user.role === "Admin" ? "Customer" : "Admin")} className="whitespace-nowrap rounded-md border border-brand-border px-2.5 py-1.5 text-xs text-brand-gray hover:border-brand-red hover:text-brand-red disabled:opacity-50">{busyUserId === user.id ? "Saving..." : user.role === "Admin" ? "Remove admin" : "Make admin"}</button></td>
                    </tr>
                  ))}</tbody>
                </table>
                {!visibleUsers.length && <p className="p-8 text-center text-sm text-brand-gray">{loading ? "Loading users..." : "No matching users."}</p>}
              </div>
            </section>
          )}
        </main>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => { setEditing(null); setFormOpen(false); }}>
          <form onSubmit={saveProduct} onClick={(event) => event.stopPropagation()} className="w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 text-brand-black max-h-[90vh]">
            <div className="flex items-center justify-between"><h2 className="font-display text-xl font-extrabold">{editing ? "Edit product" : "Add product"}</h2><button type="button" onClick={() => { setEditing(null); setFormOpen(false); }} aria-label="Close product form"><X size={18} /></button></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(["name", "brand", "size", "image", "loadIndex", "speedRating"] as const).map((field) => <label key={field} className="text-xs font-medium capitalize">{field}<input required value={String(form[field])} onChange={(event) => setField(field, event.target.value)} list={field === "brand" ? "admin-brands" : undefined} className="input-field mt-1" /></label>)}
              <datalist id="admin-brands">{brands.map((brand) => <option key={brand} value={brand} />)}</datalist>
              <label className="text-xs font-medium">Vehicle type / category<input required value={form.category} onChange={(event) => setField("category", event.target.value)} list="admin-categories" className="input-field mt-1" /></label>
              <datalist id="admin-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist>
              {(["price", "rating", "reviewCount", "width", "aspectRatio", "rimDiameter", "stock"] as const).map((field) => <label key={field} className="text-xs font-medium capitalize">{field}<input required min={0} type="number" step="any" value={String(form[field])} onChange={(event) => setField(field, Number(event.target.value))} className="input-field mt-1" /></label>)}
              <label className="text-xs font-medium">Original price (optional)<input min={0} type="number" step="any" value={form.originalPrice ?? ""} onChange={(event) => setForm((current) => ({ ...current, originalPrice: event.target.value ? Number(event.target.value) : undefined }))} className="input-field mt-1" /></label>
            </div>
            <label className="text-xs font-medium">Description<textarea required value={form.description} onChange={(event) => setField("description", event.target.value)} className="input-field mt-1 min-h-24" /></label>
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.isNew || false} onChange={(event) => setField("isNew", event.target.checked)} /> New product</label>
            <button disabled={saving} className="btn-primary w-full justify-center">{saving ? "Saving..." : "Save product"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
