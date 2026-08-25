import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Check, ChevronRight, CreditCard, Banknote, ShoppingCart } from "../components/Icons";

type Step = "shipping" | "payment" | "confirmation";

const STEPS = [
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
  { id: "confirmation", label: "Confirmed" },
] as const;

export default function CheckoutPage() {
  const { cart, cartTotal, navigate } = useApp();
  const [step, setStep] = useState<Step>("shipping");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const [shipping, setShipping] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    address: "", city: "", postcode: "", country: "United Kingdom",
  });
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });

  const delivery = cartTotal >= 150 ? 0 : 9.99;
  const total = cartTotal + delivery;

  const stepIndex = STEPS.findIndex((s) => s.id === step);

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
      <div className="min-h-screen bg-brand-light flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-10 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check size={28} className="text-green-600" />
          </div>
          <h2 className="font-display font-800 text-brand-black text-2xl mb-2">Order Placed!</h2>
          <p className="text-brand-gray text-sm mb-1">Order #RG-2026-{Math.floor(Math.random() * 90000 + 10000)}</p>
          <p className="text-brand-gray text-sm leading-relaxed mt-3 mb-8">
            Thank you for your order! We'll send a confirmation email to <strong>{shipping.email}</strong>. Your tyres will be dispatched within 1–2 business days.
          </p>
          <div className="bg-brand-light rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-2">Order Summary</p>
            {cart.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm py-1">
                <span className="text-brand-gray">{product.name} ×{quantity}</span>
                <span className="font-display font-600">£{(product.price * quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-brand-border mt-2 pt-2 flex justify-between font-display font-700 text-brand-black">
              <span>Total</span><span>£{total.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={() => navigate("home")} className="btn-primary w-full justify-center">Back to Home</button>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "First Name", key: "firstName", placeholder: "John" },
                    { label: "Last Name", key: "lastName", placeholder: "Smith" },
                    { label: "Email", key: "email", placeholder: "john@example.com" },
                    { label: "Phone", key: "phone", placeholder: "+44 7700 900123" },
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
                      placeholder="123 High Street"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">City</label>
                    <input
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      className="input-field"
                      placeholder="Birmingham"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Postcode</label>
                    <input
                      value={shipping.postcode}
                      onChange={(e) => setShipping({ ...shipping, postcode: e.target.value })}
                      className="input-field"
                      placeholder="B12 8QR"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Country</label>
                    <select
                      value={shipping.country}
                      onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                      className="input-field"
                    >
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
                    { id: "card" as const, label: "Credit / Debit Card", icon: CreditCard },
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

                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Card Number</label>
                      <input
                        value={card.number}
                        onChange={(e) => setCard({ ...card, number: e.target.value })}
                        className="input-field"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Cardholder Name</label>
                      <input
                        value={card.name}
                        onChange={(e) => setCard({ ...card, name: e.target.value })}
                        className="input-field"
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Expiry</label>
                        <input
                          value={card.expiry}
                          onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                          className="input-field"
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">CVV</label>
                        <input
                          value={card.cvv}
                          onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                          className="input-field"
                          placeholder="123"
                          maxLength={4}
                          type="password"
                        />
                      </div>
                    </div>
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
                    onClick={() => setStep("confirmation")}
                    className="btn-primary flex-1 justify-center text-base py-3"
                  >
                    Place Order — £{total.toFixed(2)} <ChevronRight size={18} />
                  </button>
                </div>
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
                    <p className="text-sm font-display font-700 text-brand-black shrink-0">£{(product.price * quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-brand-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-brand-gray">
                  <span>Subtotal</span><span>£{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-gray">
                  <span>Delivery</span>
                  <span className={delivery === 0 ? "text-green-600 font-600" : ""}>{delivery === 0 ? "FREE" : `£${delivery.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-display font-800 text-brand-black text-base pt-2 border-t border-brand-border">
                  <span>Total</span><span>£{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
