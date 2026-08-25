import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AccountPage from "./pages/AccountPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";

function RouterOutlet() {
  const { currentPage } = useApp();

  if (currentPage === "admin") {
    return <AdminPage />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {currentPage === "home" && <HomePage />}
        {currentPage === "shop" && <ShopPage />}
        {currentPage === "product" && <ProductDetailPage />}
        {currentPage === "cart" && <CartPage />}
        {currentPage === "checkout" && <CheckoutPage />}
        {currentPage === "account" && <AccountPage />}
        {currentPage === "contact" && <ContactPage />}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RouterOutlet />
    </AppProvider>
  );
}
