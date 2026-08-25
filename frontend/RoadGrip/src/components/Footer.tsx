import { useApp } from "../context/AppContext";
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Youtube } from "./Icons";

export default function Footer() {
  const { navigate } = useApp();
  return (
    <footer className="bg-brand-black text-gray-300">
      {/* Newsletter strip */}
      <div className="bg-brand-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-700 text-white text-xl">Get exclusive deals in your inbox</h3>
              <p className="text-red-100 text-sm mt-1">Subscribe for tyre tips, promotions, and seasonal offers.</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 md:w-72 px-4 py-2.5 rounded-full text-sm text-brand-black outline-none focus:ring-2 focus:ring-white"
              />
              <button type="submit" className="btn-secondary rounded-full px-5 py-2.5 text-sm">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center">
                <span className="text-white font-display font-900 text-sm">RG</span>
              </div>
              <span className="font-display font-800 text-white text-xl">
                Road<span className="text-brand-red">Grip</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Your trusted source for premium tyres and automotive accessories. Performance, safety, and value — delivered nationwide.
            </p>
            <div className="flex gap-3 mt-5">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:bg-brand-red hover:text-white transition">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-700 text-white text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Shop All Tyres", page: "shop" as const },
                { label: "Car Tyres", page: "shop" as const },
                { label: "SUV & 4×4 Tyres", page: "shop" as const },
                { label: "Bike Tyres", page: "shop" as const },
                { label: "Van Tyres", page: "shop" as const },
                { label: "My Account", page: "account" as const },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigate(item.page)}
                    className="text-sm text-gray-400 hover:text-brand-red transition flex items-center gap-1"
                  >
                    <span className="text-brand-red text-xs">›</span> {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-700 text-white text-sm uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5">
              {["Track Your Order", "Tyre Size Guide", "Fitting Centres", "Returns Policy", "Warranty Info", "FAQs"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-400 hover:text-brand-red transition flex items-center gap-1">
                    <span className="text-brand-red text-xs">›</span> {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-700 text-white text-sm uppercase tracking-wider mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin size={16} className="text-brand-red mt-0.5 shrink-0" />
                <span>42 Motor Park Road, Birmingham, B12 8QR, United Kingdom</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone size={16} className="text-brand-red shrink-0" />
                <a href="tel:08001234567" className="hover:text-brand-red transition">0800 123 4567</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail size={16} className="text-brand-red shrink-0" />
                <a href="mailto:info@roadgrip.co.uk" className="hover:text-brand-red transition">info@roadgrip.co.uk</a>
              </li>
            </ul>
            <div className="mt-5 bg-white/5 rounded-lg p-3 text-xs text-gray-400">
              <p className="font-semibold text-gray-300 mb-1">Opening Hours</p>
              <p>Mon–Sat: 8:00 AM – 6:00 PM</p>
              <p>Sunday: 10:00 AM – 4:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© 2026 RoadGrip Tyre Shop. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300 transition">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition">Terms & Conditions</a>
            <a href="#" className="hover:text-gray-300 transition">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
