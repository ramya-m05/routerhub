import { createContext, useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";

export const WishlistContext = createContext();

// ✅ Load once at init — lazy initialization pattern
const loadWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  } catch {
    return [];
  }
};

export const WishlistProvider = ({ children }) => {
  // ✅ Lazy initial state
  const [wishlist, setWishlist] = useState(loadWishlist);

  // ✅ Save on every change
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product) => {
    const exists = wishlist.find((i) => i._id === product._id);
    if (exists) {
      toast("Already in wishlist ❤️");
      return;
    }
    setWishlist((prev) => [...prev, product]);
    toast.success("Added to wishlist ❤️");
  };

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((i) => i._id !== id));
    toast.success("Removed from wishlist");
  };

  const isInWishlist = (id) => wishlist.some((i) => i._id === id);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// ✅ Custom hook
export const useWishlist = () => useContext(WishlistContext);