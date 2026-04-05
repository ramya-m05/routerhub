import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";
import { useIsMobile } from "../hooks/useIsMobile";

function Cart() {
  const { cart, removeFromCart, increaseQty, decreaseQty } = useContext(CartContext);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const delivery = subtotal >= 999 ? 0 : 49;
  const total = subtotal + delivery;
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar setSearch={() => {}} />

      {/* HEADER */}
      <div style={{ background: "#111", padding: isMobile ? "28px 20px 22px" : "44px 40px 32px", borderBottom: "4px solid #FEE12B" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p style={{ fontSize: "12px", marginBottom: "8px" }}>
            <Link to="/store" style={{ color: "#FEE12B", textDecoration: "none", fontWeight: "700" }}>Store</Link>
            <span style={{ margin: "0 8px", color: "#555" }}>/</span>
            <span style={{ color: "#999" }}>Cart</span>
          </p>
          <h1 style={{ color: "white", fontSize: isMobile ? "32px" : "clamp(32px, 5vw, 56px)", fontWeight: "900", letterSpacing: "-1.5px", margin: "0 0 4px", lineHeight: 1 }}>Your Cart</h1>
          <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "20px 16px" : "40px", display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "20px" : "32px", alignItems: "flex-start" }}>

        {cart.length === 0 ? (
          <div style={{ flex: 1, textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>🛒</div>
            <h3 style={{ fontWeight: "900", color: "#111", margin: "0 0 8px", fontSize: "22px" }}>Your cart is empty</h3>
            <p style={{ color: "#aaa", margin: "0 0 24px" }}>Add something from the store</p>
            <Link to="/store" style={{ display: "inline-block", padding: "13px 28px", background: "#FEE12B", color: "#111", textDecoration: "none", fontWeight: "800", borderRadius: "8px" }}>Browse Store →</Link>
          </div>
        ) : (
          <>
            {/* ITEMS */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* HEADER ROW — desktop only */}
              {!isMobile && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "20px", padding: "0 0 12px", borderBottom: "2px solid #111", marginBottom: "4px" }}>
                  {["Product", "Qty", "Total"].map(col => (
                    <span key={col} style={{ fontSize: "10px", fontWeight: "800", letterSpacing: "1.5px", textTransform: "uppercase", color: "#999" }}>{col}</span>
                  ))}
                </div>
              )}

              {cart.map(item => (
                <div key={item._id} style={{
                  display: "flex",
                  gap: isMobile ? "14px" : "20px",
                  padding: isMobile ? "16px 0" : "20px 0",
                  borderBottom: "1px solid #eee",
                  alignItems: isMobile ? "flex-start" : "center"
                }}>
                  <img src={item.image || undefined} alt={item.name} style={{ width: isMobile ? "70px" : "80px", height: isMobile ? "70px" : "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid #f0f0f0", flexShrink: 0 }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontWeight: "800", fontSize: isMobile ? "14px" : "15px", color: "#111", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.2px" }}>{item.name}</h4>

                    {/* PRICE — with optional strikethrough */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "6px" }}>
                      <p style={{ color: "#111", fontSize: "13px", fontWeight: "700", margin: 0 }}>₹{item.price?.toLocaleString()}</p>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <p style={{ color: "#bbb", fontSize: "11px", fontWeight: "500", margin: 0, textDecoration: "line-through" }}>₹{item.originalPrice?.toLocaleString()}</p>
                      )}
                    </div>

                    {/* DELIVERY DATE */}
                    <p style={{ color: "#2563eb", fontSize: "11px", fontWeight: "700", margin: "0 0 8px", display: "flex", alignItems: "center", gap: "4px" }}>
                      🚚 Estimated delivery: {(() => {
                        const d = new Date();
                        d.setDate(d.getDate() + Number(item.deliveryDays || 5));
                        return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
                      })()}
                    </p>

                    {/* QTY — inline on mobile */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", border: "2px solid #111", borderRadius: "6px", overflow: "hidden" }}>
                        <button onClick={() => decreaseQty(item._id)} style={{ width: "34px", height: "34px", background: "white", border: "none", fontSize: "18px", fontWeight: "900", cursor: "pointer" }}>−</button>
                        <span style={{ width: "34px", textAlign: "center", fontWeight: "800", fontSize: "14px", borderLeft: "1px solid #eee", borderRight: "1px solid #eee" }}>{item.qty}</span>
                        <button onClick={() => increaseQty(item._id)} style={{ width: "34px", height: "34px", background: "white", border: "none", fontSize: "18px", fontWeight: "900", cursor: "pointer" }}>+</button>
                      </div>

                      {isMobile && (
                        <span style={{ fontWeight: "900", fontSize: "16px", color: "#111" }}>₹{(item.price * item.qty).toLocaleString()}</span>
                      )}
                    </div>

                    <button onClick={() => removeFromCart(item._id)} style={{ background: "none", border: "none", color: "#bbb", fontSize: "12px", fontWeight: "700", cursor: "pointer", padding: "6px 0 0", letterSpacing: "0.3px" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#cc0000"}
                      onMouseLeave={e => e.currentTarget.style.color = "#bbb"}>
                      × Remove
                    </button>
                  </div>

                  {/* TOTAL — desktop only */}
                  {!isMobile && (
                    <div style={{ fontWeight: "900", fontSize: "17px", color: "#111", letterSpacing: "-0.3px", flexShrink: 0 }}>
                      ₹{(item.price * item.qty).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}

              <div style={{ padding: "16px 0 0" }}>
                <Link to="/store" style={{ color: "#999", textDecoration: "none", fontSize: "13px", fontWeight: "700" }}>← Continue Shopping</Link>
              </div>
            </div>

            {/* SUMMARY */}
            <div style={{ width: isMobile ? "100%" : "340px", flexShrink: 0, position: isMobile ? "static" : "sticky", top: "24px" }}>
              <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid #ececec" }}>
                <h3 style={{ fontWeight: "900", fontSize: "17px", color: "#111", margin: "0 0 18px", paddingBottom: "14px", borderBottom: "2px solid #111" }}>Order Summary</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                  {cart.map(item => (
                    <div key={item._id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>{item.name} <span style={{ color: "#aaa" }}>×{item.qty}</span></span>
                      <span style={{ fontWeight: "700" }}>₹{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div style={{ height: "1px", background: "#eee", margin: "12px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#666", fontSize: "13px" }}>Subtotal</span>
                  <span style={{ fontWeight: "700" }}>₹{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666", fontSize: "13px" }}>Delivery</span>
                  <span style={{ fontWeight: "700", color: delivery === 0 ? "#22c55e" : "#111" }}>{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
                </div>
                {subtotal < 499 && (
                  <p style={{ fontSize: "11px", color: "#aaa", margin: "8px 0 0", fontWeight: "500" }}>Add ₹{(499 - subtotal).toLocaleString()} more for free delivery</p>
                )}
                <div style={{ height: "1px", background: "#eee", margin: "14px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                  <span style={{ fontWeight: "900", fontSize: "17px" }}>Total</span>
                  <span style={{ fontWeight: "900", fontSize: "21px", letterSpacing: "-0.5px" }}>₹{total.toLocaleString()}</span>
                </div>

                <button onClick={() => navigate("/checkout")}
                  style={{ width: "100%", padding: "14px", background: "#FEE12B", color: "#111", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "15px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f5d400"}
                  onMouseLeave={e => e.currentTarget.style.background = "#FEE12B"}>
                  Proceed to Checkout →
                </button>

                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {["🔒 Secure checkout", "💳 All cards accepted"].map((t, i) => (
                    <span key={i} style={{ fontSize: "12px", color: "#888", fontWeight: "500" }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;