import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/useIsMobile";

const CATEGORIES = ["All", "Router", "Fiber Cable", "Fiber Tools", "Security", "Streaming Device"];

function Store() {
  const { cart, addToCart, increaseQty, decreaseQty } = useContext(CartContext);
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSelectedCategory(params.get("category") || "All");
  }, [location]);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

 const filtered = products
  .filter(
    p =>
      selectedCategory.toLowerCase() === "all" ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase()
  )
  .filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar products={products} setSearch={setSearch} />

      {/* HEADER */}
      <div style={{ background: "#111", padding: isMobile ? "28px 16px 22px" : "48px 40px 36px", borderBottom: "4px solid #FEE12B", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "200px", height: "100%", background: "repeating-linear-gradient(-45deg,transparent,transparent 8px,rgba(254,225,43,0.04) 8px,rgba(254,225,43,0.04) 16px)" }} />
        <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative" }}>
          <p style={{ color: "#FEE12B", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "8px", fontWeight: "700" }}>RouterHub · Store</p>
          <h1 style={{ color: "white", fontSize: isMobile ? "32px" : "clamp(36px, 5vw, 64px)", fontWeight: "900", letterSpacing: "-2px", margin: "0 0 6px", lineHeight: 1 }}>All Products</h1>
          <p style={{ color: "#666", fontSize: "13px", margin: 0, fontWeight: "500" }}>{filtered.length} item{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "16px" : "32px 40px" }}>

        {/* CATEGORY STRIP */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "24px", overflowX: isMobile ? "auto" : "visible", paddingBottom: isMobile ? "4px" : "0" }}>
          {CATEGORIES.map((cat, i) => (
            <button key={`${cat}-${i}`} onClick={() => setSelectedCategory(cat)}
              style={{ padding: isMobile ? "7px 12px" : "8px 16px", border: selectedCategory === cat ? "2px solid #111" : "2px solid #ddd", background: selectedCategory === cat ? "#FEE12B" : "white", color: "#111", cursor: "pointer", fontWeight: "800", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", borderRadius: "3px", transition: "all 0.15s", flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
              {cat}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: isMobile ? "220px" : "300px", borderRadius: "10px", background: "linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%)", backgroundSize: "400% 100%", animation: "shimmer 1.6s ease infinite" }} />
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <h3 style={{ fontWeight: "900", color: "#111", margin: "0 0 8px", fontSize: "22px" }}>Nothing found</h3>
            <p style={{ color: "#aaa" }}>Try a different category</p>
          </div>
        )}

        {/* GRID */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(240px, 1fr))", gap: isMobile ? "12px" : "20px" }}>
            {filtered.map(p => {
              const cartItem = cart.find(i => i._id === p._id);
              const wishItem = wishlist.find(i => i._id === p._id);

              return (
                <div
                  key={p._id}
                  onClick={() => navigate(`/product/${p._id}`)}
                  style={{ background: "white", borderRadius: "10px", padding: isMobile ? "10px" : "14px", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #ececec", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}>

                  {/* IMAGE */}
                  <div style={{ position: "relative", overflow: "hidden", borderRadius: "6px", background: "#f5f5f0" }}>
                    <img src={p.image || undefined} alt={p.name} style={{ width: "100%", height: isMobile ? "120px" : "160px", objectFit: "cover", borderRadius: "6px", display: "block" }} />
                    {p.stock <= 3 && (
                      <span style={{ position: "absolute", bottom: "6px", left: "6px", background: "#FEE12B", color: "#111", padding: "3px 7px", borderRadius: "3px", fontSize: "9px", fontWeight: "800" }}>⚡ {p.stock} left</span>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); wishItem ? removeFromWishlist(p._id) : addToWishlist(p); }}
                      style={{ position: "absolute", top: "6px", right: "6px", width: "28px", height: "28px", background: "white", border: "none", borderRadius: "50%", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                      {wishItem ? "❤️" : "🤍"}
                    </button>
                  </div>

                  {/* INFO */}
                  <div style={{ paddingTop: "10px" }}>
                    <span style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: "#aaa" }}>{p.category}</span>
                    <h4 style={{ margin: "3px 0 6px", fontSize: isMobile ? "12px" : "14px", fontWeight: "700", color: "#111", lineHeight: "1.35", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</h4>

                    {/* PRICE */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
                      <span style={{ fontSize: isMobile ? "16px" : "19px", fontWeight: "900", color: "#111", letterSpacing: "-0.5px" }}>
                        ₹{p.price?.toLocaleString()}
                      </span>
                      {p.originalPrice && Number(p.originalPrice) > Number(p.price) && (
                        <span style={{ fontSize: isMobile ? "11px" : "13px", fontWeight: "600", color: "#999", textDecoration: "line-through" }}>
                          ₹{Number(p.originalPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {p.originalPrice && Number(p.originalPrice) > Number(p.price) && (
                      <span style={{ fontSize: "10px", fontWeight: "800", color: "#fff", background: "#e53e3e", padding: "2px 7px", borderRadius: "3px", marginBottom: "6px", display: "inline-block" }}>
                        {Math.round(((Number(p.originalPrice) - Number(p.price)) / Number(p.originalPrice)) * 100)}% OFF
                      </span>
                    )}

                    {cartItem ? (
                      <div
                        onClick={e => e.stopPropagation()}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", background: "#FEE12B", borderRadius: "6px", padding: isMobile ? "5px 8px" : "7px 12px" }}>
                        <button onClick={e => { e.stopPropagation(); decreaseQty(p._id); }} style={{ background: "none", border: "none", fontSize: "16px", fontWeight: "900", cursor: "pointer" }}>−</button>
                        <span style={{ fontWeight: "900", fontSize: "14px" }}>{cartItem.qty}</span>
                        <button onClick={e => { e.stopPropagation(); increaseQty(p._id); }} style={{ background: "none", border: "none", fontSize: "16px", fontWeight: "900", cursor: "pointer" }}>+</button>
                      </div>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); addToCart(p); }}
                        style={{ width: "100%", marginTop: "10px", padding: isMobile ? "8px" : "10px", border: "2px solid #111", background: "transparent", color: "#111", fontWeight: "800", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: "5px", fontFamily: "'DM Sans', sans-serif" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#FEE12B"; e.currentTarget.style.borderColor = "#FEE12B"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#111"; }}>
                        + Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Store;