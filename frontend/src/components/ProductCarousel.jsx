import { useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";

function ProductCarousel({ title, products }) {
  const scrollRef = useRef();
  const navigate = useNavigate();
  const { cart, addToCart, increaseQty, decreaseQty } = useContext(CartContext);
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);

  // Guard: ensure products is always a usable array
  const safeProducts = Array.isArray(products) ? products : [];

  const scroll = (dir) => {
    scrollRef.current.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  };

  if (!safeProducts.length) return null;

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.arrowGroup}>
          <button onClick={() => scroll("left")} style={styles.arrow}>‹</button>
          <button onClick={() => scroll("right")} style={styles.arrow}>›</button>
        </div>
      </div>

      <div style={{ position: "relative" }}>
        {/* FADE EDGES */}
        <div style={styles.fadeLeft} />
        <div style={styles.fadeRight} />

        <div ref={scrollRef} style={styles.row}>
          {safeProducts.map(p => {
            const cartItem = cart.find(i => i._id === p._id);
            const wishItem = wishlist.find(i => i._id === p._id);

            return (
              <div
                key={p._id}
                style={{ ...styles.card, cursor: "pointer" }}
                onClick={() => navigate(`/product/${p._id}`)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                }}
              >
                {/* IMAGE */}
                <div style={styles.imgWrap}>
                  {p.image ? <img src={p.image} alt={p.name} style={styles.img} /> : <div style={{ ...styles.img, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: "32px" }}>📦</span></div>}
                  {p.stock <= 3 && <span style={styles.stockBadge}>⚡ {p.stock} left</span>}
                  <button
                    onClick={e => { e.stopPropagation(); wishItem ? removeFromWishlist(p._id) : addToWishlist(p); }}
                    style={styles.wishBtn}
                  >
                    {wishItem ? "❤️" : "🤍"}
                  </button>
                </div>

                {/* INFO */}
                <div style={styles.info}>
                  <p style={styles.cat}>{p.category}</p>
                  <h4 style={styles.name}>{p.name}</h4>

                  {/* PRICE with strikethrough */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
                    <span style={styles.price}>₹{p.price?.toLocaleString()}</span>
                    {p.originalPrice && Number(p.originalPrice) > Number(p.price) && (
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#999", textDecoration: "line-through" }}>
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
                      style={styles.qtyBox}>
                      <button onClick={e => { e.stopPropagation(); decreaseQty(p._id); }} style={styles.qtyBtn}>−</button>
                      <span style={{ fontWeight: "900", fontSize: "14px" }}>{cartItem.qty}</span>
                      <button onClick={e => { e.stopPropagation(); increaseQty(p._id); }} style={styles.qtyBtn}>+</button>
                    </div>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); addToCart(p); }}
                      style={styles.addBtn}
                      onMouseEnter={e => { e.stopPropagation(); e.currentTarget.style.background = "#FEE12B"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      + Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    padding: "0 40px 8px",
    fontFamily: "'DM Sans', sans-serif"
  },
  header: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "16px"
  },
  arrowGroup: {
    display: "flex",
    gap: "6px"
  },
  arrow: {
    width: "36px",
    height: "36px",
    border: "2px solid #111",
    background: "white",
    borderRadius: "8px",
    fontSize: "20px",
    fontWeight: "900",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
    color: "#111"
  },
  fadeLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "40px",
    background: "linear-gradient(to right, white, transparent)",
    zIndex: 1,
    pointerEvents: "none"
  },
  fadeRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "40px",
    background: "linear-gradient(to left, white, transparent)",
    zIndex: 1,
    pointerEvents: "none"
  },
  row: {
    display: "flex",
    gap: "16px",
    overflowX: "auto",
    scrollBehavior: "smooth",
    paddingBottom: "8px",
    scrollbarWidth: "none",
    msOverflowStyle: "none"
  },
  card: {
    minWidth: "200px",
    maxWidth: "200px",
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #ededec",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
    cursor: "default",
    flexShrink: 0
  },
  imgWrap: {
    position: "relative",
    cursor: "pointer",
    overflow: "hidden",
    background: "#f5f5f0"
  },
  img: {
    width: "100%",
    height: "140px",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.3s ease"
  },
  stockBadge: {
    position: "absolute",
    bottom: "8px",
    left: "8px",
    background: "#FEE12B",
    color: "#111",
    fontSize: "9px",
    fontWeight: "800",
    padding: "3px 8px",
    borderRadius: "3px",
    letterSpacing: "0.5px"
  },
  wishBtn: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "30px",
    height: "30px",
    background: "white",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
  },
  info: {
    padding: "12px 12px 14px"
  },
  cat: {
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "#aaa",
    margin: "0 0 4px"
  },
  name: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#111",
    margin: "0 0 8px",
    lineHeight: 1.3,
    cursor: "pointer",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  price: {
    fontSize: "16px",
    fontWeight: "900",
    color: "#111",
    margin: "0 0 10px",
    letterSpacing: "-0.3px"
  },
  addBtn: {
    width: "100%",
    padding: "8px",
    border: "2px solid #111",
    background: "transparent",
    color: "#111",
    fontWeight: "800",
    fontSize: "11px",
    letterSpacing: "0.8px",
    cursor: "pointer",
    borderRadius: "6px",
    transition: "background 0.15s",
    fontFamily: "'DM Sans', sans-serif"
  },
  qtyBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#FEE12B",
    borderRadius: "6px",
    padding: "6px 10px"
  },
  qtyBtn: {
    background: "none",
    border: "none",
    fontSize: "16px",
    fontWeight: "900",
    cursor: "pointer",
    color: "#111",
    padding: 0,
    lineHeight: 1
  }
};

export default ProductCarousel;