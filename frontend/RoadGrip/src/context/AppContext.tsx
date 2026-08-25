import { createContext, useContext, useState, type ReactNode } from "react";
import type { Product } from "../data/products";

export type Page =
  | "home"
  | "shop"
  | "product"
  | "cart"
  | "checkout"
  | "account"
  | "contact"
  | "admin";

interface CartItem {
  product: Product;
  quantity: number;
}

interface AppContextType {
  currentPage: Page;
  navigate: (page: Page, productId?: number) => void;
  selectedProductId: number | null;
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQty: (productId: number, qty: number) => void;
  cartCount: number;
  cartTotal: number;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  function navigate(page: Page, productId?: number) {
    setCurrentPage(page);
    if (productId !== undefined) setSelectedProductId(productId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addToCart(product: Product, qty = 1) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

  function updateQty(productId: number, qty: number) {
    if (qty <= 0) return removeFromCart(productId);
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
    );
  }

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <AppContext.Provider
      value={{ currentPage, navigate, selectedProductId, cart, addToCart, removeFromCart, updateQty, cartCount, cartTotal }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
