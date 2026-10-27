import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import type { UserAddress } from "../context/AppContext";
import { Check, ChevronRight, CreditCard, Banknote, ShoppingCart, Plus } from "../components/Icons";
import { api, type PayHerePaymentStatus } from "../lib/api";

type Step = "shipping" | "payment" | "confirmation";

const STEPS = [
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
  { id: "confirmation", label: "Confirmed" },
] as const;

export default function CheckoutPage() {
  const { cart, cartScopeKey, cartTotal, navigate, user, addresses, addAddress, removeFromCart, addOrder, refreshOrders } = useApp();
  const returnedOrderId = new URLSearchParams(window.location.search).get("order_id") || "";
  const returnReason = new URLSearchParams(window.location.search).get("payment");
  const [step, setStep] = useState<Step>(returnedOrderId ? "confirmation" : "shipping");
  const [paymentMethod, setPaymentMethod] = useState<"payhere" | "cod">("payhere");
  const [placedOrderId, setPlacedOrderId] = useState<string>(returnedOrderId);
  const [paymentStatus, setPaymentStatus] = useState<PayHerePaymentStatus | "Not Required">("Pending");
  const [paymentError, setPaymentError] = useState("");
  const [isStartingPayment, setIsStartingPayment] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showNewAddress, setShowNewAddress] = useState(false);

  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
  const [newAddress, setNewAddress] = useState<Omit<UserAddress, "id">>(() => ({
    label: "Home",
    fullName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    phone: user?.phone || "",
    street: "",
    city: "",
    postcode: "",
    country: "Sri Lanka",
    isDefault: addresses.length === 0,
  }));

  const [shipping, setShipping] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: defaultAddr?.street || "",
    city: defaultAddr?.city || "",
    postcode: defaultAddr?.postcode || "",
    country: defaultAddr?.country || "Sri Lanka",
  });

  useEffect(() => {
    if (!defaultAddr || selectedAddressId) return;
    setSelectedAddressId(defaultAddr.id);
    setShipping((prev) => ({
      ...prev,
      firstName: defaultAddr.fullName.split(" ")[0] || prev.firstName,
      lastName: defaultAddr.fullName.split(" ").slice(1).join(" ") || prev.lastName,
      phone: defaultAddr.phone || prev.phone,
      address: defaultAddr.street,
      city: defaultAddr.city,
      postcode: defaultAddr.postcode,
      country: defaultAddr.country || prev.country,
    }));
  }, [defaultAddr, selectedAddressId]);

  const delivery = cartTotal >= 150 ? 0 : 9.99;
  const total = cartTotal + delivery;

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  useEffect(() => {
    if (!returnedOrderId) return;

    let active = true;
    let attempts = 0;
    const checkPayment = async () => {
      try {
        const result = await api.getPayHerePaymentStatus(returnedOrderId);
        if (!active) return;
        setPaymentStatus(result.status);
        if (result.status === "Paid") {
          try {
            const pendingCartKey = `roadgrip_pending_checkout_product_ids:${encodeURIComponent(cartScopeKey)}`;
            const purchasedProductIds = JSON.parse(sessionStorage.getItem(pendingCartKey) || "[]") as number[];
            purchasedProductIds.forEach(removeFromCart);
            sessionStorage.removeItem(pendingCartKey);
          } catch (error) {
            console.warn("Could not remove purchased items from the cart:", error);
          }
          await refreshOrders();
          active = false;
          window.clearInterval(intervalId);
        } else if (result.status === "Failed" || result.status === "Cancelled" || result.status === "ChargedBack") {
          active = false;
          window.clearInterval(intervalId);
        }
      } catch (error) {
        if (active) setPaymentError(error instanceof Error ? error.message : "Could not verify payment status.");
      }
      attempts += 1;
      if (attempts >= 20) window.clearInterval(intervalId);
    };

    const intervalId = window.setInterval(checkPayment, 2000);
    void checkPayment();
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [cartScopeKey, returnedOrderId, removeFromCart, refreshOrders]);

  function selectAddress(address: UserAddress) {
    setSelectedAddressId(address.id);
    const nameParts = address.fullName.trim().split(/\s+/);
    setShipping((prev) => ({
      ...prev,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" "),
      phone: address.phone,
      address: address.street,
      city: address.city,
      postcode: address.postcode,
      country: address.country || "Sri Lanka",
    }));
  }

  async function handleSaveNewAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const savedAddressId = await addAddress(newAddress);
    const nameParts = newAddress.fullName.trim().split(/\s+/);
    setShipping((prev) => ({
      ...prev,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" "),
      phone: newAddress.phone,
      address: newAddress.street,
      city: newAddress.city,
      postcode: newAddress.postcode,
      country: newAddress.country,
    }));
    setSelectedAddressId(savedAddressId);
    setShowNewAddress(false);
  }

  async function handlePlaceOrder() {
    setPaymentError("");
    if (paymentMethod === "payhere") {
      setIsStartingPayment(true);
      try {
        const pendingCartKey = `roadgrip_pending_checkout_product_ids:${encodeURIComponent(cartScopeKey)}`;
        sessionStorage.setItem(pendingCartKey, JSON.stringify(cart.map(({ product }) => product.id)));
        const checkout = await api.createPayHereCheckout({
          items: cart.map(({ product, quantity }) => ({ productId: product.id, quantity })),
          shipping,
        });
        const form = document.createElement("form");
        form.method = "POST";
        form.action = checkout.action;
        for (const [name, value] of Object.entries(checkout.fields)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
      } catch (error) {
        sessionStorage.removeItem(`roadgrip_pending_checkout_product_ids:${encodeURIComponent(cartScopeKey)}`);
        setPaymentError(error instanceof Error ? error.message : "Could not start sandbox payment.");
        setIsStartingPayment(false);
      }
      return;
    }

    const orderId = `RG-2026-${Math.floor(Math.random() * 90000 + 10000)}`;
    setPlacedOrderId(orderId);

    const itemsSummary = cart.map((i) => `${i.product.name} ×${i.quantity}`).join(", ");
    const fullAddress = `${shipping.address}, ${shipping.city}, ${shipping.postcode}`;

    addOrder({
      id: orderId,
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      status: "Processing",
      itemSummary: itemsSummary,
      items: cart.map((i) => ({
        name: i.product.name,
        brand: i.product.brand,
        size: i.product.size,
        quantity: i.quantity,
        price: i.product.price,
        imageUrl: i.product.image,
      })),
      subtotal: cartTotal,
      delivery,
      total,
      shippingAddress: fullAddress,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Not Required",
      trackingNumber: `RG-TRK-${Math.floor(Math.random() * 9000000 + 1000000)}`,
      carrier: "RoadGrip Express Logistics",
      estimatedDelivery: "Expected in 1–2 business days",
    });

    cart.forEach(({ product }) => removeFromCart(product.id));
    setPaymentStatus("Not Required");
    setStep("confirmation");
  }

  function StepIndicator() {
    return (
      <div className="flex items-center justify-center mb-10">
        {/* Cart step */}
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
            <ShoppingCart size={16} className="text-white" />
          </div>
          <span className="text-xs font-display font-600 text-green-600 mt-1">Cart</span>
        </div>
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className="w-16 sm:w-24 h-0.5 mx-1" style={{ background: i <= stepIndex ? "#B22222" : "#E0E0E0" }} />
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                i < stepIndex ? "bg-green-500" : i === stepIndex ? "bg-brand-red" : "bg-gray-200"
              }`}>
                {i < stepIndex
                  ? <Check size={16} className="text-white" />
                  : <span className="text-white font-display font-700 text-sm">{i + 2}</span>
                }
              </div>
              <span className={`text-xs font-display font-600 mt-1 ${
                i <= stepIndex ? "text-brand-black" : "text-brand-gray"
              }`}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-10 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check size={28} className="text-green-600" />
          </div>
          <h2 className="font-display font-800 text-brand-black text-2xl mb-2">Order Confirmed!</h2>
            <p className="text-brand-gray text-sm mb-1">Order #{placedOrderId}</p>
            {paymentStatus === "Pending" && (
              <p className="text-amber-700 text-sm mt-2">{returnReason === "cancel" ? "Payment was cancelled. This order is still unpaid." : "Checking payment with PayHere. This order is not confirmed yet."}</p>
            )}
            {paymentStatus === "Paid" && <p className="text-green-700 text-sm mt-2">Sandbox payment verified by PayHere.</p>}
            {(paymentStatus === "Failed" || paymentStatus === "Cancelled" || paymentStatus === "ChargedBack") && (
              <p className="text-red-700 text-sm mt-2">Payment status: {paymentStatus}. The order has not been confirmed.</p>
            )}
            {paymentError && <p role="alert" className="text-red-700 text-sm mt-2">{paymentError}</p>}
          <p className="text-brand-gray text-sm leading-relaxed mt-3 mb-6">
            Thank you for ordering with RoadGrip. We've emailed confirmation to <strong>{shipping.email}</strong>. You can monitor progress anytime in your profile.
          </p>

          <div className="bg-brand-light rounded-xl p-4 mb-6 text-left text-sm space-y-2">
            <div className="flex justify-between font-display font-600 text-brand-black">
              <span>Status</span>
              <span className="badge badge-yellow">Processing</span>
            </div>
            <div className="flex justify-between text-brand-gray">
              <span>Deliver To</span>
              <span className="font-medium text-brand-black text-right max-w-xs truncate">{shipping.address}, {shipping.city}</span>
            </div>
            <div className="border-t border-brand-border pt-2 flex justify-between font-display font-700 text-brand-black">
              <span>{paymentStatus === "Paid" || paymentStatus === "Not Required" ? "Total" : "Order Total"}</span>
              <span>Rs {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate("account", undefined, undefined, "orders")}
              className="btn-primary w-full justify-center"
            >
              View in My Orders
            </button>
            <button
              onClick={() => navigate("home")}
              className="btn-outline w-full justify-center text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-brand-light">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display font-800 text-brand-black text-2xl sm:text-3xl mb-8 text-center">Checkout</h1>
        <StepIndicator />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === "shipping" && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="font-display font-700 text-brand-black text-lg mb-6">Shipping Address</h2>
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="text-sm font-display font-600 text-brand-black">{addresses.length ? "Saved addresses" : "Delivery addresses"}</h3>
                      <button
                        type="button"
                        onClick={() => setShowNewAddress((visible) => !visible)}
                        className="text-sm text-brand-red font-display font-600 inline-flex items-center gap-1.5"
                      >
                        <Plus size={16} /> Add address
                      </button>
                    </div>
                    {addresses.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map((address) => (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() => selectAddress(address)}
                          className={`text-left p-4 rounded-lg border transition ${selectedAddressId === address.id ? "border-brand-red bg-red-50" : "border-brand-border hover:border-gray-400"}`}
                        >
                          <span className="flex items-start gap-3">
                            <input type="radio" checked={selectedAddressId === address.id} readOnly className="mt-1 accent-brand-red" />
                            <span className="min-w-0">
                              <span className="block font-display font-600 text-sm text-brand-black">{address.label || "Address"}{address.isDefault ? " · Default" : ""}</span>
                              <span className="block text-xs text-brand-gray mt-1">{address.fullName} · {address.phone}</span>
                              <span className="block text-xs text-brand-gray mt-1">{address.street}, {address.city}, {address.postcode}</span>
                            </span>
                          </span>
                        </button>
                      ))}
                    </div> : <p className="text-sm text-brand-gray">No saved addresses yet.</p>}
                </div>

                {showNewAddress && (
                  <form onSubmit={handleSaveNewAddress} className="mb-6 border border-brand-border rounded-lg p-4 space-y-4">
                    <h3 className="text-sm font-display font-600 text-brand-black">Add a delivery address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Address label</label>
                        <input value={newAddress.label} onChange={(event) => setNewAddress({ ...newAddress, label: event.target.value })} className="input-field" required />
                      </div>
                      <div>
                        <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Full name</label>
                        <input value={newAddress.fullName} onChange={(event) => setNewAddress({ ...newAddress, fullName: event.target.value })} className="input-field" required />
                      </div>
                      <div>
                        <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Phone</label>
                        <input value={newAddress.phone} onChange={(event) => setNewAddress({ ...newAddress, phone: event.target.value })} className="input-field" type="tel" required />
                      </div>
                      <div>
                        <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Street address</label>
                        <input value={newAddress.street} onChange={(event) => setNewAddress({ ...newAddress, street: event.target.value })} className="input-field" required />
                      </div>
                      <div>
                        <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">City</label>
                        <input value={newAddress.city} onChange={(event) => setNewAddress({ ...newAddress, city: event.target.value })} className="input-field" required />
                      </div>
                      <div>
                        <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Postcode</label>
                        <input value={newAddress.postcode} onChange={(event) => setNewAddress({ ...newAddress, postcode: event.target.value })} className="input-field" required />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Country</label>
                        <select value={newAddress.country} onChange={(event) => setNewAddress({ ...newAddress, country: event.target.value })} className="input-field">
                          <option>Sri Lanka</option>
                          <option>United Kingdom</option>
                          <option>Ireland</option>
                          <option>France</option>
                          <option>Germany</option>
                        </select>
                      </div>
                      <label className="sm:col-span-2 flex items-center gap-2 text-sm text-brand-gray">
                        <input type="checkbox" checked={newAddress.isDefault} onChange={(event) => setNewAddress({ ...newAddress, isDefault: event.target.checked })} className="accent-brand-red" />
                        Set as my default address
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="btn-primary text-sm px-4 py-2">Save address</button>
                      <button type="button" onClick={() => setShowNewAddress(false)} className="btn-outline text-sm px-4 py-2">Cancel</button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "First Name", key: "firstName", placeholder: "John" },
                    { label: "Last Name", key: "lastName", placeholder: "Smith" },
                    { label: "Email", key: "email", placeholder: "john@example.com" },
                    { label: "Phone", key: "phone", placeholder: "+94 77 123 4567" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">{label}</label>
                      <input
                        value={shipping[key as keyof typeof shipping]}
                        onChange={(e) => setShipping({ ...shipping, [key]: e.target.value })}
                        className="input-field"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Street Address</label>
                    <input
                      value={shipping.address}
                      onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                      className="input-field"
                      placeholder="No. 25, Galle Road"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">City</label>
                    <input
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      className="input-field"
                      placeholder="Colombo"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Postcode</label>
                    <input
                      value={shipping.postcode}
                      onChange={(e) => setShipping({ ...shipping, postcode: e.target.value })}
                      className="input-field"
                      placeholder="00300"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Country</label>
                    <select
                      value={shipping.country}
                      onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                      className="input-field"
                    >
                      <option>Sri Lanka</option>
                      <option>United Kingdom</option>
                      <option>Ireland</option>
                      <option>France</option>
                      <option>Germany</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setStep("payment")}
                  className="btn-primary mt-6 justify-center w-full sm:w-auto px-10 py-3.5 text-base"
                >
                  Continue to Payment <ChevronRight size={18} />
                </button>
              </div>
            )}

            {step === "payment" && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="font-display font-700 text-brand-black text-lg mb-6">Payment Method</h2>

                {/* Method selector */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { id: "payhere" as const, label: "PayHere", icon: CreditCard },
                    { id: "cod" as const, label: "Cash on Delivery", icon: Banknote },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setPaymentMethod(id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition ${
                        paymentMethod === id
                          ? "border-brand-red bg-red-50"
                          : "border-brand-border hover:border-gray-300"
                      }`}
                    >
                      <Icon size={20} className={paymentMethod === id ? "text-brand-red" : "text-brand-gray"} />
                      <span className={`text-sm font-display font-600 ${paymentMethod === id ? "text-brand-red" : "text-brand-gray"}`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>

                {paymentMethod === "payhere" && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-sm text-brand-black font-display font-600 mb-1">Pay securely with PayHere Sandbox</p>
                    <p className="text-xs text-brand-gray">You will be redirected to PayHere to enter test payment details. No card information is stored by RoadGrip.</p>
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800 font-display font-600 mb-1">Pay on delivery</p>
                    <p className="text-xs text-yellow-700">Our driver will collect payment when your tyres arrive. Cash or card accepted on the doorstep.</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep("shipping")} className="btn-outline text-sm px-5 py-3">
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isStartingPayment || cart.length === 0}
                    className="btn-primary flex-1 justify-center text-base py-3 disabled:opacity-60"
                  >
                    {isStartingPayment ? "Connecting to PayHere..." : paymentMethod === "payhere" ? `Continue to PayHere — Rs ${total.toFixed(2)}` : `Place Order — Rs ${total.toFixed(2)}`} <ChevronRight size={18} />
                  </button>
                </div>
                {paymentError && <p role="alert" className="text-red-700 text-sm mt-4">{paymentError}</p>}
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-display font-700 text-brand-black mb-4">Your Order</h3>
              <div className="space-y-3 mb-4">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-light rounded-lg overflow-hidden shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-display font-600 text-brand-black truncate">{product.name}</p>
                      <p className="text-xs text-brand-gray">{product.size} ×{quantity}</p>
                    </div>
                    <p className="text-sm font-display font-700 text-brand-black shrink-0">Rs {(product.price * quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-brand-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-brand-gray">
                  <span>Subtotal</span><span>Rs {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-gray">
                  <span>Delivery</span>
                  <span className={delivery === 0 ? "text-green-600 font-600" : ""}>{delivery === 0 ? "FREE" : `Rs ${delivery.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-display font-800 text-brand-black text-base pt-2 border-t border-brand-border">
                  <span>Total</span><span>Rs {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
