import { useState } from "react";
import { Phone, Mail, MapPin, Check } from "../components/Icons";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-brand-black py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-display font-800 text-white text-3xl sm:text-4xl mb-3">
            Get in <span className="text-brand-red">Touch</span>
          </h1>
          <p className="text-gray-300 text-base max-w-xl mx-auto">
            Our tyre experts are ready to help. Whether it's advice, a quote, or a fitting enquiry — we're here.
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="bg-brand-light border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Phone,
                label: "Call Us",
                value: "0800 123 4567",
                sub: "Mon–Sat 8am–6pm · Sun 10am–4pm",
                href: "tel:08001234567",
              },
              {
                icon: Mail,
                label: "Email Us",
                value: "info@roadgrip.co.uk",
                sub: "We respond within 24 hours",
                href: "mailto:info@roadgrip.co.uk",
              },
              {
                icon: MapPin,
                label: "Visit Us",
                value: "42 Motor Park Road",
                sub: "Birmingham, B12 8QR",
                href: "#map",
              },
            ].map(({ icon: Icon, label, value, sub, href }) => (
              <a
                key={label}
                href={href}
                className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition group"
              >
                <div className="w-11 h-11 bg-brand-red/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand-red transition">
                  <Icon size={20} className="text-brand-red group-hover:text-white transition" />
                </div>
                <div>
                  <p className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide">{label}</p>
                  <p className="font-display font-700 text-brand-black text-sm mt-0.5">{value}</p>
                  <p className="text-xs text-brand-gray mt-0.5">{sub}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <h2 className="section-title font-display text-2xl font-800 mb-8">Send a Message</h2>
            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={24} className="text-green-600" />
                </div>
                <h3 className="font-display font-700 text-green-800 text-lg mb-1">Message Sent!</h3>
                <p className="text-green-700 text-sm">
                  Thanks for reaching out. One of our team will be in touch within 24 hours.
                </p>
                <button onClick={() => setSent(false)} className="btn-outline mt-5 text-sm" style={{ color: "#166534", borderColor: "#166534" }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Full Name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field"
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Email</label>
                    <input
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      type="email"
                      className="input-field"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select a topic...</option>
                    <option>Tyre Advice & Recommendations</option>
                    <option>Order Enquiry</option>
                    <option>Fitting Centre Locations</option>
                    <option>Returns & Refunds</option>
                    <option>Bulk / Trade Orders</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-display font-600 text-brand-gray uppercase tracking-wide mb-1.5 block">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="input-field min-h-32 resize-none"
                    placeholder="Describe your enquiry in detail..."
                    required
                  />
                </div>
                <button type="submit" className="btn-primary text-base px-8 py-3">
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Map + Hours */}
          <div className="space-y-6">
            {/* Map placeholder */}
            <div id="map" className="rounded-2xl overflow-hidden shadow-sm h-72 bg-gray-200 relative">
              <img
                src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&h=500&fit=crop&auto=format"
                alt="Map location"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-2 shadow-lg">
                  <MapPin size={18} className="text-brand-red" />
                  <div>
                    <p className="font-display font-700 text-brand-black text-sm">RoadGrip Tyre Shop</p>
                    <p className="text-xs text-brand-gray">42 Motor Park Road, Birmingham</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-brand-light rounded-2xl p-6">
              <h3 className="font-display font-700 text-brand-black mb-4">Opening Hours</h3>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ["Monday – Friday", "8:00 AM – 6:00 PM"],
                    ["Saturday", "8:00 AM – 5:00 PM"],
                    ["Sunday", "10:00 AM – 4:00 PM"],
                    ["Bank Holidays", "10:00 AM – 2:00 PM"],
                  ].map(([day, hours]) => (
                    <tr key={day} className="border-b border-brand-border last:border-0">
                      <td className="py-2.5 font-display font-600 text-brand-black pr-4">{day}</td>
                      <td className="py-2.5 text-brand-gray">{hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FAQ snippet */}
            <div className="bg-white border border-brand-border rounded-2xl p-5">
              <h3 className="font-display font-700 text-brand-black mb-3 text-sm">Quick Answers</h3>
              {[
                { q: "Do you offer mobile tyre fitting?", a: "Yes — we fit at your home or workplace, 7 days a week." },
                { q: "How long does delivery take?", a: "Next business day for orders placed before 2pm." },
              ].map(({ q, a }) => (
                <div key={q} className="py-3 border-b border-brand-border last:border-0">
                  <p className="font-display font-600 text-brand-black text-sm">{q}</p>
                  <p className="text-brand-gray text-xs mt-1">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
