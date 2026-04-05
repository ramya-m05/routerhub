import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const STATUS_STYLE = {
  pending:   { color: "#cc8800", bg: "#FFFCEB", icon: "🕐" },
  confirmed: { color: "#2563eb", bg: "#EFF6FF", icon: "✅" },
  shipped:   { color: "#7c3aed", bg: "#F5F3FF", icon: "🚚" },
  delivered: { color: "#16a34a", bg: "#F0FDF4", icon: "📦" },
  cancelled: { color: "#dc2626", bg: "#FEF2F2", icon: "❌" }
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/my");
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const shortId = (id) => id?.slice(-8).toUpperCase() || "—";
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar setSearch={() => {}} />

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <p style={styles.breadcrumb}>
            <Link to="/store" style={{ color: "#FEE12B", textDecoration: "none", fontWeight: "700" }}>Store</Link>
            <span style={{ margin: "0 8px", color: "#555" }}>/</span>
            <span style={{ color: "#999" }}>My Orders</span>
          </p>
          <h1 style={styles.pageTitle}>My Orders</h1>
          <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
          </p>
        </div>
      </div>

      <div style={styles.content}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px" }}>
            <div style={styles.spinner} />
          </div>
        ) : orders.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: "56px", marginBottom: "20px" }}>📦</div>
            <h3 style={{ fontWeight: "900", color: "#111", margin: "0 0 8px", fontSize: "24px", letterSpacing: "-0.5px" }}>
              No orders yet
            </h3>
            <p style={{ color: "#aaa", margin: "0 0 28px" }}>
              Start shopping to see your orders here
            </p>
            <Link to="/store" style={styles.shopBtn}>Browse Store →</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {orders.map(order => {
              const cfg = STATUS_STYLE[order.status?.toLowerCase()] || STATUS_STYLE.pending;
              const isExpanded = expandedId === order._id;

              return (
                <div key={order._id} style={styles.orderCard}>
                  {/* HEADER ROW */}
                  <div
                    style={styles.orderHeader}
                    onClick={() => setExpandedId(isExpanded ? null : order._id)}
                  >
                    <img
                      src={order.items?.[0]?.image || ""}
                      alt=""
                      style={styles.orderThumb}
                      onError={e => (e.target.style.display = "none")}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <p style={styles.orderId}>#{shortId(order._id)}</p>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          padding: "3px 9px", borderRadius: "5px", fontSize: "11px",
                          fontWeight: "800", background: cfg.bg, color: cfg.color
                        }}>
                          {cfg.icon} {order.status || "pending"}
                        </span>
                        {order.paymentMode === "cod" && (
                          <span style={{ fontSize: "10px", fontWeight: "700", background: "#f0f0f0", color: "#555", padding: "3px 8px", borderRadius: "4px" }}>
                            COD
                          </span>
                        )}
                      </div>
                      <p style={styles.orderMeta}>
                        {order.items?.length} item{order.items?.length !== 1 ? "s" : ""} · {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={styles.orderTotal}>₹{order.totalAmount?.toLocaleString()}</p>
                      {order.paymentMode === "cod" && order.amountDueOnDelivery > 0 && (
                        <p style={{ fontSize: "11px", color: "#cc8800", fontWeight: "700", margin: 0 }}>
                          ₹{order.amountDueOnDelivery?.toLocaleString()} due on delivery
                        </p>
                      )}
                    </div>

                    <span style={{ color: "#ccc", fontSize: "11px", flexShrink: 0, marginLeft: "12px" }}>
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>

                  {/* EXPANDED */}
                  {isExpanded && (
                    <div style={styles.expandSection}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                        {order.items?.map((item, i) => (
                          <div key={i} style={styles.detailItem}>
                            <img
                              src={item.image || ""}
                              alt={item.name}
                              style={styles.detailImg}
                              onError={e => (e.target.style.display = "none")}
                            />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: "700", fontSize: "14px", color: "#111", margin: "0 0 2px" }}>{item.name}</p>
                              <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>Qty: {item.qty} × ₹{item.price?.toLocaleString()}</p>
                            </div>
                            <span style={{ fontWeight: "800", fontSize: "14px", color: "#111" }}>
                              ₹{(item.price * item.qty).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div style={styles.detailFooter}>
                        <div style={{ fontSize: "13px", color: "#666" }}>
                          <span style={{ fontWeight: "700", color: "#111" }}>Deliver to: </span>
                          {order.address || "—"}
                        </div>
                        <div style={{ fontWeight: "900", fontSize: "16px" }}>
                          Total: ₹{order.totalAmount?.toLocaleString()}
                        </div>
                      </div>

                      {/* COD PAYMENT BREAKDOWN */}
                      {order.paymentMode === "cod" && (
                        <div style={styles.codInfo}>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: "#cc8800" }}>
                            💵 COD: ₹{order.advancePaid || 150} paid advance · ₹{order.amountDueOnDelivery?.toLocaleString()} due on delivery
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: { background: "#111", padding: "44px 40px 32px", borderBottom: "4px solid #FEE12B" },
  headerInner: { maxWidth: "900px", margin: "0 auto" },
  breadcrumb: { fontSize: "12px", marginBottom: "10px" },
  pageTitle: { color: "white", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: "900", letterSpacing: "-1.5px", margin: "0 0 6px", lineHeight: 1 },
  content: { maxWidth: "900px", margin: "0 auto", padding: "40px" },
  empty: { textAlign: "center", padding: "80px 20px" },
  shopBtn: { display: "inline-block", padding: "13px 28px", background: "#FEE12B", color: "#111", textDecoration: "none", fontWeight: "800", borderRadius: "8px", fontSize: "14px" },
  orderCard: { background: "white", borderRadius: "12px", border: "1px solid #ececec", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" },
  orderHeader: { display: "flex", alignItems: "center", gap: "16px", padding: "18px 20px", cursor: "pointer" },
  orderThumb: { width: "52px", height: "52px", objectFit: "cover", borderRadius: "8px", border: "1px solid #f0f0f0", flexShrink: 0 },
  orderId: { fontWeight: "900", fontSize: "13px", color: "#111", margin: 0, letterSpacing: "0.5px", fontFamily: "monospace" },
  orderMeta: { fontSize: "12px", color: "#aaa", margin: 0, fontWeight: "500" },
  orderTotal: { fontWeight: "900", fontSize: "17px", color: "#111", margin: "0 0 2px", letterSpacing: "-0.3px" },
  expandSection: { borderTop: "1px solid #f0f0f0", padding: "18px 20px" },
  detailItem: { display: "flex", alignItems: "center", gap: "14px", padding: "10px 14px", background: "#F7F7F5", borderRadius: "8px" },
  detailImg: { width: "44px", height: "44px", objectFit: "cover", borderRadius: "6px", border: "1px solid #eee", flexShrink: 0 },
  detailFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "1px solid #f0f0f0", flexWrap: "wrap", gap: "10px" },
  codInfo: { marginTop: "12px", padding: "10px 14px", background: "#FFFCEB", borderRadius: "8px", border: "1px solid #FEE12B" },
  spinner: { width: "36px", height: "36px", border: "3px solid #eee", borderTop: "3px solid #FEE12B", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }
};

export default Orders;