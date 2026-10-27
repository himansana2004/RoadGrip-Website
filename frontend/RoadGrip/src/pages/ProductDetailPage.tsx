import { useState } from "react";
import { useApp } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import StarRating from "../components/StarRating";
import { ChevronRight, Plus, Minus, ShoppingCart, Truck, Shield, RotateCcw, Check } from "../components/Icons";

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1616788902258-138db56fe7e5?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1444947295498-07f60c19a4ff?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1606664914460-b667528c1acc?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1611633859589-7990d2fbb56b?w=800&h=600&fit=crop&auto=format",
];

export default function ProductDetailPage() {
  const { selectedProductId, navigate, addToCart, products } = useApp();
  const product = products.find((p) => p.id === selectedProductId) ?? products[0];
  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-brand-gray">No products are available yet.</div>;
  }
  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const stockColor = product.stock > 20 ? "text-green-600" : product.stock > 5 ? "text-yellow-600" : "text-brand-red";
  const stockLabel = product.stock > 20 ? "In Stock" : product.stock > 5 ? `Only ${product.stock} left` : `Low stock — ${product.stock} left`;

  const images = [product.image, ...GALLERY_IMAGES.slice(1)];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-brand-light border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-brand-gray flex-wrap">
            <button onClick={() => navigate("home")} className="hover:text-brand-red transition">Home</button>
            <ChevronRight size={12} />
            <button onClick={() => navigate("shop")} className="hover:text-brand-red transition">Shop</button>
            <ChevronRight size={12} />
            <span className="text-brand-black font-medium">{product.brand} {product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="hidden sm:flex flex-col gap-2 w-20 shrink-0">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition ${
                    activeImage === i ? "border-brand-red" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            {/* Main image */}
            <div className="flex-1 bg-brand-light rounded-2xl overflow-hidden aspect-square relative">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.isNew && (
                <span className="absolute top-4 left-4 badge badge-red">NEW ARRIVAL</span>
              )}
              {product.isBestseller && (
                <span className="absolute top-4 left-4 badge" style={{ background: "#111111", color: "#FFFFFF" }}>BESTSELLER</span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <p className="text-brand-red font-display font-600 text-sm uppercase tracking-wider">{product.brand}</p>
            <h1 className="font-display font-800 text-brand-black text-3xl sm:text-4xl mt-1 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <StarRating rating={product.rating} size="md" showValue reviewCount={product.reviewCount} />
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-5">
              <span className="font-display font-900 text-brand-red text-4xl">Rs {product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-gray-400 line-through text-lg">Rs {product.originalPrice.toFixed(2)}</span>
                  <span className="badge badge-red">
                    Save Rs {(product.originalPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>
            <p className={`text-sm font-display font-600 mt-2 ${stockColor}`}>● {stockLabel}</p>

            {/* Size */}
            <div className="mt-5 bg-brand-light rounded-xl p-4">
              <p className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-2">Tyre Size</p>
              <p className="font-display font-700 text-brand-black text-2xl">{product.size}</p>
              <p className="text-xs text-brand-gray mt-1">{product.width}mm width · {product.aspectRatio}% profile · R{product.rimDiameter}" rim</p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center border border-brand-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-11 h-11 flex items-center justify-center text-brand-gray hover:bg-brand-light transition"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-display font-700 text-brand-black">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="w-11 h-11 flex items-center justify-center text-brand-gray hover:bg-brand-light transition"
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="text-xs text-brand-gray">{qty > 1 ? `Rs ${(product.price * qty).toFixed(2)} total` : ""}</p>
            </div>

            {/* CTAs */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleAddToCart}
                className={`btn-primary flex-1 justify-center text-base py-3.5 ${added ? "!bg-green-600" : ""}`}
              >
                {added ? <><Check size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart</>}
              </button>
              <button
                onClick={() => { addToCart(product, qty); navigate("checkout"); }}
                className="btn-secondary flex-1 justify-center text-base py-3.5 rounded-full"
              >
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: Truck, text: "Free delivery over Rs 150" },
                { icon: Shield, text: "Genuine product guaranteed" },
                { icon: RotateCcw, text: "14-day returns" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 text-center bg-brand-light rounded-xl p-3">
                  <Icon size={18} className="text-brand-red" />
                  <p className="text-xs text-brand-gray leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-14">
          <div className="flex border-b border-brand-border gap-0">
            {([
              { id: "desc", label: "Description" },
              { id: "specs", label: "Specifications" },
              { id: "reviews", label: `Reviews (${product.reviewCount})` },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-5 py-3 text-sm font-display font-600 border-b-2 -mb-px transition ${
                  tab === t.id
                    ? "border-brand-red text-brand-red"
                    : "border-transparent text-brand-gray hover:text-brand-black"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="py-8">
            {tab === "desc" && (
              <div className="max-w-2xl">
                <p className="text-brand-gray leading-relaxed">{product.description}</p>
                <ul className="mt-6 space-y-2">
                  {["Superior wet and dry grip performance", "Long-lasting tread life", "Reduced rolling resistance for fuel efficiency", "OE-approved by leading manufacturers", "Available in a wide range of sizes"].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-brand-gray">
                      <Check size={16} className="text-brand-red mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === "specs" && (
              <div className="max-w-xl">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ["Brand", product.brand],
                      ["Model", product.name],
                      ["Category", `${product.category} Tyres`],
                      ["Tyre Size", product.size],
                      ["Width", `${product.width} mm`],
                      ["Aspect Ratio", `${product.aspectRatio}%`],
                      ["Rim Diameter", `${product.rimDiameter}"`],
                      ["Load Index", product.loadIndex],
                      ["Speed Rating", product.speedRating],
                      ["Construction", "Radial"],
                      ["Season", "Summer"],
                    ].map(([label, value]) => (
                      <tr key={label} className="border-b border-brand-border">
                        <td className="py-3 pr-4 font-display font-600 text-brand-black w-1/3">{label}</td>
                        <td className="py-3 text-brand-gray">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "reviews" && (
              <div className="space-y-8">
                {/* Summary */}
                <div className="flex items-center gap-8 bg-brand-light rounded-2xl p-6 max-w-lg">
                  <div className="text-center">
                    <p className="font-display font-900 text-brand-black text-5xl">{product.rating}</p>
                    <StarRating rating={product.rating} size="md" />
                    <p className="text-xs text-brand-gray mt-1">{product.reviewCount} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((s) => (
                      <div key={s} className="flex items-center gap-2 text-xs">
                        <span className="text-brand-gray w-2">{s}</span>
                        <span className="text-yellow-400 text-xs">★</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-red rounded-full"
                            style={{ width: `${[70, 20, 6, 2, 2][5 - s]}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-brand-gray">Customer reviews will appear here after they are added by the store.</p>

                {/* Write review */}
                <div className="border border-brand-border rounded-xl p-6 max-w-lg">
                  <h3 className="font-display font-700 text-brand-black mb-4">Write a Review</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Your Name</label>
                      <input
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                        className="input-field"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                            className={`text-2xl transition ${s <= reviewForm.rating ? "text-yellow-400" : "text-gray-200"}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Your Review</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="input-field min-h-24 resize-none"
                        placeholder="Share your experience with this tyre..."
                      />
                    </div>
                    <button className="btn-primary">Submit Review</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-12 pt-12 border-t border-brand-border">
            <h2 className="section-title font-display text-2xl font-800 mb-8">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
