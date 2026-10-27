import { useState } from "react";
import { useApp } from "../context/AppContext";
import { ChevronRight, Plus, Minus, Trash, ShoppingCart } from "../components/Icons";

export default function CartPage() {
  const { cart, removeFromCart, updateQty, navigate, cartTotal } = useApp();
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const delivery = cartTotal >= 150 ? 0 : 9.99;
  const discount = promoApplied ? cartTotal * 0.1 : 0;
  const total = cartTotal + delivery - discount;

  function applyPromo() {
    if (promo.toUpperCase() === "ROADGRIP10") {
      setPromoApplied(true);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center">
          <ShoppingCart size={32} className="text-brand-gray" />
        </div>
        <div>
          <h2 className="font-display font-700 text-2xl text-brand-black mb-2">Your cart is empty</h2>
          <p className="text-brand-gray text-sm">Looks like you haven't added any tyres yet.</p>
        </div>
        <button onClick={() => navigate("shop")} className="btn-primary">
          Browse Tyres
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-brand-gray">
            <button onClick={() => navigate("home")} className="hover:text-brand-red transition">Home</button>
            <ChevronRight size={12} />
            <span className="text-brand-black font-medium">Shopping Cart</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display font-800 text-brand-black text-2xl sm:text-3xl mb-8">
          Shopping Cart <span className="text-brand-gray font-body font-400 text-lg">({cart.length} {cart.length === 1 ? "item" : "items"})</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(({ product, quantity }) => (
              <div key={product.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm flex gap-4">
                <button
                  onClick={() => navigate("product", product.id)}
                  className="w-24 h-24 sm:w-28 sm:h-28 bg-brand-light rounded-xl overflow-hidden shrink-0"
                >
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-brand-red font-display font-600 uppercase tracking-wide">{product.brand}</p>
                      <button onClick={() => navigate("product", product.id)}>
                        <h3 className="font-display font-700 text-brand-black text-base hover:text-brand-red transition leading-snug">
                          {product.name}
                        </h3>
                      </button>
                      <p className="text-xs text-brand-gray mt-0.5">{product.size} · {product.category} Tyre</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-gray-300 hover:text-brand-red transition p-1 shrink-0"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                    {/* Quantity stepper */}
                    <div className="flex items-center border border-brand-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQty(product.id, quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center text-brand-gray hover:bg-brand-light transition"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-display font-700 text-brand-black text-sm">{quantity}</span>
                      <button
                        onClick={() => updateQty(product.id, quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center text-brand-gray hover:bg-brand-light transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-700 text-brand-red text-lg">Rs {(product.price * quantity).toFixed(2)}</p>
                      {quantity > 1 && <p className="text-xs text-gray-400">Rs {product.price.toFixed(2)} each</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => navigate("shop")}
              className="text-brand-red text-sm font-display font-600 hover:underline flex items-center gap-1 mt-2"
            >
              ← Continue Shopping
            </button>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="font-display font-700 text-brand-black text-lg mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-brand-gray">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>Rs {cartTotal.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo (ROADGRIP10)</span>
                    <span>-Rs {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-brand-gray">
                  <span>Delivery</span>
                  <span className={delivery === 0 ? "text-green-600 font-600" : ""}>
                    {delivery === 0 ? "FREE" : `Rs ${delivery.toFixed(2)}`}
                  </span>
                </div>
                {delivery > 0 && (
                  <p className="text-xs text-brand-gray">Add Rs {(150 - cartTotal).toFixed(2)} more for free delivery</p>
                )}
                <div className="border-t border-brand-border pt-3 flex justify-between font-display font-800 text-brand-black text-lg">
                  <span>Total</span>
                  <span>Rs {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo code */}
              <div className="mt-5">
                <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="Enter code..."
                    className="input-field flex-1 text-sm"
                    disabled={promoApplied}
                  />
                  <button
                    onClick={applyPromo}
                    disabled={promoApplied}
                    className="btn-secondary rounded-lg text-sm px-3 py-2"
                  >
                    {promoApplied ? "✓" : "Apply"}
                  </button>
                </div>
                {!promoApplied && <p className="text-xs text-brand-gray mt-1">Try: ROADGRIP10</p>}
                {promoApplied && <p className="text-xs text-green-600 mt-1">✓ 10% discount applied</p>}
              </div>

              <button
                onClick={() => navigate("checkout")}
                className="btn-primary w-full justify-center text-base py-3.5 mt-5"
              >
                Proceed to Checkout <ChevronRight size={18} />
              </button>

              <div className="mt-4 flex items-center justify-center gap-4">
                {["VISA", "MC", "AMEX", "PayPal"].map((m) => (
                  <span key={m} className="text-xs font-display font-700 text-gray-400 bg-brand-light px-2 py-1 rounded">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
