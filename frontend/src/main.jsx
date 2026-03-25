import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// 🔥 Cart Context
import { CartProvider } from "./context/CartContext";

// 🔥 Toast Notifications
import { Toaster } from "react-hot-toast";

import { WishlistProvider } from "./context/WishlistContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CartProvider>
      <WishlistProvider>

      {/* 🔥 Toast UI */}
      <Toaster position="top-right" reverseOrder={false} />

      <App />
      </WishlistProvider>
    </CartProvider>
  </StrictMode>
);