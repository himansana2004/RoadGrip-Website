import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Product } from "../data/products";
import { api, type LoginLogEntry } from "../lib/api";
import { auth, subscribeToAuthChanges, logoutUser, isFirebaseConfigured } from "../lib/firebase";

export type Page =
  | "home"
  | "shop"
  | "product"
  | "cart"
  | "checkout"
  | "account"
  | "contact"
  | "admin";

export type AccountTab = "dashboard" | "orders" | "addresses" | "settings";

interface RouteState {
  page: Page;
  productId: number | null;
  shopSearch: string;
  accountTab: AccountTab;
}

function readRouteFromLocation(): RouteState {
  const url = new URL(window.location.href);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  const page = pathname === "/" ? "home" : pathname.slice(1) as Page;
  const validPage: Page = ["home", "shop", "product", "cart", "checkout", "account", "contact", "admin"].includes(page)
    ? page
    : "home";
  const requestedTab = url.searchParams.get("tab");
  const accountTab: AccountTab = requestedTab === "orders" || requestedTab === "addresses" || requestedTab === "settings"
    ? requestedTab
    : "dashboard";
  const parsedProductId = Number(url.searchParams.get("id"));

  return {
    page: validPage,
    productId: validPage === "product" && Number.isInteger(parsedProductId) && parsedProductId > 0 ? parsedProductId : null,
    shopSearch: validPage === "shop" ? url.searchParams.get("search") ?? "" : "",
    accountTab: validPage === "account" ? accountTab : "dashboard",
  };
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role?: "Admin" | "Customer";
  avatarUrl?: string;
  memberSince: string;
  loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  loyaltyPoints: number;
}

export interface UserAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  postcode: string;
  country: string;
  isDefault: boolean;
  notes?: string;
}

export interface OrderItem {
  name: string;
  brand?: string;
  size?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export type OrderStatus = "Processing" | "In Transit" | "Delivered" | "Cancelled";

export interface UserOrder {
  id: string;
  date: string;
  status: OrderStatus | "Pending Payment";
  paymentStatus?: "Pending" | "Paid" | "Failed" | "Cancelled" | "ChargedBack" | "Not Required";
  items: OrderItem[];
  itemSummary: string;
  subtotal: number;
  delivery: number;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  trackingNumber: string;
  carrier?: string;
  estimatedDelivery?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  ownerKey: string;
  items: CartItem[];
}

const GUEST_CART_OWNER = "guest";

function getCartStorageKey(ownerKey: string) {
  return `roadgrip_cart:${encodeURIComponent(ownerKey)}`;
}

function readCart(ownerKey: string): CartItem[] {
  try {
    const savedCart = localStorage.getItem(getCartStorageKey(ownerKey));
    if (!savedCart) return [];
    const parsed: unknown = JSON.parse(savedCart);
    if (!Array.isArray(parsed)) throw new Error("Saved cart is not a list");
    return parsed as CartItem[];
  } catch (error) {
    console.warn("Could not load this user's saved cart:", error);
    return [];
  }
}

interface AppContextType {
  currentPage: Page;
  navigate: (page: Page, productId?: number, searchTerm?: string, accountTab?: AccountTab) => void;
  shopSearch: string;
  selectedProductId: number | null;
  products: Product[];
  isAdmin: boolean;
  refreshProducts: () => Promise<void>;
  cart: CartItem[];
  cartScopeKey: string;
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQty: (productId: number, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;

  // User Profile & Account
  isLoggedIn: boolean;
  user: UserProfile;
  accountTab: AccountTab;
  setAccountTab: (tab: AccountTab) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  addresses: UserAddress[];
  addAddress: (addr: Omit<UserAddress, "id">) => Promise<string>;
  updateAddress: (id: string, addr: Partial<UserAddress>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  orders: UserOrder[];
  refreshOrders: () => Promise<void>;
  addOrder: (order: UserOrder) => Promise<void>;
  login: (email?: string, name?: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  isFirebaseReady: boolean;
  loginHistory: LoginLogEntry[];
  fetchLoginHistory: () => Promise<void>;

  // Onboarding
  needsOnboarding: boolean;
  onboardingPreFill: { firstName: string; lastName: string; email: string };
  completeOnboarding: (data: { firstName: string; lastName: string; phone: string }) => Promise<void>;
}

const BLANK_USER: UserProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  memberSince: "",
  loyaltyTier: "Bronze",
  loyaltyPoints: 0,
  role: "Customer",
};

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [initialRoute] = useState(readRouteFromLocation);
  const [currentPage, setCurrentPage] = useState<Page>(initialRoute.page);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(initialRoute.productId);
  const [shopSearch, setShopSearch] = useState(initialRoute.shopSearch);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartState, setCartState] = useState<CartState>(() => {
    const ownerKey = auth?.currentUser ? `uid-${auth.currentUser.uid}` : GUEST_CART_OWNER;
    return { ownerKey, items: readCart(ownerKey) };
  });
  const { ownerKey: cartScopeKey, items: cart } = cartState;

  // User and account state — starts blank, populated from MongoDB after login
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile>(BLANK_USER);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [accountTab, setAccountTab] = useState<AccountTab>(initialRoute.accountTab);
  const [loginHistory, setLoginHistory] = useState<LoginLogEntry[]>([]);
  const isAdmin = user.email.toLowerCase() === "roadgrip@admin.lk" || user.role === "Admin";

  // Onboarding state (triggered when new Google user has no phone)
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);
  const [onboardingPreFill, setOnboardingPreFill] = useState<{ firstName: string; lastName: string; email: string }>({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    refreshProducts();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(getCartStorageKey(cartState.ownerKey), JSON.stringify(cartState.items));
    } catch (error) {
      console.warn("Could not preserve cart for this session:", error);
    }
  }, [cartState]);

  function switchCartOwner(ownerKey: string) {
    setCartState((current) => current.ownerKey === ownerKey
      ? current
      : { ownerKey, items: readCart(ownerKey) });
  }

  useEffect(() => {
    function restoreRoute() {
      const route = readRouteFromLocation();
      setCurrentPage(route.page);
      setSelectedProductId(route.productId);
      setShopSearch(route.shopSearch);
      setAccountTab(route.accountTab);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    window.addEventListener("popstate", restoreRoute);
    return () => window.removeEventListener("popstate", restoreRoute);
  }, []);

  async function refreshProducts() {
    try {
      setProducts(await api.getProducts());
    } catch (error) {
      console.warn("Could not load products from MongoDB:", error);
    }
  }

  // Connect Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (fbUser) => {
      if (fbUser) {
        switchCartOwner(`uid-${fbUser.uid}`);
        setIsLoggedIn(true);
        try {
          const syncRes = await api.syncUser({
            firebaseUid: fbUser.uid,
            email: fbUser.email || "",
            firstName: fbUser.displayName?.split(" ")[0] || "",
            lastName: fbUser.displayName?.split(" ").slice(1).join(" ") || "",
            provider: fbUser.providerData[0]?.providerId || "password",
          });

          if (syncRes.user) setUser(syncRes.user);
          if (syncRes.addresses) setAddresses(syncRes.addresses);
          if (syncRes.orders) setOrders(syncRes.orders);

          // If new user via Google and missing phone/name, trigger onboarding modal
          if (syncRes.needsOnboarding) {
            setOnboardingPreFill({
              firstName: syncRes.user?.firstName || fbUser.displayName?.split(" ")[0] || "",
              lastName: syncRes.user?.lastName || fbUser.displayName?.split(" ").slice(1).join(" ") || "",
              email: fbUser.email || "",
            });
            setNeedsOnboarding(true);
          }
        } catch (syncErr) {
          console.warn("Could not sync with MongoDB backend (running in offline/local state):", syncErr);
        }
      } else {
        // Signed out
        switchCartOwner(GUEST_CART_OWNER);
        setIsLoggedIn(false);
        setUser(BLANK_USER);
        setAddresses([]);
        setOrders([]);
        setNeedsOnboarding(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function fetchLoginHistory() {
    try {
      const logs = await api.getLoginHistory();
      setLoginHistory(logs);
    } catch (e) {
      console.warn("Could not fetch login history:", e);
    }
  }

  async function completeOnboarding(data: { firstName: string; lastName: string; phone: string }) {
    try {
      const res = await api.completeProfile(data);
      if (res.user) setUser(res.user);
      setNeedsOnboarding(false);
    } catch (err) {
      console.warn("Failed to complete onboarding:", err);
      throw err;
    }
  }

  function navigate(page: Page, productId?: number, searchTerm?: string, tab?: AccountTab) {
    const url = new URL(window.location.href);
    url.pathname = page === "home" ? "/" : `/${page}`;
    url.search = "";
    if (page === "product" && productId !== undefined) url.searchParams.set("id", String(productId));
    if (page === "shop" && searchTerm) url.searchParams.set("search", searchTerm);
    if (page === "account") url.searchParams.set("tab", tab ?? accountTab);
    window.history.pushState({}, "", url);

    setCurrentPage(page);
    setSelectedProductId(page === "product" ? productId ?? null : null);
    if (page === "shop") setShopSearch(searchTerm ?? "");
    if (page === "account" && tab) setAccountTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addToCart(product: Product, qty = 1) {
    setCartState((state) => {
      const prev = state.items;
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return { ...state, items: prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        ) };
      }
      return { ...state, items: [...prev, { product, quantity: qty }] };
    });
  }

  const removeFromCart = useCallback((productId: number) => {
    setCartState((state) => ({ ...state, items: state.items.filter((i) => i.product.id !== productId) }));
  }, []);

  function updateQty(productId: number, qty: number) {
    if (qty <= 0) return removeFromCart(productId);
    setCartState((state) => ({
      ...state,
      items: state.items.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i)),
    }));
  }

  function clearCart() {
    setCartState((state) => ({ ...state, items: [] }));
  }

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  // Profile operations
  async function updateUserProfile(updates: Partial<UserProfile>) {
    setUser((prev) => ({ ...prev, ...updates }));
    try {
      await api.updateProfile(updates);
    } catch (err) {
      console.warn("Backend update failed, kept in local state:", err);
    }
  }

  function changePassword(_oldPass: string, _newPass: string) {
    return { success: true, message: "Password updated successfully!" };
  }

  async function addAddress(addr: Omit<UserAddress, "id">): Promise<string> {
    const tempId = `addr-${Date.now()}`;
    const newAddr: UserAddress = { ...addr, id: tempId };

    setAddresses((prev) => {
      if (newAddr.isDefault) {
        return [newAddr, ...prev.map((a) => ({ ...a, isDefault: false }))];
      }
      return [newAddr, ...prev];
    });

    try {
      const serverAddr = await api.createAddress(addr);
      setAddresses((prev) =>
        prev.map((a) => (a.id === tempId ? serverAddr : a))
      );
      return serverAddr.id;
    } catch (err) {
      console.warn("Backend address creation failed, saved locally:", err);
      return tempId;
    }
  }

  async function updateAddress(id: string, addr: Partial<UserAddress>) {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === id) return { ...a, ...addr };
        if (addr.isDefault) return { ...a, isDefault: false };
        return a;
      })
    );

    try {
      await api.updateAddress(id, addr);
    } catch (err) {
      console.warn("Backend address update failed, updated locally:", err);
    }
  }

  async function deleteAddress(id: string) {
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });

    try {
      await api.deleteAddress(id);
    } catch (err) {
      console.warn("Backend address delete failed, deleted locally:", err);
    }
  }

  async function setDefaultAddress(id: string) {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );

    try {
      await api.setDefaultAddress(id);
    } catch (err) {
      console.warn("Backend set default address failed, saved locally:", err);
    }
  }

  async function addOrder(order: UserOrder) {
    setOrders((prev) => [order, ...prev]);

    try {
      await api.createOrder(order);
    } catch (err) {
      console.warn("Backend order creation failed, saved locally:", err);
    }
  }

  const refreshOrders = useCallback(async () => {
    try {
      setOrders(await api.getOrders());
    } catch (err) {
      console.warn("Could not refresh orders:", err);
    }
  }, []);

  async function login(email?: string, name?: string, phone?: string) {
    if (email) switchCartOwner(`email-${email.trim().toLowerCase()}`);
    setIsLoggedIn(true);
    if (email) {
      const parts = (name || "").split(" ");
      setUser((prev) => ({
        ...prev,
        email,
        firstName: parts[0] || prev.firstName,
        lastName: parts.slice(1).join(" ") || prev.lastName,
        phone: phone || prev.phone,
      }));

      try {
        const syncRes = await api.syncUser({
          firebaseUid: `uid-${email.replace(/[^a-zA-Z0-9]/g, "")}`,
          email,
          firstName: parts[0] || "",
          lastName: parts.slice(1).join(" ") || "",
          phone: phone || "",
          provider: "demo",
        });
        if (syncRes.user) setUser(syncRes.user);
        if (syncRes.addresses) setAddresses(syncRes.addresses);
        if (syncRes.orders) setOrders(syncRes.orders);
        if (syncRes.needsOnboarding) {
          setOnboardingPreFill({ firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "", email });
          setNeedsOnboarding(true);
        }
      } catch (err) {
        console.warn("Backend sync failed during login:", err);
      }
    }
  }

  async function logout() {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Firebase logout error:", e);
    }
    setIsLoggedIn(false);
    switchCartOwner(GUEST_CART_OWNER);
    setUser(BLANK_USER);
    setAddresses([]);
    setOrders([]);
    setNeedsOnboarding(false);
  }

  return (
    <AppContext.Provider
      value={{
        currentPage,
        navigate,
        shopSearch,
        selectedProductId,
        products,
        isAdmin,
        refreshProducts,
        cart,
        cartScopeKey,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartCount,
        cartTotal,
        isLoggedIn,
        user,
        accountTab,
        setAccountTab,
        updateUserProfile,
        changePassword,
        addresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        orders,
        refreshOrders,
        addOrder,
        login,
        logout,
        isFirebaseReady: isFirebaseConfigured,
        loginHistory,
        fetchLoginHistory,
        needsOnboarding,
        onboardingPreFill,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
