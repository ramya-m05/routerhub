import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { getUser, getToken } from "./utils/auth";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import WhatsAppButton from "./components/WhatsAppButton";

import Home from "./pages/Home";
import Store from "./pages/Store";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderHistory from "./pages/OrderHistory";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import ProductDetails from "./pages/ProductDetails";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";

function App() {
  const token = getToken();
  const user = getUser();

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
          {/* ── Routes ── */}
        

          <Routes>
            {/* ── Public ── */}
            <Route path="/" element={<Home />} />
            <Route path="/store" element={<Store />} />
            <Route path="/product/:id" element={<ProductDetails />} />

            {/* Login */}
            <Route
              path="/login"
              element={
                token ? <Navigate to="/store" replace /> : <Login />
              }
            />

            {/* Signup */}
            <Route
              path="/signup"
              element={
                token ? <Navigate to="/store" replace /> : <Signup />
              }
            />

            {/* Forgot Password */}
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Admin Login */}
            <Route
              path="/admin/login"
              element={
                token && user?.role === "admin"
                  ? <Navigate to="/admin" replace />
                  : <AdminLogin />
              }
            />

            {/* ── Protected ── */}
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

            {/* ── Admin ── */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />

            {/* ── Fallback ── */}
            <Route
              path="*"
              element={
                token
                  ? <Navigate to="/store" replace />
                  : <Navigate to="/" replace />
              }
            />
          </Routes>

          <WhatsAppButton />
        </Router>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;