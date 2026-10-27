import { useState } from "react";
import ProductCard from "../components/ProductCard";
import { useApp } from "../context/AppContext";
import { Search, Grid, List, ChevronRight, ChevronDown } from "../components/Icons";

export default function ShopPage() {
  const { navigate, shopSearch, products } = useApp();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("popular");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [search, setSearch] = useState(shopSearch);
  const [minRating, setMinRating] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const maxCatalogPrice = Math.max(100000, ...products.map((product) => product.price));
  const requestedSize = search.match(/^\s*(\d+)\s*\/\s*(\d+)\s*R\s*(\d+)\s*$/i);
  const brandOptions = [...new Map(products
    .map((product) => [product.brand.trim().toLowerCase(), product.brand.trim()] as const)
    .filter(([key, value]) => key && value)).values()]
    .sort((a, b) => a.localeCompare(b));
  const categoryOptions = [...new Map(products
    .map((product) => [product.category.trim().toLowerCase(), product.category.trim()] as const)
    .filter(([key, value]) => key && value)).values()]
    .sort((a, b) => a.localeCompare(b));

  const toggleBrand = (b: string) =>
    setSelectedBrands((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);
  const toggleCat = (c: string) =>
    setSelectedCats((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  let filtered = products.filter((p) => {
    if (selectedBrands.length && !selectedBrands.some((brand) => brand.toLowerCase() === p.brand.trim().toLowerCase())) return false;
    if (selectedCats.length && !selectedCats.some((category) => category.toLowerCase() === p.category.trim().toLowerCase())) return false;
    if (priceMax !== null && p.price > priceMax) return false;
    if (p.rating < minRating) return false;
    if (requestedSize) {
      if (p.width !== Number(requestedSize[1]) || p.aspectRatio !== Number(requestedSize[2]) || p.rimDiameter !== Number(requestedSize[3])) return false;
    } else if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.brand.toLowerCase().includes(search.toLowerCase()) && !p.category.toLowerCase().includes(search.toLowerCase()) && !p.size.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return b.reviewCount - a.reviewCount;
  });

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const Sidebar = () => (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      {/* Category filter */}
      <div>
        <h3 className="font-display font-700 text-brand-black text-sm uppercase tracking-wide mb-3">Vehicle Type</h3>
        {categoryOptions.map((c) => (
          <label key={c} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedCats.includes(c)}
              onChange={() => toggleCat(c)}
              className="w-4 h-4 rounded border-brand-border accent-brand-red"
            />
            <span className="text-sm text-brand-gray group-hover:text-brand-black transition">{c} Tyres</span>
            <span className="ml-auto text-xs text-gray-400">{products.filter((p) => p.category.trim().toLowerCase() === c.toLowerCase()).length}</span>
          </label>
        ))}
      </div>

      <div className="border-t border-brand-border" />

      {/* Brand filter */}
      <div>
        <h3 className="font-display font-700 text-brand-black text-sm uppercase tracking-wide mb-3">Brand</h3>
        {brandOptions.map((b) => (
          <label key={b} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedBrands.includes(b)}
              onChange={() => toggleBrand(b)}
              className="w-4 h-4 rounded border-brand-border accent-brand-red"
            />
            <span className="text-sm text-brand-gray group-hover:text-brand-black transition">{b}</span>
          </label>
        ))}
      </div>

      <div className="border-t border-brand-border" />

      {/* Price filter */}
      <div>
        <h3 className="font-display font-700 text-brand-black text-sm uppercase tracking-wide mb-3">
          Price Range <span className="text-brand-red font-body font-normal">up to Rs {(priceMax ?? maxCatalogPrice).toLocaleString()}</span>
        </h3>
        <input
          type="range"
          min={0}
          max={maxCatalogPrice}
          value={priceMax ?? maxCatalogPrice}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full accent-brand-red"
        />
        <div className="flex justify-between text-xs text-brand-gray mt-1">
          <span>Rs 0</span><span>Rs {maxCatalogPrice.toLocaleString()}</span>
        </div>
      </div>

      <div className="border-t border-brand-border" />

      {/* Rating filter */}
      <div>
        <h3 className="font-display font-700 text-brand-black text-sm uppercase tracking-wide mb-3">Min Rating</h3>
        {[4.5, 4.0, 3.5].map((r) => (
          <label key={r} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
            <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} className="w-4 h-4 accent-brand-red" />
            <span className="text-sm text-brand-gray flex items-center gap-1">
              {"★".repeat(Math.floor(r))}{"☆".repeat(5 - Math.floor(r))}
              <span className="text-xs text-gray-400">({r}+)</span>
            </span>
          </label>
        ))}
      </div>

      {(selectedBrands.length > 0 || selectedCats.length > 0 || minRating > 0 || priceMax !== null) && (
        <button
          onClick={() => { setSelectedBrands([]); setSelectedCats([]); setMinRating(0); setPriceMax(null); }}
          className="text-sm text-brand-red font-display font-600 hover:underline"
        >
          Clear all filters
        </button>
      )}
    </aside>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-brand-light border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-brand-gray">
            <button onClick={() => navigate("home")} className="hover:text-brand-red transition">Home</button>
            <ChevronRight size={12} />
            <span className="text-brand-black font-medium">Shop</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-brand-gray font-medium whitespace-nowrap">Sort:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field text-sm w-auto"
            >
              <option value="popular">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
          <div className="flex items-center gap-1 border border-brand-border rounded-lg p-1">
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 rounded ${view === "grid" ? "bg-brand-red text-white" : "text-brand-gray hover:text-brand-black"}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded ${view === "list" ? "bg-brand-red text-white" : "text-brand-gray hover:text-brand-black"}`}
            >
              <List size={16} />
            </button>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden btn-outline text-sm py-2 px-4"
          >
            Filters {selectedBrands.length + selectedCats.length > 0 && `(${selectedBrands.length + selectedCats.length})`}
            <ChevronDown size={14} />
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar desktop */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Mobile sidebar */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-700 text-brand-black">Filters</h2>
                  <button onClick={() => setSidebarOpen(false)} className="text-brand-gray hover:text-brand-black">✕</button>
                </div>
                <Sidebar />
              </div>
            </div>
          )}

          {/* Products */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-brand-gray mb-4">{filtered.length} products found</p>
            {paged.length === 0 ? (
              <div className="text-center py-16 text-brand-gray">
                <p className="text-4xl mb-4">🔍</p>
                <p className="font-display font-600 text-lg text-brand-black mb-1">No tyres found</p>
                <p className="text-sm">Try adjusting your filters or search term.</p>
              </div>
            ) : (
              <div className={
                view === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5"
                  : "flex flex-col gap-4"
              }>
                {paged.map((product) => (
                  <ProductCard key={product.id} product={product} layout={view} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 rounded-lg border border-brand-border text-sm font-display font-600 disabled:opacity-30 hover:border-brand-red hover:text-brand-red transition"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-display font-600 transition ${
                      p === currentPage
                        ? "bg-brand-red text-white border border-brand-red"
                        : "border border-brand-border hover:border-brand-red hover:text-brand-red"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 rounded-lg border border-brand-border text-sm font-display font-600 disabled:opacity-30 hover:border-brand-red hover:text-brand-red transition"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
