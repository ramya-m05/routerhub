import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import toast from "react-hot-toast";
import { useIsMobile } from "../hooks/useIsMobile";

/* ─── helpers ─────────────────────────────────── */
const getDeliveryDate = (days = 5) => {
  const d = new Date();
  d.setDate(d.getDate() + Number(days));
  return d.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
};

const discountPct = (orig, sell) =>
  orig > sell ? Math.round(((orig - sell) / orig) * 100) : 0;

/* ─── Star component ───────────────────────────── */
function Stars({ value, onChange, size = 20, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{
            fontSize: `${size}px`,
            cursor: readonly ? "default" : "pointer",
            color: s <= (hover || value) ? "#FEE12B" : "#e0e0e0",
            transition: "color 0.1s",
            lineHeight: 1
          }}
        >★</span>
      ))}
    </div>
  );
}

/* ─── Main component ───────────────────────────── */
function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { cart, addToCart, increaseQty, decreaseQty } = useContext(CartContext);
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [hasBought, setHasBought] = useState(false);
  const [checkingBought, setCheckingBought] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReviewDone, setUserReviewDone] = useState(false);

  const cartItem = product ? cart.find(i => i._id === product._id) : null;
  const wishItem = product ? wishlist.find(i => i._id === product._id) : null;

  /* ── fetch product ── */
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setProduct(null);
    setQty(1);
    window.scrollTo({ top: 0, behavior: "smooth" });

    Promise.all([
      API.get(`/products/${id}`),
      API.get("/products")
    ])
      .then(([prodRes, allRes]) => {
        setProduct(prodRes.data);
        setAllProducts(Array.isArray(allRes.data) ? allRes.data : []);
      })
      .catch(err => {
        console.error("ProductDetails fetch error:", err.response?.status, err.message);
        setError(err.response?.status === 404
          ? "This product does not exist."
          : `Failed to load product. (${err.response?.status || err.message})`
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* ── fetch reviews (silently fails if endpoint missing) ── */
  useEffect(() => {
    if (!id) return;
    API.get(`/products/${id}/reviews`)
      .then(res => setReviews(Array.isArray(res.data) ? res.data : []))
      .catch(() => setReviews([]));    // endpoint may not exist yet — fail silently
  }, [id]);

  /* ── check if logged-in user has bought this product ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !id) return;
    setCheckingBought(true);
    API.get("/orders/my")
      .then(res => {
        const orders = Array.isArray(res.data) ? res.data : [];
        const bought = orders.some(o =>
          Array.isArray(o.items) && o.items.some(i => i.productId === id || i.productId?._id === id)
        );
        setHasBought(bought);
        // check if they already reviewed
        const userName = localStorage.getItem("userName") || "";
        if (bought && userName) {
          setUserReviewDone(reviews.some(r => r.name === userName));
        }
      })
      .catch(() => setHasBought(false))
      .finally(() => setCheckingBought(false));
  }, [id, reviews]);

  /* ── submit review ── */
  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) { toast.error("Please write your review"); return; }
    setSubmittingReview(true);
    try {
      const name = localStorage.getItem("userName") || "Customer";
      await API.post(`/products/${id}/reviews`, {
        name,
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      toast.success("Review submitted! ✅");
      setReviewComment("");
      setReviewRating(5);
      setUserReviewDone(true);
      // refresh reviews
      API.get(`/products/${id}/reviews`)
        .then(r => setReviews(Array.isArray(r.data) ? r.data : []))
        .catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  /* ── share ── */
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product?.name, url }); return; }
      catch (e) { if (e.name === "AbortError") return; }
    }
    navigator.clipboard?.writeText(url)
      .then(() => toast.success("Link copied! 🔗"))
      .catch(() => toast.error("Copy failed"));
  };

  /* ── similar products ── */
  const similar = allProducts.filter(
    p => p._id !== id && p.category === product?.category
  ).slice(0, 8);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1)
    : 0;

  /* ══════════ LOADING ══════════ */
  if (loading) return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar setSearch={() => {}} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", border: "4px solid #eee", borderTop: "4px solid #FEE12B", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#aaa", fontSize: "14px", fontWeight: "600" }}>Loading product...</p>
      </div>
    </div>
  );

  /* ══════════ ERROR ══════════ */
  if (error || !product) return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar setSearch={() => {}} />
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>😕</div>
        <h2 style={{ fontWeight: "900", fontSize: "24px", color: "#111", margin: "0 0 8px" }}>Product not found</h2>
        <p style={{ color: "#999", marginBottom: "24px", fontSize: "14px" }}>{error || "This product may have been removed."}</p>
        <Link to="/store" style={{ display: "inline-block", padding: "13px 28px", background: "#FEE12B", color: "#111", textDecoration: "none", fontWeight: "800", borderRadius: "8px", fontSize: "14px" }}>
          ← Back to Store
        </Link>
      </div>
    </div>
  );

  const inStock = product.stock > 0;
  const hasDiscount = product.originalPrice && Number(product.originalPrice) > Number(product.price);
  const disc = hasDiscount ? discountPct(Number(product.originalPrice), Number(product.price)) : 0;

  /* ══════════ MAIN RENDER ══════════ */
  return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar setSearch={() => {}} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: isMobile ? "16px 16px 40px" : "32px 40px 60px" }}>

        {/* BREADCRUMB */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px", fontSize: "13px", flexWrap: "wrap" }}>
          <Link to="/" style={{ color: "#FEE12B", textDecoration: "none", fontWeight: "700" }}>Home</Link>
          <span style={{ color: "#ccc" }}>/</span>
          <Link to="/store" style={{ color: "#FEE12B", textDecoration: "none", fontWeight: "700" }}>Store</Link>
          <span style={{ color: "#ccc" }}>/</span>
          <Link to={`/store?category=${product.category}`} style={{ color: "#FEE12B", textDecoration: "none", fontWeight: "700" }}>{product.category}</Link>
          <span style={{ color: "#ccc" }}>/</span>
          <span style={{ color: "#999", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>{product.name}</span>
        </div>

        {/* ══ PRODUCT SECTION ══════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "24px" : "48px", alignItems: "flex-start", background: "white", borderRadius: "16px", padding: isMobile ? "16px" : "32px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #ececec", marginBottom: "28px" }}>

          {/* IMAGE COL */}
          <div style={{ width: isMobile ? "100%" : "380px", flexShrink: 0 }}>
            <div style={{ position: "relative", background: "#f5f5f0", borderRadius: "12px", overflow: "hidden", border: "1px solid #eee" }}>
              <img
                src={product.image}
                alt={product.name}
                style={{ width: "100%", height: isMobile ? "260px" : "380px", objectFit: "cover", display: "block" }}
              />
              {hasDiscount && (
                <div style={{ position: "absolute", top: "12px", left: "12px", background: "#e53e3e", color: "white", padding: "4px 10px", borderRadius: "5px", fontWeight: "900", fontSize: "13px" }}>
                  -{disc}% OFF
                </div>
              )}
              {product.stock > 0 && product.stock <= 3 && (
                <div style={{ position: "absolute", bottom: "12px", left: "12px", background: "rgba(254,225,43,0.95)", color: "#111", padding: "4px 12px", borderRadius: "5px", fontWeight: "800", fontSize: "12px" }}>
                  ⚡ Only {product.stock} left!
                </div>
              )}
              {!inStock && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ background: "#e53e3e", color: "white", padding: "10px 24px", borderRadius: "8px", fontWeight: "900", fontSize: "16px" }}>Out of Stock</span>
                </div>
              )}
            </div>

            {/* WISHLIST + SHARE */}
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button
                onClick={() => wishItem ? removeFromWishlist(product._id) : addToWishlist(product)}
                style={{ flex: 1, padding: "11px", border: `2px solid ${wishItem ? "#e53e3e" : "#e5e5e5"}`, background: wishItem ? "#FEF2F2" : "white", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px", color: wishItem ? "#e53e3e" : "#555", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}>
                {wishItem ? "❤️ Wishlisted" : "🤍 Add to Wishlist"}
              </button>
              <button
                onClick={handleShare}
                style={{ flex: 1, padding: "11px", border: "2px solid #e5e5e5", background: "white", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px", color: "#555", fontFamily: "'DM Sans', sans-serif" }}>
                🔗 Share
              </button>
            </div>

            {/* SHARE LINKS */}
            <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { label: "WhatsApp", bg: "#25D366", url: `https://wa.me/?text=${encodeURIComponent(`${product.name} — ₹${product.price?.toLocaleString()} | ${window.location.href}`)}` },
                { label: "Facebook", bg: "#1877F2", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
                { label: "Telegram", bg: "#2AABEE", url: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product.name)}` },
              ].map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: "5px 12px", background: s.bg, color: "white", borderRadius: "20px", textDecoration: "none", fontSize: "11px", fontWeight: "700" }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* DETAILS COL */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* CATEGORY TAG */}
            <span style={{ display: "inline-block", background: "#FEE12B", color: "#111", fontSize: "10px", fontWeight: "800", letterSpacing: "1.5px", textTransform: "uppercase", padding: "4px 12px", borderRadius: "4px", marginBottom: "12px" }}>
              {product.category}
            </span>

            {/* NAME */}
            <h1 style={{ fontSize: isMobile ? "22px" : "clamp(22px, 3vw, 32px)", fontWeight: "900", color: "#111", margin: "0 0 12px", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
              {product.name}
            </h1>

            {/* STAR SUMMARY */}
            {reviews.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <Stars value={Math.round(Number(avgRating))} readonly size={16} />
                <span style={{ fontWeight: "800", fontSize: "14px" }}>{avgRating}</span>
                <span style={{ color: "#aaa", fontSize: "13px" }}>({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
              </div>
            )}

            {/* PRICE */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
              <span style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: "900", color: "#111", letterSpacing: "-1px" }}>
                ₹{Number(product.price).toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span style={{ fontSize: isMobile ? "16px" : "18px", fontWeight: "600", color: "#bbb", textDecoration: "line-through" }}>
                    ₹{Number(product.originalPrice).toLocaleString()}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "900", color: "#fff", background: "#e53e3e", padding: "3px 10px", borderRadius: "5px" }}>
                    {disc}% OFF
                  </span>
                </>
              )}
            </div>

            {/* STOCK */}
            <div style={{ marginBottom: "16px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", padding: "5px 12px", borderRadius: "20px", background: inStock ? "#F0FDF4" : "#FEF2F2", color: inStock ? "#16a34a" : "#e53e3e", border: `1px solid ${inStock ? "#bbf7d0" : "#fecaca"}` }}>
                {inStock ? `✅ In Stock — ${product.stock} unit${product.stock !== 1 ? "s" : ""} available` : "❌ Out of Stock"}
              </span>
            </div>

            {/* DELIVERY BADGE */}
            <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "10px", padding: "12px 16px", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>🚚</span>
                <div>
                  <p style={{ fontWeight: "800", fontSize: "13px", color: "#1d4ed8", margin: 0 }}>
                    Free delivery by {getDeliveryDate(product.deliveryDays || 5)}
                  </p>
                  <p style={{ fontSize: "12px", color: "#60a5fa", margin: "2px 0 0" }}>
                    {product.deliveryDays || 5} working days · Order before 5 PM today
                  </p>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            {product.description && (
              <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.75", margin: "0 0 20px" }}>
                {product.description}
              </p>
            )}

            {/* DIVIDER */}
            <div style={{ height: "1px", background: "#f0f0f0", margin: "16px 0" }} />

            {/* QTY + CART */}
            {inStock ? (
              <>
                {/* QTY SELECTOR */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#555" }}>Quantity:</span>
                  {cartItem ? (
                    <div style={{ display: "flex", alignItems: "center", background: "#FEE12B", borderRadius: "8px", overflow: "hidden" }}>
                      <button onClick={() => decreaseQty(product._id)} style={{ width: "40px", height: "40px", background: "transparent", border: "none", fontSize: "20px", fontWeight: "900", cursor: "pointer" }}>−</button>
                      <span style={{ width: "40px", textAlign: "center", fontWeight: "900", fontSize: "16px" }}>{cartItem.qty}</span>
                      <button onClick={() => increaseQty(product._id)} style={{ width: "40px", height: "40px", background: "transparent", border: "none", fontSize: "20px", fontWeight: "900", cursor: "pointer" }}>+</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", border: "2px solid #111", borderRadius: "8px", overflow: "hidden" }}>
                      <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: "40px", height: "40px", background: "white", border: "none", fontSize: "20px", fontWeight: "900", cursor: "pointer", color: "#111" }}>−</button>
                      <span style={{ width: "40px", textAlign: "center", fontWeight: "800", fontSize: "16px", borderLeft: "1px solid #eee", borderRight: "1px solid #eee" }}>{qty}</span>
                      <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ width: "40px", height: "40px", background: "white", border: "none", fontSize: "20px", fontWeight: "900", cursor: "pointer", color: "#111" }}>+</button>
                    </div>
                  )}
                  {!cartItem && <span style={{ fontSize: "12px", color: "#aaa" }}>Max {product.stock}</span>}
                  {cartItem && <span style={{ fontSize: "13px", color: "#22863a", fontWeight: "700" }}>✅ Added to cart</span>}
                </div>

                {/* CTA BUTTONS */}
                <div style={{ display: "flex", gap: "12px", flexDirection: isMobile ? "column" : "row" }}>
                  {!cartItem && (
                    <button
                      onClick={() => { addToCart({ ...product, qty }); toast.success("Added to cart 🛒"); }}
                      style={{ flex: 1, padding: "14px", background: "#FEE12B", color: "#111", border: "none", borderRadius: "10px", fontWeight: "900", fontSize: "15px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 16px rgba(254,225,43,0.4)" }}>
                      🛒 Add to Cart
                    </button>
                  )}
                  <button
                    onClick={() => { addToCart({ ...product, qty }); navigate("/checkout"); }}
                    style={{ flex: 1, padding: "14px", background: "#111", color: "white", border: "none", borderRadius: "10px", fontWeight: "900", fontSize: "15px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                    Buy Now →
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => !wishItem && addToWishlist(product)}
                style={{ width: "100%", padding: "14px", background: "#f0f0f0", border: "2px solid #ddd", borderRadius: "10px", fontWeight: "800", fontSize: "14px", cursor: "pointer", color: "#555", fontFamily: "'DM Sans', sans-serif" }}>
                {wishItem ? "❤️ Saved — We'll notify you" : "🔔 Notify Me When Available"}
              </button>
            )}

            {/* TRUST BADGES */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "18px" }}>
              {["🚚 Free Delivery", "🔒 Secure Payment", "🔄 7-Day Returns", "✅ Genuine Product"].map((t, i) => (
                <span key={i} style={{ fontSize: "11px", fontWeight: "600", color: "#666", padding: "5px 11px", background: "#f7f7f5", borderRadius: "20px", border: "1px solid #eee" }}>{t}</span>
              ))}
            </div>

            {/* SPECS */}
            {(product.brand || product.sku) && (
              <div style={{ marginTop: "18px", padding: "14px", background: "#F7F7F5", borderRadius: "8px" }}>
                {product.brand && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                    <span style={{ color: "#888", fontWeight: "600" }}>Brand</span>
                    <span style={{ color: "#111", fontWeight: "700" }}>{product.brand}</span>
                  </div>
                )}
                {product.sku && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#888", fontWeight: "600" }}>SKU</span>
                    <span style={{ color: "#111", fontWeight: "700", fontFamily: "monospace" }}>{product.sku}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ══ REVIEWS SECTION ══════════════════════════════ */}
        <div style={{ background: "white", borderRadius: "16px", padding: isMobile ? "20px 16px" : "32px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #ececec", marginBottom: "28px" }}>

          <h2 style={{ fontWeight: "900", fontSize: isMobile ? "20px" : "24px", color: "#111", margin: "0 0 24px", letterSpacing: "-0.5px" }}>
            ⭐ Customer Reviews
          </h2>

          {/* RATING SUMMARY */}
          {reviews.length > 0 && (
            <div style={{ display: "flex", gap: "24px", alignItems: "center", padding: "20px", background: "#F7F7F5", borderRadius: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "52px", fontWeight: "900", color: "#111", margin: 0, letterSpacing: "-2px", lineHeight: 1 }}>{avgRating}</p>
                <Stars value={Math.round(Number(avgRating))} readonly size={18} />
                <p style={{ fontSize: "12px", color: "#aaa", margin: "6px 0 0" }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
              </div>
              <div style={{ flex: 1, minWidth: "180px" }}>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => Number(r.rating) === star).length;
                  const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                  return (
                    <div key={star} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#555", width: "8px" }}>{star}</span>
                      <span style={{ color: "#FEE12B", fontSize: "12px" }}>★</span>
                      <div style={{ flex: 1, height: "6px", background: "#e5e5e5", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "#FEE12B", borderRadius: "3px", transition: "width 0.6s ease" }} />
                      </div>
                      <span style={{ fontSize: "11px", color: "#aaa", width: "24px" }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* REVIEW LIST */}
          {reviews.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 20px" }}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>💬</div>
              <p style={{ fontWeight: "700", color: "#111", margin: "0 0 4px" }}>No reviews yet</p>
              <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>Be the first to share your experience</p>
            </div>
          )}

          {reviews.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "28px" }}>
              {reviews.map((r, i) => (
                <div key={i} style={{ padding: "16px", background: "#F9F9F7", borderRadius: "10px", border: "1px solid #eee" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "8px", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#FEE12B", color: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "13px", flexShrink: 0 }}>
                          {(r.name || "?")[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: "800", fontSize: "14px", color: "#111" }}>{r.name || "Customer"}</span>
                        <span style={{ background: "#F0FDF4", color: "#16a34a", fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>✅ Verified Buyer</span>
                      </div>
                      <Stars value={Number(r.rating)} readonly size={14} />
                    </div>
                    <span style={{ fontSize: "12px", color: "#aaa", flexShrink: 0 }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                    </span>
                  </div>
                  <p style={{ color: "#444", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* WRITE A REVIEW — ONLY FOR VERIFIED BUYERS */}
          <div style={{ borderTop: "2px solid #f0f0f0", paddingTop: "24px" }}>
            {!localStorage.getItem("token") ? (
              <div style={{ background: "#F7F7F5", borderRadius: "10px", padding: "20px", textAlign: "center" }}>
                <p style={{ fontWeight: "700", color: "#111", margin: "0 0 12px", fontSize: "15px" }}>Want to share your experience?</p>
                <p style={{ color: "#aaa", fontSize: "13px", margin: "0 0 16px" }}>Please login to write a review</p>
                <button onClick={() => navigate("/login")}
                  style={{ padding: "10px 24px", background: "#FEE12B", color: "#111", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }}>
                  Login to Review
                </button>
              </div>
            ) : checkingBought ? (
              <p style={{ color: "#aaa", fontSize: "13px", textAlign: "center" }}>Checking purchase history...</p>
            ) : !hasBought ? (
              <div style={{ background: "#FFF9E6", border: "2px solid #FEE12B", borderRadius: "10px", padding: "20px", textAlign: "center" }}>
                <p style={{ fontWeight: "700", color: "#111", margin: "0 0 6px", fontSize: "15px" }}>🛒 Purchase Required</p>
                <p style={{ color: "#888", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>
                  Only verified buyers who have purchased this product can write a review.
                  This helps keep reviews genuine and trustworthy.
                </p>
              </div>
            ) : userReviewDone ? (
              <div style={{ background: "#F0FDF4", border: "2px solid #bbf7d0", borderRadius: "10px", padding: "18px", textAlign: "center" }}>
                <p style={{ fontWeight: "700", color: "#16a34a", margin: 0, fontSize: "14px" }}>✅ You've already reviewed this product. Thank you!</p>
              </div>
            ) : (
              /* REVIEW FORM — visible only to verified buyers */
              <div>
                <h3 style={{ fontWeight: "900", fontSize: "18px", color: "#111", margin: "0 0 18px", letterSpacing: "-0.3px" }}>
                  ✍️ Write Your Review
                </h3>
                <p style={{ background: "#F0FDF4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#16a34a", fontWeight: "600", margin: "0 0 18px" }}>
                  ✅ You have purchased this product. Your review will appear as "Verified Buyer".
                </p>

                <div style={{ marginBottom: "16px" }}>
                  <label style={lbl}>Your Rating</label>
                  <Stars value={reviewRating} onChange={setReviewRating} size={28} />
                  <p style={{ fontSize: "12px", color: "#aaa", margin: "6px 0 0" }}>
                    {["", "Very Bad", "Bad", "Average", "Good", "Excellent!"][reviewRating]}
                  </p>
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label style={lbl}>Your Review</label>
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="How was the product? Share your honest experience to help other buyers..."
                    rows={4}
                    style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", color: "#111", background: "white", outline: "none", transition: "border-color 0.15s", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif", resize: "vertical", minHeight: "100px" }}
                    onFocus={e => e.target.style.borderColor = "#FEE12B"}
                    onBlur={e => e.target.style.borderColor = "#e5e5e5"}
                  />
                  <p style={{ fontSize: "11px", color: "#aaa", margin: "4px 0 0" }}>{reviewComment.length} / 500 characters</p>
                </div>

                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || reviewComment.length < 10}
                  style={{ padding: "12px 28px", background: "#FEE12B", color: "#111", border: "none", borderRadius: "8px", fontWeight: "900", fontSize: "14px", cursor: (submittingReview || reviewComment.length < 10) ? "not-allowed" : "pointer", opacity: (submittingReview || reviewComment.length < 10) ? 0.6 : 1, fontFamily: "'DM Sans', sans-serif" }}>
                  {submittingReview ? "Submitting..." : "Submit Review →"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ══ SIMILAR PRODUCTS ════════════════════════════ */}
        {similar.length > 0 && (
          <div style={{ background: "white", borderRadius: "16px", padding: isMobile ? "20px 16px" : "32px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #ececec" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <p style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#aaa", margin: "0 0 4px" }}>You might also like</p>
                <h2 style={{ fontWeight: "900", fontSize: isMobile ? "20px" : "24px", color: "#111", margin: 0, letterSpacing: "-0.5px" }}>Similar Products</h2>
              </div>
              <Link to={`/store?category=${product.category}`}
                style={{ fontSize: "13px", fontWeight: "700", color: "#FEE12B", textDecoration: "none" }}>
                View all →
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(190px, 1fr))", gap: isMobile ? "12px" : "16px" }}>
              {similar.map(p => {
                const hasDisc = p.originalPrice && Number(p.originalPrice) > Number(p.price);
                const disc = hasDisc ? discountPct(Number(p.originalPrice), Number(p.price)) : 0;
                const inCartSim = cart.find(i => i._id === p._id);
                return (
                  <div
                    key={p._id}
                    onClick={() => navigate(`/product/${p._id}`)}
                    style={{ background: "#F9F9F7", borderRadius: "10px", overflow: "hidden", border: "1px solid #eee", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ position: "relative" }}>
                      <img src={p.image || undefined} alt={p.name} style={{ width: "100%", height: isMobile ? "110px" : "140px", objectFit: "cover", display: "block" }} />
                      {hasDisc && (
                        <span style={{ position: "absolute", top: "8px", left: "8px", background: "#e53e3e", color: "white", fontSize: "10px", fontWeight: "900", padding: "2px 7px", borderRadius: "4px" }}>-{disc}%</span>
                      )}
                    </div>
                    <div style={{ padding: isMobile ? "10px" : "12px" }}>
                      <p style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", color: "#aaa", margin: "0 0 3px" }}>{p.category}</p>
                      <p style={{ fontWeight: "700", fontSize: "13px", color: "#111", margin: "0 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>{p.name}</p>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "5px", marginBottom: "8px" }}>
                        <span style={{ fontWeight: "900", fontSize: "15px", color: "#111" }}>₹{Number(p.price).toLocaleString()}</span>
                        {hasDisc && <span style={{ fontSize: "11px", color: "#bbb", textDecoration: "line-through" }}>₹{Number(p.originalPrice).toLocaleString()}</span>}
                      </div>
                      {inCartSim ? (
                        <div onClick={e => e.stopPropagation()} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FEE12B", borderRadius: "5px", padding: "5px 8px" }}>
                          <button onClick={e => { e.stopPropagation(); decreaseQty(p._id); }} style={{ background: "none", border: "none", fontWeight: "900", fontSize: "16px", cursor: "pointer" }}>−</button>
                          <span style={{ fontWeight: "900", fontSize: "13px" }}>{inCartSim.qty}</span>
                          <button onClick={e => { e.stopPropagation(); increaseQty(p._id); }} style={{ background: "none", border: "none", fontWeight: "900", fontSize: "16px", cursor: "pointer" }}>+</button>
                        </div>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation(); addToCart(p); toast.success("Added to cart 🛒"); }}
                          style={{ width: "100%", padding: "8px", border: "2px solid #111", background: "transparent", color: "#111", fontWeight: "800", fontSize: "11px", letterSpacing: "0.8px", textTransform: "uppercase", cursor: "pointer", borderRadius: "5px", fontFamily: "'DM Sans', sans-serif" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#FEE12B"; e.currentTarget.style.borderColor = "#FEE12B"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#111"; }}>
                          + Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* BACKEND NOTE — delete this comment before deploying */}
      {/* 
        Add to productRoutes.js:

        // GET /api/products/:id/reviews
        router.get("/:id/reviews", async (req, res) => {
          const product = await Product.findById(req.params.id).select("reviews");
          if (!product) return res.status(404).json({ message: "Not found" });
          res.json(product.reviews || []);
        });

        // POST /api/products/:id/reviews  (protected)
        router.post("/:id/reviews", protect, async (req, res) => {
          const { name, rating, comment } = req.body;
          const review = { name, rating: Number(rating), comment, createdAt: new Date() };
          await Product.findByIdAndUpdate(req.params.id, { $push: { reviews: review } });
          const updated = await Product.findById(req.params.id).select("reviews");
          res.json(updated.reviews);
        });

        Add to Product schema:
          originalPrice: Number,
          deliveryDays:  { type: Number, default: 5 },
          brand: String, sku: String,
          reviews: [{ name: String, rating: Number, comment: String, createdAt: Date }]
      */}
    </div>
  );
}

const lbl = {
  display: "block", fontSize: "11px", fontWeight: "800", color: "#555",
  letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "7px"
};

export default ProductDetails;