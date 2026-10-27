import { getFirebaseToken } from "./firebase";
import type { UserProfile, UserAddress, UserOrder } from "../context/AppContext";
import type { Product } from "../data/products";

export interface LoginLogEntry {
  id: string;
  loginTime: string;
  ipAddress: string;
  userAgent: string;
  provider: string;
  status: string;
}

export interface PayHereCheckout {
  action: string;
  fields: Record<string, string>;
  orderId: string;
}

export type PayHerePaymentStatus = "Pending" | "Paid" | "Failed" | "Cancelled" | "ChargedBack";
export type AdminOrderStatus = "Pending Payment" | "Processing" | "In Transit" | "Delivered" | "Cancelled";

export interface AdminOrder extends UserOrder {
  status: AdminOrderStatus;
  paymentStatus: PayHerePaymentStatus | "Not Required";
  customerName: string;
  customerEmail: string;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberSince: string;
  loyaltyPoints: number;
  role: "Admin" | "Customer";
  orders: number;
  totalSpent: number;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getFirebaseToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `API error: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  async getProducts(): Promise<Product[]> {
    return request("/api/products");
  },

  async createProduct(product: Omit<Product, "id">): Promise<Product> {
    return request("/api/products", { method: "POST", body: JSON.stringify(product) });
  },

  async updateProduct(product: Product): Promise<Product> {
    return request("/api/products", { method: "PUT", body: JSON.stringify(product) });
  },

  async deleteProduct(id: number): Promise<{ success: boolean }> {
    return request(`/api/products?id=${id}`, { method: "DELETE" });
  },

  async getAdminOrders(): Promise<AdminOrder[]> {
    return request("/api/admin/orders");
  },

  async updateAdminOrder(id: string, status: AdminOrderStatus): Promise<{ id: string; status: AdminOrderStatus }> {
    return request("/api/admin/orders", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    });
  },

  async getAdminUsers(): Promise<AdminUser[]> {
    return request("/api/admin/users");
  },

  async setAdminUserRole(userId: string, role: AdminUser["role"]): Promise<{ id: string; role: AdminUser["role"] }> {
    return request("/api/admin/users", {
      method: "PATCH",
      body: JSON.stringify({ userId, role }),
    });
  },

  async getCatalog(kind: "brand" | "category"): Promise<string[]> {
    return request(`/api/admin/catalog?kind=${kind}`);
  },

  async createCatalogEntry(kind: "brand" | "category", name: string): Promise<{ name: string }> {
    return request("/api/admin/catalog", {
      method: "POST",
      body: JSON.stringify({ kind, name }),
    });
  },

  async renameCatalogEntry(kind: "brand" | "category", oldName: string, newName: string): Promise<{ oldName: string; name: string }> {
    return request("/api/admin/catalog", {
      method: "PATCH",
      body: JSON.stringify({ kind, oldName, newName }),
    });
  },

  async deleteCatalogEntry(kind: "brand" | "category", name: string): Promise<{ success: boolean }> {
    return request(`/api/admin/catalog?kind=${kind}&name=${encodeURIComponent(name)}`, { method: "DELETE" });
  },

  // Auth & Sync
  async syncUser(payload: {
    firebaseUid: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    provider?: string;
  }): Promise<{
    user: UserProfile;
    addresses: UserAddress[];
    orders: UserOrder[];
    isNewUser: boolean;
    needsOnboarding: boolean;
  }> {
    return request("/api/auth/sync-user", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Complete onboarding profile (Google sign-in new users)
  async completeProfile(data: {
    firstName: string;
    lastName: string;
    phone: string;
  }): Promise<{ user: UserProfile }> {
    return request("/api/auth/complete-profile", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Login audit history
  async getLoginHistory(): Promise<LoginLogEntry[]> {
    return request("/api/auth/login-history");
  },

  // User Profile
  async getProfile(): Promise<UserProfile> {
    return request("/api/user/profile");
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return request("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  // Addresses
  async getAddresses(): Promise<UserAddress[]> {
    return request("/api/addresses");
  },

  async createAddress(addr: Omit<UserAddress, "id">): Promise<UserAddress> {
    return request("/api/addresses", {
      method: "POST",
      body: JSON.stringify(addr),
    });
  },

  async updateAddress(id: string, addr: Partial<UserAddress>): Promise<UserAddress> {
    return request(`/api/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(addr),
    });
  },

  async deleteAddress(id: string): Promise<{ success: boolean }> {
    return request(`/api/addresses/${id}`, {
      method: "DELETE",
    });
  },

  async setDefaultAddress(id: string): Promise<{ success: boolean }> {
    return request(`/api/addresses/${id}/default`, {
      method: "PUT",
    });
  },

  // Orders
  async getOrders(): Promise<UserOrder[]> {
    return request("/api/orders");
  },

  async createOrder(order: UserOrder): Promise<UserOrder> {
    return request("/api/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
  },

  async createPayHereCheckout(payload: {
    items: { productId: number; quantity: number }[];
    shipping: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      postcode: string;
      country: string;
    };
  }): Promise<PayHereCheckout> {
    return request("/api/payments/payhere", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getPayHerePaymentStatus(orderId: string): Promise<{ status: PayHerePaymentStatus }> {
    return request(`/api/payments/payhere/status?order_id=${encodeURIComponent(orderId)}`);
  },
};
