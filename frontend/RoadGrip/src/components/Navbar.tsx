import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { ShoppingCart, Search, User, Menu, X, ChevronDown, Package, MapPin, Settings } from "./Icons";
import type { Page, AccountTab } from "../context/AppContext";

const NAV_LINKS: { label: string; page: Page }[] = [
  { label: "Home", page: "home" },
  { label: "Shop", page: "shop" },
  { label: "Contact", page: "contact" },
];

export default function Navbar() {
  const { navigate, currentPage, cartCount, isLoggedIn, isAdmin, user, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleProfileNav(tab?: AccountTab) {
    setProfileDropdownOpen(false);
    setMobileOpen(false);
    navigate("account", undefined, undefined, tab);
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() || "U";

  return (
    <>
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
              {isAdmin && <button onClick={() => navigate("admin")} className="nav-link text-gray-400 text-xs">Admin</button>}
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
            <div className="flex items-center gap-2 ml-auto md:ml-0">
              <button onClick={() => setSearchOpen(!searchOpen)} className="lg:hidden p-2 text-gray-300 hover:text-white transition">
                <Search size={18} />
              </button>

              {/* Profile Option with Dropdown */}
              <div className="relative hidden sm:block" ref={dropdownRef}>
                {isLoggedIn ? (
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/15 text-white transition text-sm font-display font-600 border border-white/10"
                    id="profile-dropdown-btn"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-xs font-bold">
                      {initials}
                    </div>
                    <span className="hidden md:inline text-xs">{user.firstName}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("account")}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-display font-600 transition"
                  >
                    <User size={15} />
                    <span>Sign In</span>
                  </button>
                )}

                {/* Dropdown Menu */}
                {profileDropdownOpen && isLoggedIn && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl py-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User summary header */}
                    <div className="px-4 py-3 border-b border-brand-border/60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-red text-white font-display font-bold flex items-center justify-center text-sm">
                          {initials}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-display font-700 text-brand-black text-sm truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-brand-gray truncate">{user.email}</p>
                          <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            {user.loyaltyTier} Member
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Navigation items */}
                    <div className="py-1">
                      <button
                        onClick={() => handleProfileNav("dashboard")}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-display font-600 text-gray-700 hover:bg-brand-light hover:text-brand-red transition text-left"
                      >
                        <User size={15} className="text-gray-400" />
                        <div>
                          <p>Dashboard</p>
                          <span className="text-[10px] text-gray-400 font-normal">Details & overview</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleProfileNav("orders")}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-display font-600 text-gray-700 hover:bg-brand-light hover:text-brand-red transition text-left"
                      >
                        <Package size={15} className="text-gray-400" />
                        <div>
                          <p>My Orders</p>
                          <span className="text-[10px] text-gray-400 font-normal">Tracking & order history</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleProfileNav("addresses")}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-display font-600 text-gray-700 hover:bg-brand-light hover:text-brand-red transition text-left"
                      >
                        <MapPin size={15} className="text-gray-400" />
                        <div>
                          <p>Multiple Addresses</p>
                          <span className="text-[10px] text-gray-400 font-normal">Manage delivery locations</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleProfileNav("settings")}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-display font-600 text-gray-700 hover:bg-brand-light hover:text-brand-red transition text-left"
                      >
                        <Settings size={15} className="text-gray-400" />
                        <div>
                          <p>Account Settings</p>
                          <span className="text-[10px] text-gray-400 font-normal">Name, phone & security</span>
                        </div>
                      </button>
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-brand-border/60 pt-1 mt-1">
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs font-display font-600 text-brand-red hover:bg-red-50 transition text-left"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Button */}
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

              {/* Mobile menu button */}
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
            <div className="px-4 py-4 flex flex-col gap-2">
              {/* Mobile Profile Card */}
              {isLoggedIn ? (
                <div className="bg-white/5 rounded-xl p-3.5 mb-2 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-brand-red text-white font-display font-bold flex items-center justify-center text-sm">
                      {initials}
                    </div>
                    <div>
                      <p className="font-display font-700 text-white text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-display">
                    <button
                      onClick={() => handleProfileNav("dashboard")}
                      className="flex items-center gap-1.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                    >
                      <User size={14} /> Dashboard
                    </button>
                    <button
                      onClick={() => handleProfileNav("orders")}
                      className="flex items-center gap-1.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                    >
                      <Package size={14} /> My Orders
                    </button>
                    <button
                      onClick={() => handleProfileNav("addresses")}
                      className="flex items-center gap-1.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                    >
                      <MapPin size={14} /> Addresses
                    </button>
                    <button
                      onClick={() => handleProfileNav("settings")}
                      className="flex items-center gap-1.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                    >
                      <Settings size={14} /> Settings
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { navigate("account"); setMobileOpen(false); }}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-body font-medium bg-brand-red text-white mb-2"
                >
                  Sign In / Create Account
                </button>
              )}

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

              {isAdmin && <button onClick={() => { navigate("admin"); setMobileOpen(false); }} className="text-left px-3 py-2.5 rounded-lg text-sm font-body font-medium text-gray-400 hover:bg-white/10 hover:text-white transition">Admin</button>}

              {isLoggedIn && (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="text-left px-3 py-2 rounded-lg text-xs font-display font-600 text-brand-red hover:bg-white/5 transition mt-2"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
