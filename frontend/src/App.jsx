import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { CartProvider }     from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute     from "./components/AdminRoute";
import WhatsAppButton from "./components/WhatsAppButton";

// Main pages
import Home           from "./pages/Home";
import Store          from "./pages/Store";
import Login          from "./pages/Login";
import Signup         from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Cart           from "./pages/Cart";
import Checkout       from "./pages/Checkout";
import Orders         from "./pages/Orders";
import OrderHistory   from "./pages/OrderHistory";
import Profile        from "./pages/Profile";
import Wishlist       from "./pages/Wishlist";
import ProductDetails from "./pages/ProductDetails";

// Admin pages
import AdminLogin     from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders    from "./pages/AdminOrders";

// Info pages
import About              from "./pages/About";
import PrivacyPolicy      from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import Support            from "./pages/Support";
import Refund             from "./pages/Refund";
import Cancellation       from "./pages/Cancellation";  

function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: "600",
                fontSize: "14px",
                borderRadius: "10px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              },
              success: { iconTheme: { primary: "#FEE12B", secondary: "#111" } },
            }}
          />

          <Routes>
            {/* ── Public ── */}
            <Route path="/"                element={<Home />} />
            <Route path="/store"           element={<Store />} />
            <Route path="/product/:id"     element={<ProductDetails />} />
            <Route path="/login"           element={<Login />} />
            <Route path="/signup"          element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/login"     element={<AdminLogin />} />

            {/* ── Info pages (public) ── */}
            <Route path="/about"   element={<About />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms"   element={<TermsAndConditions />} />
            <Route path="/support" element={<Support />} />
            <Route path="/refund" element={<Refund />} />
<Route path="/cancellation" element={<Cancellation />} />
            {/* ── Protected user routes ── */}
            <Route path="/cart"          element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout"      element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders"        element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
            <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/wishlist"      element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

            {/* ── Admin routes ── */}
            <Route path="/admin"        element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Floating WhatsApp button on every page */}
          <WhatsAppButton />
        </Router>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;