import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

function Wishlist() {
  const { wishlist, removeFromWishlist } = useContext(WishlistContext);
  const { cart, addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleMoveToCart = (item) => {
    addToCart(item);
    removeFromWishlist(item._id);
    toast.success("Moved to cart 🛒");
  };

  return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar setSearch={() => {}} />

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <p style={styles.breadcrumb}>
            <Link to="/store" style={{ color: "#FEE12B", textDecoration: "none", fontWeight: "700" }}>Store</Link>
            <span style={{ margin: "0 8px", color: "#555" }}>/</span>
            <span style={{ color: "#999" }}>Wishlist</span>
          </p>
          <h1 style={styles.pageTitle}>My Wishlist</h1>
          <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>
            {wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div style={styles.content}>
        {wishlist.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: "56px", marginBottom: "20px" }}>🤍</div>
            <h3 style={styles.emptyTitle}>Your wishlist is empty</h3>
            <p style={styles.emptySubtitle}>Save items you love and come back to them later</p>
            <Link to="/store" style={styles.shopBtn}>Browse Store →</Link>
          </div>
        ) : (
          <>
            {/* MOVE ALL */}
            {wishlist.length > 1 && (
              <div style={{ textAlign: "right", marginBottom: "20px" }}>
                <button
                  onClick={() => {
                    wishlist.forEach(item => {
                      addToCart(item);
                      removeFromWishlist(item._id);
                    });
                    toast.success("All items moved to cart 🛒");
                  }}
                  style={styles.moveAllBtn}
                >
                  Move All to Cart
                </button>
              </div>
            )}

            <div style={styles.grid}>
              {wishlist.map(item => {
                const inCart = cart.find(i => i._id === item._id);
                return (
                  <div
                    key={item._id}
                    style={styles.card}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                    }}
                  >
                    <div style={{ position: "relative", cursor: "pointer" }} onClick={() => navigate(`/product/${item._id}`)}>
                      <img src={item.image} alt={item.name} style={styles.img} />
                      <button
                        onClick={e => { e.stopPropagation(); removeFromWishlist(item._id); }}
                        style={styles.removeBtn}
                        title="Remove from wishlist"
                      >
                        ×
                      </button>
                    </div>

                    <div style={{ padding: "14px 14px 16px" }}>
                      <p style={styles.cat}>{item.category}</p>
                      <h4 style={styles.name} onClick={() => navigate(`/product/${item._id}`)}>
                        {item.name}
                      </h4>
                      <p style={styles.price}>₹{item.price?.toLocaleString()}</p>

                      {inCart ? (
                        <button onClick={() => navigate("/cart")} style={styles.viewCartBtn}>
                          View in Cart →
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMoveToCart(item)}
                          style={styles.cartBtn}
                          onMouseEnter={e => e.currentTarget.style.background = "#f5d400"}
                          onMouseLeave={e => e.currentTarget.style.background = "#FEE12B"}
                        >
                          🛒 Move to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: { background: "#111", padding: "44px 40px 32px", borderBottom: "4px solid #FEE12B" },
  headerInner: { maxWidth: "1280px", margin: "0 auto" },
  breadcrumb: { fontSize: "12px", marginBottom: "10px" },
  pageTitle: { color: "white", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: "900", letterSpacing: "-1.5px", margin: "0 0 6px", lineHeight: 1 },
  content: { maxWidth: "1280px", margin: "0 auto", padding: "40px" },
  empty: { textAlign: "center", padding: "80px 20px" },
  emptyTitle: { fontWeight: "900", color: "#111", fontSize: "26px", margin: "0 0 8px", letterSpacing: "-0.5px" },
  emptySubtitle: { color: "#aaa", margin: "0 0 28px" },
  shopBtn: { display: "inline-block", padding: "13px 28px", background: "#FEE12B", color: "#111", textDecoration: "none", fontWeight: "800", borderRadius: "8px", fontSize: "14px" },
  moveAllBtn: { padding: "10px 20px", background: "#111", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" },
  card: { background: "white", borderRadius: "12px", border: "1px solid #ededec", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)" },
  img: { width: "100%", height: "180px", objectFit: "cover", display: "block" },
  removeBtn: { position: "absolute", top: "10px", right: "10px", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "white", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 },
  cat: { fontSize: "9px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: "#aaa", margin: "0 0 4px" },
  name: { fontSize: "14px", fontWeight: "700", color: "#111", margin: "0 0 8px", lineHeight: 1.3, cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  price: { fontSize: "18px", fontWeight: "900", color: "#111", margin: "0 0 12px", letterSpacing: "-0.3px" },
  cartBtn: { width: "100%", padding: "10px", background: "#FEE12B", color: "#111", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "13px", cursor: "pointer", transition: "background 0.15s", fontFamily: "'DM Sans', sans-serif" },
  viewCartBtn: { width: "100%", padding: "10px", background: "#F0FDF4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }
};

export default Wishlist;