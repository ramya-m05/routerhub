import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

// ✅ Load ONCE at init (not in useEffect) — prevents wipe bug
const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {

  // ✅ Lazy initial state — reads localStorage before first render
  const [cart, setCart] = useState(loadCart);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    if (!product) return;
    setCart((prevCart) => {
      const exists = prevCart.find(item => item._id === product._id);
      if (exists) {
        return prevCart.map(item =>
          item._id === product._id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const increaseQty = (id) => {
    setCart(prev =>
      prev.map(item =>
        item._id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart(prev =>
      prev.map(item =>
        item._id === id && item.qty > 1
          ? { ...item, qty: item.qty - 1 }
          : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      increaseQty,
      decreaseQty,
      removeFromCart,
      clearCart, // ✅ added — needed after order placed
      total
    }}>
      {children}
    </CartContext.Provider>
  );
};