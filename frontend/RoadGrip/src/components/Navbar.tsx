import { useState } from "react";
import { useApp } from "../context/AppContext";
import { ShoppingCart, Search, User, Menu, X } from "./Icons";
import type { Page } from "../context/AppContext";

const NAV_LINKS: { label: string; page: Page }[] = [
  { label: "Home", page: "home" },
  { label: "Shop", page: "shop" },
  { label: "Contact", page: "contact" },
];

export default function Navbar() {
  const { navigate, currentPage, cartCount } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {/* Top strip */}
      <div className="bg-brand-red text-white text-center text-xs py-2 font-body hidden md:block">
        Free delivery on orders over £150 · Nationwide fitting available · Call us: 0800 123 4567
      </div>

      {/* Main navbar */}
      <header className="bg-brand-black sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-6">
            {/* Logo */}
            <button onClick={() => navigate("home")} className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center">
                <span className="text-white font-display font-900 text-sm">RG</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-800 text-white text-lg leading-none tracking-tight">
                  Road<span className="text-brand-red">Grip</span>
                </span>
                <p className="text-gray-400 text-xs leading-none font-body tracking-widest uppercase">Tyre Shop</p>
              </div>
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6 ml-4">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.page}
                  onClick={() => navigate(link.page)}
                  className={`nav-link ${currentPage === link.page ? "active" : ""}`}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => navigate("admin")}
                className="nav-link text-gray-400 text-xs"
              >
                Admin
              </button>
            </nav>

            {/* Search bar - desktop */}
            <div className="hidden lg:flex flex-1 max-w-sm ml-auto">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search tyres, brands, sizes..."
                  className="w-full bg-white/10 text-white placeholder-gray-400 text-sm rounded-full px-4 py-2 pr-10 border border-white/10 focus:outline-none focus:border-brand-red focus:bg-white/15 transition"
                />
                <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1 ml-auto md:ml-0">
              <button onClick={() => setSearchOpen(!searchOpen)} className="lg:hidden p-2 text-gray-300 hover:text-white transition">
                <Search size={18} />
              </button>
              <button onClick={() => navigate("account")} className="p-2 text-gray-300 hover:text-white transition hidden sm:flex">
                <User size={18} />
              </button>
              <button
                onClick={() => navigate("cart")}
                className="relative p-2 text-gray-300 hover:text-white transition"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-red text-white text-xs font-display font-700 w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-white transition"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          {searchOpen && (
            <div className="lg:hidden pb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tyres, brands, sizes..."
                  className="w-full bg-white/10 text-white placeholder-gray-400 text-sm rounded-full px-4 py-2 pr-10 border border-white/10 focus:outline-none focus:border-brand-red"
                />
                <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#1a1a1a] border-t border-white/10">
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.page}
                  onClick={() => { navigate(link.page); setMobileOpen(false); }}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm font-body font-medium transition ${
                    currentPage === link.page
                      ? "bg-brand-red text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => { navigate("account"); setMobileOpen(false); }}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-body font-medium text-gray-300 hover:bg-white/10 hover:text-white transition"
              >
                Account
              </button>
              <button
                onClick={() => { navigate("admin"); setMobileOpen(false); }}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-body font-medium text-gray-400 hover:bg-white/10 hover:text-white transition"
              >
                Admin
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
