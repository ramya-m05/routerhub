import { useEffect, useState, useMemo } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  pending:   { color: "#cc8800", bg: "#FFFCEB", label: "Pending",   icon: "🕐" },
  confirmed: { color: "#2563eb", bg: "#EFF6FF", label: "Confirmed", icon: "✅" },
  shipped:   { color: "#7c3aed", bg: "#F5F3FF", label: "Shipped",   icon: "🚚" },
  delivered: { color: "#16a34a", bg: "#F0FDF4", label: "Delivered", icon: "📦" },
  cancelled: { color: "#dc2626", bg: "#FEF2F2", label: "Cancelled", icon: "❌" }
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/admin");
      setOrders(res.data);
    } catch (err) {
      toast.error("Failed to fetch orders");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await API.put(`/orders/${id}`, { status });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      toast.success(`Order marked as ${status}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // STATS
  const stats = useMemo(() => {
    const total = orders.length;
    const revenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.totalAmount || 0), 0);
    const pending = orders.filter(o => o.status === "pending").length;
    const delivered = orders.filter(o => o.status === "delivered").length;
    const cod = orders.filter(o => o.paymentMode === "cod").length;
    return { total, revenue, pending, delivered, cod };
  }, [orders]);

  // FILTER
  const filtered = useMemo(() => {
  return orders.filter(o => {
    const matchSearch =
      search === "" ||
      o._id?.toLowerCase().includes(search.toLowerCase()) ||
      (o.user?.name || "").toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus === "all" || o.status === filterStatus;

    const matchPayment =
      filterPayment === "all" || o.paymentMode === filterPayment;

    return matchSearch && matchStatus && matchPayment;
  });
}, [orders, search, filterStatus, filterPayment]);

  const shortId = (id) => id?.slice(-8).toUpperCase() || "—";

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerTop}>
            <div>
              <p style={styles.headerTag}>Routerkart · Admin</p>
              <h1 style={styles.headerTitle}>Order Management</h1>
            </div>
            <button
              onClick={() => { window.location.href = "/admin"; }}
              style={styles.backBtn}
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </div>

      <div style={styles.inner}>

        {/* STATS ROW */}
        <div style={styles.statsGrid}>
          {[
            { label: "Total Orders", value: stats.total, icon: "📋", color: "#111" },
            { label: "Revenue", value: `₹${stats.revenue?.toLocaleString()}`, icon: "💰", color: "#16a34a" },
            { label: "Pending", value: stats.pending, icon: "🕐", color: "#cc8800" },
            { label: "Delivered", value: stats.delivered, icon: "✅", color: "#2563eb" },
            { label: "COD Orders", value: stats.cod, icon: "🏠", color: "#7c3aed" },
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <span style={{ fontSize: "22px" }}>{s.icon}</span>
              <div>
                <p style={{ ...styles.statVal, color: s.color }}>{s.value}</p>
                <p style={styles.statLabel}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* TOOLBAR */}
        <div style={styles.toolbar}>
          {/* SEARCH */}
          <div style={styles.searchBox}>
            <span>🔍</span>
            <input
              placeholder="Search by Order ID or User..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* STATUS FILTER */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
              <option key={val} value={val}>{cfg.icon} {cfg.label}</option>
            ))}
          </select>

          {/* PAYMENT FILTER */}
          <select
            value={filterPayment}
            onChange={e => setFilterPayment(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Payments</option>
            <option value="online">Online</option>
            <option value="cod">COD</option>
          </select>

          <span style={styles.resultCount}>{filtered.length} orders</span>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px" }}>
            <div style={styles.spinner} />
          </div>
        )}

        {/* EMPTY */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
            <h3 style={{ fontWeight: "900", color: "#111", margin: "0 0 8px" }}>No orders found</h3>
            <p style={{ color: "#aaa" }}>Try adjusting your filters</p>
          </div>
        )}

        {/* ORDERS LIST */}
        <div style={styles.ordersList}>
          {filtered.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const isExpanded = expandedId === order._id;
            const isUpdating = updatingId === order._id;

            return (
              <div key={order._id} style={styles.orderCard}>
                {/* MAIN ROW */}
                <div style={styles.orderRow}>
                  {/* ID + DATE */}
                  <div style={{ minWidth: "130px" }}>
                    <p style={styles.orderId}>#{shortId(order._id)}</p>
                    <p style={styles.orderDate}>{formatDate(order.createdAt)}</p>
                  </div>

                  {/* USER */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={styles.userName}>
                      {order.userId?.name || order.userId || "Unknown User"}
                    </p>
                    <p style={styles.userPhone}>{order.phone || "—"}</p>
                  </div>

                  {/* ITEMS PREVIEW */}
                  <div style={{ minWidth: "140px" }}>
                    <p style={styles.itemsPreview}>
                      {order.items?.slice(0, 2).map(i => i.name).join(", ")}
                      {order.items?.length > 2 ? ` +${order.items.length - 2} more` : ""}
                    </p>
                    <p style={styles.itemCount}>{order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}</p>
                  </div>

                  {/* AMOUNT */}
                  <div style={{ minWidth: "100px", textAlign: "right" }}>
                    <p style={styles.amount}>₹{order.totalAmount?.toLocaleString() || "—"}</p>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      padding: "2px 7px",
                      borderRadius: "3px",
                      background: order.paymentMode === "cod" ? "#f0f0f0" : "#FFFDF0",
                      color: order.paymentMode === "cod" ? "#555" : "#cc8800",
                      letterSpacing: "0.5px"
                    }}>
                      {order.paymentMode === "cod" ? "COD" : "ONLINE"}
                    </span>
                  </div>

                  {/* STATUS BADGE */}
                  <div style={{ minWidth: "110px" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "800",
                      background: cfg.bg,
                      color: cfg.color,
                      letterSpacing: "0.3px"
                    }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div style={styles.orderActions}>
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order._id, e.target.value)}
                      disabled={isUpdating}
                      style={styles.statusSelect}
                    >
                      {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                        <option key={val} value={val}>{cfg.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order._id)}
                      style={styles.expandBtn}
                    >
                      {isExpanded ? "▲" : "▼"}
                    </button>
                  </div>
                </div>

                {/* EXPANDED DETAILS */}
                {isExpanded && (
                  <div style={styles.expandedSection}>
                    <div style={styles.expandedGrid}>

                      {/* ITEMS TABLE */}
                      <div style={styles.expandedBlock}>
                        <p style={styles.expandedLabel}>Order Items</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {order.items?.map((item, i) => (
                            <div key={i} style={styles.expandedItem}>
                              <span style={styles.itemName}>{item.name}</span>
                              <span style={{ color: "#999", fontSize: "12px" }}>×{item.qty}</span>
                              <span style={styles.itemPrice}>₹{(item.price * item.qty).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* DELIVERY INFO */}
                      <div style={styles.expandedBlock}>
                        <p style={styles.expandedLabel}>Delivery Address</p>
                        <p style={styles.expandedValue}>{order.address || "—"}</p>

                        <p style={{ ...styles.expandedLabel, marginTop: "16px" }}>Phone</p>
                        <p style={styles.expandedValue}>{order.phone || "—"}</p>
                      </div>

                      {/* PAYMENT INFO */}
                      <div style={styles.expandedBlock}>
                        <p style={styles.expandedLabel}>Payment Details</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={styles.payRow}>
                            <span style={{ color: "#888" }}>Mode</span>
                            <span style={{ fontWeight: "700", textTransform: "capitalize" }}>
                              {order.paymentMode || "—"}
                            </span>
                          </div>
                          {order.paymentMode === "cod" && (
                            <>
                              <div style={styles.payRow}>
                                <span style={{ color: "#888" }}>Advance Paid</span>
                                <span style={{ fontWeight: "700", color: "#22863a" }}>₹{order.advancePaid || 150}</span>
                              </div>
                              <div style={styles.payRow}>
                                <span style={{ color: "#888" }}>Due on Delivery</span>
                                <span style={{ fontWeight: "700", color: "#cc8800" }}>₹{order.amountDueOnDelivery?.toLocaleString() || "—"}</span>
                              </div>
                            </>
                          )}
                          <div style={styles.payRow}>
                            <span style={{ color: "#888" }}>Status</span>
                            <span style={{ fontWeight: "700", textTransform: "capitalize" }}>
                              {order.paymentStatus?.replace("_", " ") || "—"}
                            </span>
                          </div>
                          <div style={{ ...styles.payRow, borderTop: "1px solid #eee", paddingTop: "8px", marginTop: "4px" }}>
                            <span style={{ fontWeight: "800" }}>Total</span>
                            <span style={{ fontWeight: "900", fontSize: "16px" }}>₹{order.totalAmount?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* FULL ORDER ID */}
                    <p style={{ fontSize: "11px", color: "#ccc", marginTop: "12px", fontFamily: "monospace" }}>
                      Order ID: {order._id}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

const styles = {
  header: { background: "#111", padding: "44px 40px 32px", borderBottom: "4px solid #FEE12B" },
  headerInner: { maxWidth: "1400px", margin: "0 auto" },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-end" },
  headerTag: { fontSize: "10px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#FEE12B", marginBottom: "8px" },
  headerTitle: { color: "white", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "900", letterSpacing: "-1px", margin: 0, lineHeight: 1 },
  backBtn: { padding: "10px 18px", background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif" },
  inner: { maxWidth: "1400px", margin: "0 auto", padding: "32px 40px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "28px" },
  statCard: { background: "white", borderRadius: "10px", padding: "18px", display: "flex", alignItems: "center", gap: "14px", border: "1px solid #ececec", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" },
  statVal: { fontWeight: "900", fontSize: "20px", margin: "0 0 2px", letterSpacing: "-0.5px" },
  statLabel: { fontSize: "11px", color: "#aaa", margin: 0, fontWeight: "600" },
  toolbar: { display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" },
  searchBox: { display: "flex", alignItems: "center", gap: "8px", border: "2px solid #ececec", borderRadius: "8px", padding: "0 14px", background: "white", flex: 1, minWidth: "200px" },
  searchInput: { border: "none", outline: "none", padding: "11px 0", fontSize: "13px", color: "#111", background: "transparent", flex: 1, fontFamily: "'DM Sans', sans-serif" },
  filterSelect: { padding: "11px 14px", border: "2px solid #ececec", borderRadius: "8px", fontSize: "13px", fontWeight: "600", color: "#111", background: "white", outline: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  resultCount: { fontSize: "12px", color: "#aaa", fontWeight: "700", whiteSpace: "nowrap" },
  ordersList: { display: "flex", flexDirection: "column", gap: "12px" },
  orderCard: { background: "white", borderRadius: "12px", border: "1px solid #ececec", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" },
  orderRow: { display: "flex", alignItems: "center", gap: "20px", padding: "18px 24px", flexWrap: "wrap" },
  orderId: { fontWeight: "900", fontSize: "14px", color: "#111", margin: "0 0 3px", fontFamily: "monospace", letterSpacing: "1px" },
  orderDate: { fontSize: "11px", color: "#aaa", margin: 0, fontWeight: "600" },
  userName: { fontWeight: "700", fontSize: "14px", color: "#111", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  userPhone: { fontSize: "12px", color: "#aaa", margin: 0 },
  itemsPreview: { fontSize: "12px", color: "#666", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: "600" },
  itemCount: { fontSize: "11px", color: "#aaa", margin: 0 },
  amount: { fontWeight: "900", fontSize: "16px", color: "#111", margin: "0 0 5px", letterSpacing: "-0.3px" },
  orderActions: { display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 },
  statusSelect: { padding: "8px 12px", border: "2px solid #ececec", borderRadius: "6px", fontSize: "12px", fontWeight: "700", color: "#111", background: "white", outline: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  expandBtn: { width: "34px", height: "34px", border: "2px solid #ececec", background: "white", borderRadius: "6px", cursor: "pointer", fontSize: "10px", fontWeight: "700", color: "#555" },
  expandedSection: { padding: "20px 24px 24px", borderTop: "2px solid #f0f0f0", background: "#FAFAF8" },
  expandedGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" },
  expandedBlock: {},
  expandedLabel: { fontSize: "10px", fontWeight: "800", letterSpacing: "1.5px", textTransform: "uppercase", color: "#aaa", margin: "0 0 10px" },
  expandedValue: { fontSize: "13px", fontWeight: "600", color: "#444", margin: 0, lineHeight: 1.5 },
  expandedItem: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", padding: "6px 10px", background: "white", borderRadius: "6px", border: "1px solid #eee" },
  itemName: { fontSize: "13px", fontWeight: "600", color: "#111", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  itemPrice: { fontWeight: "800", fontSize: "13px", color: "#111" },
  payRow: { display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" },
  spinner: { width: "36px", height: "36px", border: "3px solid #eee", borderTop: "3px solid #FEE12B", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }
};

export default AdminOrders;