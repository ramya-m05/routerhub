import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {

  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ✅ ADD TO CART
  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(p => p._id === product._id);
      if (exists) {
        return prev.map(p =>
          p._id === product._id
            ? { ...p, qty: p.qty + 1 }
            : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // ✅ INCREASE
  const increaseQty = (id) => {
    setCart(prev =>
      prev.map(item =>
        item._id === id
          ? { ...item, qty: item.qty + 1 }
          : item
      )
    );
  };

  // ✅ DECREASE
  const decreaseQty = (id) => {
    setCart(prev =>
      prev
        .map(item =>
          item._id === id
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter(item => item.qty > 0) // remove if 0
    );
  };

  // ✅ REMOVE
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };
  const clearCart = () => {
  setCart([]);
  localStorage.removeItem("cart");
};

  return (
    <CartContext.Provider value={{
      cart,
      setCart,
      addToCart,
      increaseQty,
      decreaseQty,
      removeFromCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}