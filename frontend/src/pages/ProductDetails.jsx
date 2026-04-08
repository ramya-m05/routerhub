import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import toast from "react-hot-toast";
import { useIsMobile } from "../hooks/useIsMobile";

const getDeliveryDate = (days = 5) => {
  const d = new Date();
  d.setDate(d.getDate() + Number(days));
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};
const discountPct = (orig, sell) => orig > sell ? Math.round(((orig - sell) / orig) * 100) : 0;

/* ─── Star Rating ─────────────────────────── */
function Stars({ value, onChange, size = 18, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1,2,3,4,5].map(s => (
        <span key={s}
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{ fontSize: `${size}px`, cursor: readonly ? "default" : "pointer", color: s <= (hover || value) ? "#FEE12B" : "#e0e0e0", transition: "color 0.1s", lineHeight: 1 }}>★</span>
      ))}
    </div>
  );
}

/* ─── Lightbox with pinch-to-zoom style ───── */
function Lightbox({ images, startIdx, onClose }) {
  const [idx,   setIdx]       = useState(startIdx);
  const [scale, setScale]     = useState(1);
  const [pos,   setPos]       = useState({ x: 0, y: 0 });
  const isDragging  = useRef(false);
  const dragOrigin  = useRef({ x: 0, y: 0 });

  const go   = (n) => { setIdx(n); setScale(1); setPos({ x: 0, y: 0 }); };
  const prev = () => go((idx - 1 + images.length) % images.length);
  const next = () => go((idx + 1) % images.length);
  const zoomIn  = () => setScale(s => Math.min(s + 0.5, 5));
  const zoomOut = () => { setScale(s => { const n = Math.max(s - 0.5, 1); if (n === 1) setPos({ x: 0, y: 0 }); return n; }); };
  const reset   = () => { setScale(1); setPos({ x: 0, y: 0 }); };

  // Keyboard
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowRight")  next();
      if (e.key === "ArrowLeft")   prev();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-")           zoomOut();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [idx]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    isDragging.current = true;
    dragOrigin.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };
  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    setPos({ x: e.clientX - dragOrigin.current.x, y: e.clientY - dragOrigin.current.y });
  };
  const handleMouseUp = () => { isDragging.current = false; };

  // Touch support
  const touchOrigin = useRef(null);
  const handleTouchStart = (e) => {
    if (scale <= 1) return;
    const t = e.touches[0];
    touchOrigin.current = { x: t.clientX - pos.x, y: t.clientY - pos.y };
  };
  const handleTouchMove = (e) => {
    if (!touchOrigin.current) return;
    const t = e.touches[0];
    setPos({ x: t.clientX - touchOrigin.current.x, y: t.clientY - touchOrigin.current.y });
  };
  const handleTouchEnd = () => { touchOrigin.current = null; };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      {/* TOP BAR */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(0,0,0,0.6)", zIndex: 2, backdropFilter: "blur(8px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>
            {idx + 1} / {images.length}
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* Zoom controls */}
          <button onClick={zoomOut} disabled={scale <= 1}
            style={{ width: "34px", height: "34px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "white", borderRadius: "8px", fontSize: "18px", fontWeight: "700", cursor: scale <= 1 ? "not-allowed" : "pointer", opacity: scale <= 1 ? 0.35 : 1, fontFamily: "'DM Sans', sans-serif" }}>−</button>
          <span style={{ color: "white", fontSize: "12px", fontWeight: "700", minWidth: "38px", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} disabled={scale >= 5}
            style={{ width: "34px", height: "34px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "white", borderRadius: "8px", fontSize: "18px", fontWeight: "700", cursor: scale >= 5 ? "not-allowed" : "pointer", opacity: scale >= 5 ? 0.35 : 1 }}>+</button>
          {scale > 1 && (
            <button onClick={reset}
              style={{ padding: "0 12px", height: "34px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "white", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Reset</button>
          )}
          {/* Close */}
          <button onClick={onClose}
            style={{ width: "34px", height: "34px", background: "#e53e3e", border: "none", color: "white", borderRadius: "8px", fontSize: "16px", cursor: "pointer", marginLeft: "4px" }}>✕</button>
        </div>
      </div>

      {/* MAIN IMAGE */}
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <img
          src={images[idx]}
          alt={`Photo ${idx + 1}`}
          draggable={false}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={() => scale === 1 ? zoomIn() : reset()}
          style={{
            maxWidth: "90vw",
            maxHeight: "80vh",
            objectFit: "contain",
            transform: `scale(${scale}) translate(${pos.x / scale}px, ${pos.y / scale}px)`,
            transition: isDragging.current ? "none" : "transform 0.2s",
            cursor: scale > 1 ? "grab" : "zoom-in",
            userSelect: "none",
            WebkitUserSelect: "none",
            borderRadius: "6px",
          }}
        />
      </div>

      {/* PREV / NEXT ARROWS */}
      {images.length > 1 && (
        <>
          <button onClick={prev}
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "white", width: "46px", height: "46px", borderRadius: "50%", fontSize: "22px", cursor: "pointer", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <button onClick={next}
            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "white", width: "46px", height: "46px", borderRadius: "50%", fontSize: "22px", cursor: "pointer", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </>
      )}

      {/* THUMBNAIL STRIP */}
      {images.length > 1 && (
        <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", padding: "8px 14px", background: "rgba(0,0,0,0.65)", borderRadius: "12px", maxWidth: "92vw", overflowX: "auto" }}>
          {images.map((img, i) => (
            <img key={i} src={img} alt="" onClick={() => go(i)}
              style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px", cursor: "pointer", border: i === idx ? "2px solid #FEE12B" : "2px solid rgba(255,255,255,0.15)", opacity: i === idx ? 1 : 0.55, transition: "all 0.15s", flexShrink: 0 }} />
          ))}
        </div>
      )}

      {/* HINT */}
      <p style={{ position: "absolute", bottom: images.length > 1 ? "82px" : "16px", left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.3)", fontSize: "11px", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif", pointerEvents: "none" }}>
        Double-tap or +/− to zoom · ← → arrows to navigate · Esc to close
      </p>
    </div>
  );
}

/* ─── Main Component ──────────────────────── */
function ProductDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { cart, addToCart, increaseQty, decreaseQty } = useContext(CartContext);
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);

  const [product,      setProduct]      = useState(null);
  const [allProducts,  setAllProducts]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [qty,          setQty]          = useState(1);
  const [activeImg,    setActiveImg]    = useState(0);
  const [lightboxIdx,  setLightboxIdx]  = useState(null);

  const [reviews,          setReviews]          = useState([]);
  const [hasBought,        setHasBought]        = useState(false);
  const [checkingBought,   setCheckingBought]   = useState(false);
  const [reviewRating,     setReviewRating]     = useState(5);
  const [reviewComment,    setReviewComment]    = useState("");
  const [submitting,       setSubmitting]       = useState(false);
  const [userReviewDone,   setUserReviewDone]   = useState(false);

  const thumbStripRef = useRef(null);

  const cartItem = product ? cart.find(i => i._id === product._id) : null;
  const wishItem = product ? wishlist.find(i => i._id === product._id) : null;

  // All images for this product
  const images = product
    ? (product.images?.length ? product.images : (product.image ? [product.image] : [])).filter(Boolean)
    : [];

  /* ── fetch ── */
  useEffect(() => {
    if (!id) return;
    setLoading(true); setError(null); setProduct(null); setActiveImg(0); setQty(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
    Promise.all([API.get(`/products/${id}`), API.get("/products")])
      .then(([pRes, allRes]) => { setProduct(pRes.data); setAllProducts(Array.isArray(allRes.data) ? allRes.data : []); })
      .catch(err => setError(err.response?.status === 404 ? "This product does not exist." : `Failed to load. (${err.response?.status || err.message})`))
      .finally(() => setLoading(false));
  }, [id]);

  /* ── reviews ── */
  useEffect(() => {
    if (!id) return;
    API.get(`/products/${id}/reviews`).then(r => setReviews(Array.isArray(r.data) ? r.data : [])).catch(() => setReviews([]));
  }, [id]);

  /* ── buyer check ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !id) return;
    setCheckingBought(true);
    API.get("/orders/my")
      .then(res => {
        const bought = (Array.isArray(res.data) ? res.data : []).some(o =>
          Array.isArray(o.items) && o.items.some(i => i.productId === id || i.productId?._id === id)
        );
        setHasBought(bought);
        const uName = localStorage.getItem("userName") || "";
        if (bought && uName) setUserReviewDone(reviews.some(r => r.name === uName));
      })
      .catch(() => setHasBought(false))
      .finally(() => setCheckingBought(false));
  }, [id, reviews]);

  /* ── submit review ── */
  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) { toast.error("Write your review first"); return; }
    setSubmitting(true);
    try {
      const name = localStorage.getItem("userName") || "Customer";
      await API.post(`/products/${id}/reviews`, { name, rating: reviewRating, comment: reviewComment.trim() });
      toast.success("Review submitted ✅");
      setReviewComment(""); setReviewRating(5); setUserReviewDone(true);
      API.get(`/products/${id}/reviews`).then(r => setReviews(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    } catch (err) { toast.error(err.response?.data?.message || "Failed to submit review"); }
    finally { setSubmitting(false); }
  };

  /* ── share ── */
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: product?.name, url }); return; } catch {} }
    navigator.clipboard?.writeText(url).then(() => toast.success("Link copied 🔗")).catch(() => toast.error("Copy failed"));
  };

  /* ── sync thumb strip when image changes ── */
  const selectImage = (i) => {
    setActiveImg(i);
    if (!thumbStripRef.current) return;
    const thumbs = thumbStripRef.current.querySelectorAll("[data-thumb]");
    thumbs[i]?.scrollIntoView({ inline: "center", behavior: "smooth" });
  };

  /* ── keyboard nav (when lightbox closed) ── */
  useEffect(() => {
    if (lightboxIdx !== null || images.length <= 1) return;
    const h = (e) => {
      if (e.key === "ArrowRight") selectImage((activeImg + 1) % images.length);
      if (e.key === "ArrowLeft")  selectImage((activeImg - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [activeImg, images.length, lightboxIdx]);

  const similar   = allProducts.filter(p => p._id !== id && p.category === product?.category).slice(0, 8);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1) : 0;

  /* ── LOADING ── */
  if (loading) return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar setSearch={() => {}} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", border: "4px solid #eee", borderTop: "4px solid #FEE12B", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#aaa", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }}>Loading product...</p>
      </div>
    </div>
  );

  /* ── ERROR ── */
  if (error || !product) return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar setSearch={() => {}} />
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>😕</div>
        <h2 style={{ fontWeight: "900", fontSize: "22px", color: "#111", margin: "0 0 8px" }}>Product not found</h2>
        <p style={{ color: "#999", marginBottom: "24px", fontSize: "14px" }}>{error}</p>
        <Link to="/store" style={{ display: "inline-block", padding: "13px 28px", background: "#FEE12B", color: "#111", textDecoration: "none", fontWeight: "800", borderRadius: "8px" }}>← Back to Store</Link>
      </div>
    </div>
  );

  const inStock    = product.stock > 0;
  const hasDisc    = product.originalPrice && Number(product.originalPrice) > Number(product.price);
  const disc       = hasDisc ? discountPct(Number(product.originalPrice), Number(product.price)) : 0;

  return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar setSearch={() => {}} />

      {/* LIGHTBOX */}
      {lightboxIdx !== null && (
        <Lightbox images={images} startIdx={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: isMobile ? "14px 14px 40px" : "28px 40px 60px" }}>

        {/* BREADCRUMB */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "18px", fontSize: "13px", flexWrap: "wrap" }}>
          <Link to="/"      style={{ color: "#FEE12B", textDecoration: "none", fontWeight: "700" }}>Home</Link>
          <span style={{ color: "#ccc" }}>/</span>
          <Link to="/store" style={{ color: "#FEE12B", textDecoration: "none", fontWeight: "700" }}>Store</Link>
          <span style={{ color: "#ccc" }}>/</span>
          <Link to={`/store?category=${product.category}`} style={{ color: "#FEE12B", textDecoration: "none", fontWeight: "700" }}>{product.category}</Link>
          <span style={{ color: "#ccc" }}>/</span>
          <span style={{ color: "#999", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "220px" }}>{product.name}</span>
        </div>

        {/* ══ PRODUCT ══════════════════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "20px" : "44px", background: "white", borderRadius: "16px", padding: isMobile ? "14px" : "28px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #ececec", marginBottom: "22px" }}>

          {/* ── IMAGE GALLERY ── */}
          <div style={{ width: isMobile ? "100%" : "400px", flexShrink: 0 }}>

            {/* BIG IMAGE */}
            <div style={{ position: "relative", background: "#f5f5f0", borderRadius: "12px", overflow: "hidden", border: "1px solid #eee", marginBottom: "10px" }}>
              {images.length > 0 ? (
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  onClick={() => setLightboxIdx(activeImg)}
                  style={{ width: "100%", height: isMobile ? "270px" : "390px", objectFit: "cover", display: "block", cursor: "zoom-in" }}
                />
              ) : (
                <div style={{ width: "100%", height: isMobile ? "270px" : "390px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f0f0" }}>
                  <span style={{ fontSize: "60px" }}>📦</span>
                </div>
              )}

              {/* Overlays */}
              {hasDisc && (
                <div style={{ position: "absolute", top: "12px", left: "12px", background: "#e53e3e", color: "white", padding: "4px 10px", borderRadius: "5px", fontWeight: "900", fontSize: "13px" }}>-{disc}% OFF</div>
              )}
              {product.stock > 0 && product.stock <= 3 && (
                <div style={{ position: "absolute", bottom: "12px", left: "12px", background: "rgba(254,225,43,0.95)", color: "#111", padding: "4px 12px", borderRadius: "5px", fontWeight: "800", fontSize: "12px" }}>⚡ Only {product.stock} left!</div>
              )}
              {!inStock && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ background: "#e53e3e", color: "white", padding: "10px 24px", borderRadius: "8px", fontWeight: "900", fontSize: "16px" }}>Out of Stock</span>
                </div>
              )}

              {/* Zoom hint badge */}
              {images.length > 0 && (
                <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.5)", color: "white", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: "4px" }}>
                  🔍 Tap to zoom
                </div>
              )}

              {/* Desktop L/R arrows */}
              {!isMobile && images.length > 1 && (
                <>
                  <button onClick={() => selectImage((activeImg - 1 + images.length) % images.length)}
                    style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.88)", border: "none", borderRadius: "50%", width: "36px", height: "36px", fontSize: "18px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                  <button onClick={() => selectImage((activeImg + 1) % images.length)}
                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.88)", border: "none", borderRadius: "50%", width: "36px", height: "36px", fontSize: "18px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
                </>
              )}
            </div>

            {/* ── THUMBNAIL STRIP — horizontal scroll ── */}
            {images.length > 1 && (
              <div ref={thumbStripRef} style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                <style>{`.hide-scroll::-webkit-scrollbar{display:none}`}</style>
                {images.map((img, i) => (
                  <button
                    key={i}
                    data-thumb
                    onClick={() => selectImage(i)}
                    style={{ flexShrink: 0, width: isMobile ? "62px" : "72px", height: isMobile ? "62px" : "72px", border: i === activeImg ? "3px solid #FEE12B" : "2px solid #eee", borderRadius: "8px", overflow: "hidden", cursor: "pointer", padding: 0, background: "#f5f5f0", opacity: i === activeImg ? 1 : 0.65, transition: "all 0.15s" }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            )}

            {/* Mobile dot indicators */}
            {isMobile && images.length > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "10px" }}>
                {images.map((_, i) => (
                  <button key={i} onClick={() => selectImage(i)}
                    style={{ width: i === activeImg ? "20px" : "8px", height: "8px", borderRadius: "4px", border: "none", cursor: "pointer", padding: 0, background: i === activeImg ? "#111" : "#ddd", transition: "all 0.3s" }} />
                ))}
              </div>
            )}

            {/* Photo count label */}
            {images.length > 1 && (
              <p style={{ textAlign: "center", fontSize: "11px", color: "#aaa", fontWeight: "600", margin: "8px 0 0" }}>
                {images.length} photos · scroll to see all · click to zoom
              </p>
            )}

            {/* Wishlist + Share */}
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button onClick={() => wishItem ? removeFromWishlist(product._id) : addToWishlist(product)}
                style={{ flex: 1, padding: "11px", border: `2px solid ${wishItem ? "#e53e3e" : "#e5e5e5"}`, background: wishItem ? "#FEF2F2" : "white", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px", color: wishItem ? "#e53e3e" : "#555", fontFamily: "'DM Sans', sans-serif" }}>
                {wishItem ? "❤️ Wishlisted" : "🤍 Wishlist"}
              </button>
              <button onClick={handleShare}
                style={{ flex: 1, padding: "11px", border: "2px solid #e5e5e5", background: "white", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px", color: "#555", fontFamily: "'DM Sans', sans-serif" }}>
                🔗 Share
              </button>
            </div>
          </div>

          {/* ── PRODUCT INFO ── */}
          <div style={{ flex: 1, minWidth: 0, paddingTop: isMobile ? 0 : "6px" }}>
            <span style={{ display: "inline-block", background: "#FEE12B", color: "#111", fontSize: "10px", fontWeight: "800", letterSpacing: "1.5px", textTransform: "uppercase", padding: "4px 12px", borderRadius: "4px", marginBottom: "12px" }}>
              {product.category}
            </span>
            <h1 style={{ fontSize: isMobile ? "22px" : "clamp(22px,3vw,34px)", fontWeight: "900", color: "#111", margin: "0 0 12px", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
              {product.name}
            </h1>

            {reviews.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <Stars value={Math.round(+avgRating)} readonly size={15} />
                <span style={{ fontWeight: "800", fontSize: "14px" }}>{avgRating}</span>
                <span style={{ color: "#aaa", fontSize: "13px" }}>({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
              </div>
            )}

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
              <span style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: "900", color: "#111", letterSpacing: "-1px" }}>₹{Number(product.price).toLocaleString()}</span>
              {hasDisc && (
                <>
                  <span style={{ fontSize: isMobile ? "16px" : "18px", fontWeight: "600", color: "#bbb", textDecoration: "line-through" }}>₹{Number(product.originalPrice).toLocaleString()}</span>
                  <span style={{ fontSize: "13px", fontWeight: "900", color: "#fff", background: "#e53e3e", padding: "3px 10px", borderRadius: "5px" }}>{disc}% OFF</span>
                </>
              )}
            </div>

            {/* Stock */}
            <div style={{ marginBottom: "14px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", padding: "5px 12px", borderRadius: "20px", background: inStock ? "#F0FDF4" : "#FEF2F2", color: inStock ? "#16a34a" : "#e53e3e", border: `1px solid ${inStock ? "#bbf7d0" : "#fecaca"}` }}>
                {inStock ? `✅ In Stock — ${product.stock} units` : "❌ Out of Stock"}
              </span>
            </div>

            {/* Delivery */}
            <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
              <p style={{ fontWeight: "800", fontSize: "13px", color: "#1d4ed8", margin: "0 0 2px" }}>🚚 Free delivery by {getDeliveryDate(product.deliveryDays || 5)}</p>
              <p style={{ fontSize: "12px", color: "#60a5fa", margin: 0 }}>{product.deliveryDays || 5} working days · Order before 5 PM today</p>
            </div>

            {product.description && <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.75", margin: "0 0 16px" }}>{product.description}</p>}

            <div style={{ height: "1px", background: "#f0f0f0", margin: "14px 0" }} />

            {/* QTY + CTA */}
            {inStock ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#555" }}>Qty:</span>
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
                  {cartItem && <span style={{ fontSize: "12px", color: "#22863a", fontWeight: "700" }}>✅ In cart</span>}
                  {!cartItem && <span style={{ fontSize: "12px", color: "#aaa" }}>Max {product.stock}</span>}
                </div>
                <div style={{ display: "flex", gap: "12px", marginBottom: "18px", flexDirection: isMobile ? "column" : "row" }}>
                  {!cartItem && (
                    <button onClick={() => { addToCart({ ...product, qty }); toast.success("Added to cart 🛒"); }}
                      style={{ flex: 1, padding: "14px", background: "#FEE12B", color: "#111", border: "none", borderRadius: "10px", fontWeight: "900", fontSize: "15px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                      🛒 Add to Cart
                    </button>
                  )}
                  <button onClick={() => { addToCart({ ...product, qty }); navigate("/checkout"); }}
                    style={{ flex: 1, padding: "14px", background: "#111", color: "white", border: "none", borderRadius: "10px", fontWeight: "900", fontSize: "15px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                    Buy Now →
                  </button>
                </div>
              </>
            ) : (
              <button onClick={() => !wishItem && addToWishlist(product)}
                style={{ width: "100%", padding: "14px", background: "#f0f0f0", border: "2px solid #ddd", borderRadius: "10px", fontWeight: "800", fontSize: "14px", cursor: "pointer", marginBottom: "18px", fontFamily: "'DM Sans', sans-serif" }}>
                {wishItem ? "❤️ Saved" : "🔔 Notify Me"}
              </button>
            )}

            {/* Trust + Specs */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
              {["🚚 Free Delivery", "🔒 Secure Payment", "🔄 7-Day Returns", "✅ Genuine"].map((t, i) => (
                <span key={i} style={{ fontSize: "11px", fontWeight: "600", color: "#666", padding: "5px 10px", background: "#f7f7f5", borderRadius: "20px", border: "1px solid #eee" }}>{t}</span>
              ))}
            </div>
            {(product.brand || product.sku) && (
              <div style={{ padding: "12px 14px", background: "#F7F7F5", borderRadius: "8px" }}>
                {product.brand && <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}><span style={{ color: "#888", fontWeight: "600" }}>Brand</span><span style={{ color: "#111", fontWeight: "700" }}>{product.brand}</span></div>}
                {product.sku   && <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}><span style={{ color: "#888", fontWeight: "600" }}>SKU</span><span style={{ color: "#111", fontWeight: "700", fontFamily: "monospace" }}>{product.sku}</span></div>}
              </div>
            )}
          </div>
        </div>

        {/* ══ REVIEWS ════════════════════════════════════════ */}
        <div style={{ background: "white", borderRadius: "16px", padding: isMobile ? "18px 14px" : "28px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #ececec", marginBottom: "22px" }}>
          <h2 style={{ fontWeight: "900", fontSize: isMobile ? "18px" : "22px", color: "#111", margin: "0 0 20px", letterSpacing: "-0.5px" }}>⭐ Customer Reviews</h2>

          {reviews.length > 0 && (
            <div style={{ display: "flex", gap: "20px", alignItems: "center", padding: "16px", background: "#F7F7F5", borderRadius: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "46px", fontWeight: "900", color: "#111", margin: 0, lineHeight: 1, letterSpacing: "-2px" }}>{avgRating}</p>
                <Stars value={Math.round(+avgRating)} readonly size={16} />
                <p style={{ fontSize: "11px", color: "#aaa", margin: "6px 0 0" }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
              </div>
              <div style={{ flex: 1, minWidth: "160px" }}>
                {[5,4,3,2,1].map(star => {
                  const cnt = reviews.filter(r => +r.rating === star).length;
                  return (
                    <div key={star} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#555", width: "8px" }}>{star}</span>
                      <span style={{ color: "#FEE12B", fontSize: "11px" }}>★</span>
                      <div style={{ flex: 1, height: "5px", background: "#e5e5e5", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: reviews.length ? `${Math.round((cnt / reviews.length) * 100)}%` : "0%", background: "#FEE12B", borderRadius: "3px", transition: "width 0.6s" }} />
                      </div>
                      <span style={{ fontSize: "10px", color: "#aaa", width: "22px" }}>{cnt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {reviews.length === 0 && !hasBought && (
            <div style={{ textAlign: "center", padding: "28px 20px", marginBottom: "18px" }}>
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>💬</div>
              <p style={{ fontWeight: "700", color: "#111", margin: "0 0 4px" }}>No reviews yet</p>
              <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>Be the first to share your experience</p>
            </div>
          )}

          {reviews.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {reviews.map((r, i) => (
                <div key={i} style={{ padding: "14px", background: "#F9F9F7", borderRadius: "10px", border: "1px solid #eee" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#FEE12B", color: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "13px" }}>{(r.name || "?")[0].toUpperCase()}</div>
                      <div>
                        <p style={{ fontWeight: "800", fontSize: "14px", color: "#111", margin: "0 0 3px" }}>{r.name || "Customer"}</p>
                        <Stars value={+r.rating} readonly size={13} />
                      </div>
                      <span style={{ background: "#F0FDF4", color: "#16a34a", fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>✅ Verified</span>
                    </div>
                    <span style={{ fontSize: "12px", color: "#aaa" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}</span>
                  </div>
                  <p style={{ color: "#444", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Write review */}
          <div style={{ borderTop: "2px solid #f0f0f0", paddingTop: "20px" }}>
            {!localStorage.getItem("token") ? (
              <div style={{ background: "#F7F7F5", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                <p style={{ fontWeight: "700", color: "#111", margin: "0 0 10px" }}>Login to write a review</p>
                <button onClick={() => navigate("/login")} style={{ padding: "10px 22px", background: "#FEE12B", color: "#111", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Login</button>
              </div>
            ) : checkingBought ? (
              <p style={{ color: "#aaa", textAlign: "center", fontSize: "13px" }}>Checking purchase history...</p>
            ) : !hasBought ? (
              <div style={{ background: "#FFF9E6", border: "2px solid #FEE12B", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                <p style={{ fontWeight: "700", color: "#111", margin: "0 0 5px" }}>🛒 Purchase Required</p>
                <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>Only verified buyers can write a review.</p>
              </div>
            ) : userReviewDone ? (
              <div style={{ background: "#F0FDF4", border: "2px solid #bbf7d0", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                <p style={{ fontWeight: "700", color: "#16a34a", margin: 0 }}>✅ You've already reviewed this product. Thank you!</p>
              </div>
            ) : (
              <div>
                <h3 style={{ fontWeight: "900", fontSize: "16px", color: "#111", margin: "0 0 14px" }}>✍️ Write Your Review</h3>
                <p style={{ background: "#F0FDF4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "9px 13px", fontSize: "12px", color: "#16a34a", fontWeight: "600", margin: "0 0 14px" }}>✅ Verified Buyer — your review will show a Verified badge.</p>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#555", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "7px" }}>Rating</label>
                  <Stars value={reviewRating} onChange={setReviewRating} size={26} />
                  <p style={{ fontSize: "12px", color: "#aaa", margin: "5px 0 0" }}>{["","Very Bad","Bad","Average","Good","Excellent!"][reviewRating]}</p>
                </div>
                <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Share your honest experience..."
                  rows={4}
                  style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", color: "#111", background: "white", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif", resize: "vertical", marginBottom: "12px" }}
                  onFocus={e => e.target.style.borderColor = "#FEE12B"} onBlur={e => e.target.style.borderColor = "#e5e5e5"} />
                <button onClick={handleSubmitReview} disabled={submitting || reviewComment.length < 10}
                  style={{ padding: "11px 26px", background: "#FEE12B", color: "#111", border: "none", borderRadius: "8px", fontWeight: "900", fontSize: "14px", cursor: (submitting || reviewComment.length < 10) ? "not-allowed" : "pointer", opacity: (submitting || reviewComment.length < 10) ? 0.6 : 1, fontFamily: "'DM Sans', sans-serif" }}>
                  {submitting ? "Submitting..." : "Submit Review →"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ══ SIMILAR PRODUCTS ═══════════════════════════════ */}
        {similar.length > 0 && (
          <div style={{ background: "white", borderRadius: "16px", padding: isMobile ? "18px 14px" : "28px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #ececec" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <p style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#aaa", margin: "0 0 4px" }}>You might also like</p>
                <h2 style={{ fontWeight: "900", fontSize: isMobile ? "18px" : "22px", color: "#111", margin: 0, letterSpacing: "-0.5px" }}>Similar Products</h2>
              </div>
              <Link to={`/store?category=${product.category}`} style={{ fontSize: "13px", fontWeight: "700", color: "#FEE12B", textDecoration: "none" }}>View all →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(185px, 1fr))", gap: isMobile ? "12px" : "14px" }}>
              {similar.map(p => {
                const sThumb = (p.images?.[0] || p.image) || undefined;
                const sDisc  = p.originalPrice && +p.originalPrice > +p.price;
                const sCart  = cart.find(i => i._id === p._id);
                return (
                  <div key={p._id} onClick={() => navigate(`/product/${p._id}`)}
                    style={{ background: "#F9F9F7", borderRadius: "10px", overflow: "hidden", border: "1px solid #eee", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ position: "relative" }}>
                      {sThumb
                        ? <img src={sThumb} alt={p.name} style={{ width: "100%", height: isMobile ? "108px" : "140px", objectFit: "cover", display: "block" }} />
                        : <div style={{ width: "100%", height: isMobile ? "108px" : "140px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: "30px" }}>📦</span></div>
                      }
                      {sDisc && <span style={{ position: "absolute", top: "7px", left: "7px", background: "#e53e3e", color: "white", fontSize: "10px", fontWeight: "900", padding: "2px 6px", borderRadius: "4px" }}>-{discountPct(+p.originalPrice, +p.price)}%</span>}
                    </div>
                    <div style={{ padding: isMobile ? "9px 10px" : "12px" }}>
                      <p style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", color: "#aaa", margin: "0 0 3px" }}>{p.category}</p>
                      <p style={{ fontWeight: "700", fontSize: "13px", color: "#111", margin: "0 0 7px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "5px", marginBottom: "8px" }}>
                        <span style={{ fontWeight: "900", fontSize: "15px", color: "#111" }}>₹{Number(p.price).toLocaleString()}</span>
                        {sDisc && <span style={{ fontSize: "11px", color: "#bbb", textDecoration: "line-through" }}>₹{Number(p.originalPrice).toLocaleString()}</span>}
                      </div>
                      {sCart ? (
                        <div onClick={e => e.stopPropagation()} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FEE12B", borderRadius: "5px", padding: "5px 8px" }}>
                          <button onClick={e => { e.stopPropagation(); decreaseQty(p._id); }} style={{ background: "none", border: "none", fontWeight: "900", fontSize: "16px", cursor: "pointer" }}>−</button>
                          <span style={{ fontWeight: "900", fontSize: "13px" }}>{sCart.qty}</span>
                          <button onClick={e => { e.stopPropagation(); increaseQty(p._id); }} style={{ background: "none", border: "none", fontWeight: "900", fontSize: "16px", cursor: "pointer" }}>+</button>
                        </div>
                      ) : (
                        <button onClick={e => { e.stopPropagation(); addToCart(p); toast.success("Added 🛒"); }}
                          style={{ width: "100%", padding: "7px", border: "2px solid #111", background: "transparent", color: "#111", fontWeight: "800", fontSize: "11px", letterSpacing: "0.8px", textTransform: "uppercase", cursor: "pointer", borderRadius: "5px", fontFamily: "'DM Sans', sans-serif" }}
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
    </div>
  );
}

export default ProductDetails;