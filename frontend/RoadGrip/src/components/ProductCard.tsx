import type { Product } from "../data/products";
import StarRating from "./StarRating";
import { useApp } from "../context/AppContext";
import { ShoppingCart } from "./Icons";

interface ProductCardProps {
  product: Product;
  layout?: "grid" | "list";
}

export default function ProductCard({ product, layout = "grid" }: ProductCardProps) {
  const { addToCart, navigate } = useApp();

  if (layout === "list") {
    return (
      <div className="product-card flex gap-4 p-4">
        <button onClick={() => navigate("product", product.id)} className="shrink-0 w-32 h-32 bg-brand-light rounded-lg overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-brand-gray font-medium uppercase tracking-wide">{product.brand}</p>
              <button onClick={() => navigate("product", product.id)} className="text-left">
                <h3 className="font-display font-600 text-brand-black text-base leading-tight hover:text-brand-red transition-colors">
                  {product.name}
                </h3>
              </button>
              <p className="text-xs text-brand-gray mt-0.5">{product.size}</p>
              <StarRating rating={product.rating} size="sm" showValue reviewCount={product.reviewCount} />
            </div>
            <div className="text-right shrink-0">
              <p className="font-display font-700 text-brand-red text-lg">£{product.price.toFixed(2)}</p>
              {product.originalPrice && (
                <p className="text-xs text-gray-400 line-through">£{product.originalPrice.toFixed(2)}</p>
              )}
            </div>
          </div>
          <button onClick={() => addToCart(product)} className="btn-primary mt-3 text-sm py-2">
            <ShoppingCart size={14} /> Add to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-card group">
      <div className="relative overflow-hidden bg-brand-light h-48">
        <button onClick={() => navigate("product", product.id)} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </button>
        {product.isNew && (
          <span className="absolute top-2 left-2 badge badge-red">NEW</span>
        )}
        {product.isBestseller && !product.isNew && (
          <span className="absolute top-2 left-2 badge" style={{ background: "#111111", color: "#FFFFFF" }}>BESTSELLER</span>
        )}
        {product.originalPrice && (
          <span className="absolute top-2 right-2 badge badge-red">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-brand-gray font-medium uppercase tracking-wide">{product.brand}</p>
        <button onClick={() => navigate("product", product.id)} className="text-left w-full">
          <h3 className="font-display font-semibold text-brand-black text-sm leading-snug mt-0.5 hover:text-brand-red transition-colors line-clamp-2">
            {product.name}
          </h3>
        </button>
        <p className="text-xs text-gray-400 mt-0.5">{product.size}</p>
        <div className="mt-1.5">
          <StarRating rating={product.rating} size="sm" showValue reviewCount={product.reviewCount} />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="font-display font-700 text-brand-red text-base">£{product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through ml-1.5">£{product.originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => addToCart(product)}
          className="btn-primary w-full justify-center mt-3 text-sm py-2.5"
        >
          <ShoppingCart size={14} /> Add to Cart
        </button>
      </div>
    </div>
  );
}
