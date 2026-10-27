import { useState } from "react";
import { useApp } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import StarRating from "../components/StarRating";
import { ChevronRight, Truck, Shield, RotateCcw, Phone } from "../components/Icons";

const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1601411101851-ea0e07766235?w=1920&h=900&fit=crop&auto=format",
    headline: "Grip the Road.\nOwn Every Corner.",
    sub: "Premium tyres for every vehicle. Expert advice, fast delivery, nationwide fitting.",
    cta: "Shop All Tyres",
  },
  {
    image: "https://images.unsplash.com/photo-1616788902258-138db56fe7e5?w=1920&h=900&fit=crop&auto=format",
    headline: "Performance\nWithout Compromise.",
    sub: "Michelin, Pirelli, Continental and more — at unbeatable prices.",
    cta: "View Best Sellers",
  },
];

const CATEGORIES = [
  {
    name: "Car Tyres",
    count: "Browse available tyres",
    image: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&h=400&fit=crop&auto=format",
    cat: "Car",
  },
  {
    name: "SUV Tyres",
    count: "Browse available tyres",
    image: "https://images.unsplash.com/photo-1627490600102-5c1d45491d57?w=600&h=400&fit=crop&auto=format",
    cat: "SUV",
  },
  {
    name: "Bike Tyres",
    count: "Browse available tyres",
    image: "https://images.unsplash.com/photo-1761092992664-60c73c46c4ca?w=600&h=400&fit=crop&auto=format",
    cat: "Bike",
  },
  {
    name: "Van Tyres",
    count: "Browse available tyres",
    image: "https://images.unsplash.com/photo-1624339024061-b435d9261c1d?w=600&h=400&fit=crop&auto=format",
    cat: "Van",
  },
];

const TESTIMONIALS = [
  {
    name: "David Clarke",
    location: "Manchester",
    rating: 5,
    text: "Ordered Sunday evening, tyres arrived Tuesday morning. Fitted same day at my local centre. Absolutely seamless service from Road Grip.",
    avatar: "DC",
  },
  {
    name: "Priya Sharma",
    location: "London",
    rating: 5,
    text: "Best prices I found after checking six different sites. The tyre size guide made it so easy to pick the right ones for my Toyota RAV4.",
    avatar: "PS",
  },
  {
    name: "Tom Whitfield",
    location: "Bristol",
    rating: 4,
    text: "Third time buying from Road Grip. Always great products and fast shipping. The Michelin Pilot Sport 4S transformed my car's handling.",
    avatar: "TW",
  },
];

export default function HomePage() {
  const { navigate, products } = useApp();
  const tyreWidths = [...new Set(products.map((product) => product.width))].sort((a, b) => a - b);
  const tyreProfiles = [...new Set(products.map((product) => product.aspectRatio))].sort((a, b) => a - b);
  const tyreRims = [...new Set(products.map((product) => product.rimDiameter))].sort((a, b) => a - b);
  const [heroSlide, setHeroSlide] = useState(0);
  const [selectedWidth, setSelectedWidth] = useState(String(products[0]?.width ?? ""));
  const [selectedProfile, setSelectedProfile] = useState(String(products[0]?.aspectRatio ?? ""));
  const [selectedRim, setSelectedRim] = useState(String(products[0]?.rimDiameter ?? ""));

  const widthValue = selectedWidth || String(tyreWidths[0] ?? "");
  const profileValue = selectedProfile || String(tyreProfiles[0] ?? "");
  const rimValue = selectedRim || String(tyreRims[0] ?? "");

  const featured = products.filter((p) => p.isBestseller || p.isNew).slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[520px] overflow-hidden bg-brand-black">
        <img
         src={HERO_SLIDES[heroSlide].image}
          alt="Hero tyre"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            <p className="text-brand-red font-display font-600 text-sm uppercase tracking-widest mb-3">
              #1 Tyre Retailer UK
          </p>
            <h1 className="font-display font-900 text-white text-4xl sm:text-5xl lg:text-6xl leading-tight whitespace-pre-line mb-4">
              {HERO_SLIDES[heroSlide].headline}
            </h1>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
              {HERO_SLIDES[heroSlide].sub}
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate("shop")} className="btn-primary text-base px-7 py-3">
                {HERO_SLIDES[heroSlide].cta} <ChevronRight size={18} />
              </button>
              <button onClick={() => navigate("contact")} className="btn-outline text-base px-7 py-3" style={{ color: "#FFFFFF", borderColor: "rgba(255,255,255,0.4)" }}>
                Find a Fitter
              </button>
            </div>
          </div>
        {/* Slide dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              className={`w-8 h-1.5 rounded-full transition-all ${i === heroSlide ? "bg-brand-red w-12" : "bg-white/40"}`}
            />
          ))}
        </div>
      </section>

      {/* Trust bar */}
      <div className="bg-brand-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, label: "Free Delivery", sub: "Orders over Rs 150" },
              { icon: Shield, label: "Genuine Products", sub: "100% authentic brands" },
              { icon: RotateCcw, label: "Easy Returns", sub: "14-day return policy" },
              { icon: Phone, label: "Expert Support", sub: "0775696373" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-red/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-brand-red" />
                </div>
                <div>
                  <p className="font-display font-600 text-white text-sm">{label}</p>
                  <p className="text-gray-400 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shop by Vehicle */}
      <section className="py-12 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="section-title font-display text-2xl sm:text-3xl font-800 mx-auto">
              Find Tyres for Your Vehicle
            </h2>
            <p className="text-brand-gray text-sm mt-4">Enter tyre size to find the perfect match</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 max-w-3xl mx-auto">
            <div>
              <p className="text-xs text-brand-gray text-center mb-3">Search by tyre size</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Width</label>
                  <select value={widthValue} onChange={(e) => setSelectedWidth(e.target.value)} className="input-field text-sm">
                    {tyreWidths.map((width) => <option key={width} value={width}>{width}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Profile</label>
                  <select value={profileValue} onChange={(e) => setSelectedProfile(e.target.value)} className="input-field text-sm">
                    {tyreProfiles.map((profile) => <option key={profile} value={profile}>{profile}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Rim (inch)</label>
                  <select value={rimValue} onChange={(e) => setSelectedRim(e.target.value)} className="input-field text-sm">
                    {tyreRims.map((rim) => <option key={rim} value={rim}>{rim}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <button onClick={() => navigate("shop", undefined, `${widthValue}/${profileValue} R${rimValue}`)} disabled={!widthValue || !profileValue || !rimValue} className="btn-primary w-full justify-center mt-5 text-base py-3 disabled:opacity-50">
              Search Tyres <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title font-display text-2xl sm:text-3xl font-800">Shop by Category</h2>
            </div>
            <button onClick={() => navigate("shop")} className="text-brand-red text-sm font-display font-600 hover:underline hidden sm:flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate("shop")}
                className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-brand-light text-left"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display font-700 text-white text-base sm:text-lg leading-tight">{cat.name}</h3>
                  <p className="text-gray-300 text-xs mt-0.5">{cat.count}</p>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-brand-red text-white text-xs font-display font-600 px-2 py-1 rounded-full">Shop →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title font-display text-2xl sm:text-3xl font-800">Trending Tyres</h2>
              <p className="text-brand-gray text-sm mt-4">Best-sellers and new arrivals — chosen by thousands of drivers</p>
            </div>
            <button onClick={() => navigate("shop")} className="text-brand-red text-sm font-display font-600 hover:underline hidden sm:flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo banner */}
      <section
        className="relative py-20 overflow-hidden"
        style={{ background: "#111111" }}
      >
        <img
          src="https://images.unsplash.com/photo-1527266258038-6ae3e089a609?w=1920&h=600&fit=crop&auto=format"
          alt="Tyres"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="badge badge-red text-sm mb-4 inline-block">Limited Time Offer</span>
          <h2 className="font-display font-900 text-white text-3xl sm:text-5xl mb-4">
            Up to <span className="text-brand-red">30% Off</span> Summer Tyres
          </h2>
          <p className="text-gray-300 text-lg max-w-xl mx-auto mb-8">
            Stock up before the season starts. Premium brands at prices that won't blow your budget.
          </p>
          <button onClick={() => navigate("shop")} className="btn-primary text-base px-8 py-3.5">
            Claim Your Deal <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title font-display text-2xl sm:text-3xl font-800 mx-auto">
              What Our Customers Say
            </h2>
            <p className="text-brand-gray text-sm mt-4">4.8/5 from 12,400+ verified reviews</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-brand-light rounded-xl p-6 relative">
                <div className="text-brand-red text-4xl font-serif leading-none mb-3 opacity-30">"</div>
                <p className="text-brand-black text-sm leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center text-white font-display font-700 text-sm shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-display font-600 text-brand-black text-sm">{t.name}</p>
                    <p className="text-brand-gray text-xs">{t.location}</p>
                  </div>
                  <div className="ml-auto">
                    <StarRating rating={t.rating} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-10 bg-brand-light border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-brand-gray uppercase tracking-widest font-display font-600 mb-6">Authorised Dealer For</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {["Michelin", "Pirelli", "Continental", "Bridgestone", "Goodyear", "Dunlop", "Yokohama", "Hankook"].map((b) => (
              <span key={b} className="font-display font-800 text-brand-gray text-lg sm:text-xl opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
