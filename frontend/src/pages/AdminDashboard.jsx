import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { useIsMobile } from "../hooks/useIsMobile";

function AdminDashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Product fields
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");  // ← strike-through price
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [category, setCategory] = useState("");
  const [preview, setPreview] = useState(null);
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("5");  // ← delivery days

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchProd, setSearchProd] = useState("");

  const [stats, setStats] = useState({ totalProducts: 0, lowStock: 0, totalValue: 0, categories: {} });
  const [sales, setSales] = useState({ revenue: 0, avgPrice: 0, topProduct: "" });

  if (!localStorage.getItem("token")) window.location.href = "/";

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
      calcStats(res.data); calcSales(res.data);
    } catch { toast.error("Failed to fetch products"); } finally { setLoading(false); }
  };
  useEffect(() => { fetchProducts(); }, []);

  const calcStats = (p) => {
    let totalProducts = p.length, lowStock = 0, totalValue = 0, categories = {};
    p.forEach(x => {
      totalValue += Number(x.price) * Number(x.stock);
      if (x.stock <= 3) lowStock++;
      categories[x.category] = (categories[x.category] || 0) + 1;
    });
    setStats({ totalProducts, lowStock, totalValue, categories });
  };
  const calcSales = (p) => {
    let revenue = 0, totalPrice = 0, topProduct = "", maxValue = 0;
    p.forEach(x => {
      const v = Number(x.price) * Number(x.stock);
      revenue += v; totalPrice += Number(x.price);
      if (v > maxValue) { maxValue = v; topProduct = x.name; }
    });
    setSales({ revenue, avgPrice: p.length ? (totalPrice / p.length).toFixed(0) : 0, topProduct });
  };

  const validate = () => {
    if (!name.trim()) { toast.error("Product name is required"); return false; }
    if (!category) { toast.error("Please select a category"); return false; }
    if (!price || isNaN(price) || Number(price) <= 0) { toast.error("Enter a valid selling price"); return false; }
    if (originalPrice && (isNaN(originalPrice) || Number(originalPrice) < Number(price))) {
      toast.error("Original price must be greater than selling price"); return false;
    }
    if (!stock || isNaN(stock) || Number(stock) < 0) { toast.error("Enter valid stock quantity"); return false; }
    if (!deliveryDays || isNaN(deliveryDays) || Number(deliveryDays) < 1) { toast.error("Enter valid delivery days (min 1)"); return false; }
    return true;
  };

  const buildForm = () => {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("category", category);
    fd.append("description", description);
    fd.append("price", price);
    fd.append("stock", stock);
    fd.append("deliveryDays", deliveryDays);
    if (originalPrice) fd.append("originalPrice", originalPrice);
    if (brand) fd.append("brand", brand);
    if (sku) fd.append("sku", sku);
    if (image) fd.append("image", image);
    return fd;
  };

  const addProduct = async () => {
    if (!validate()) return; setFormLoading(true);
    try { await API.post("/products", buildForm()); toast.success("Product added ✅"); fetchProducts(); resetForm(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to add product"); }
    finally { setFormLoading(false); }
  };

  const updateProduct = async (id) => {
    if (!validate()) return; setFormLoading(true);
    try { await API.put(`/products/${id}`, buildForm()); toast.success("Product updated ✅"); fetchProducts(); resetForm(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to update product"); }
    finally { setFormLoading(false); }
  };

  const deleteProduct = async (id) => {
    try { await API.delete(`/products/${id}`); toast.success("Product deleted"); setDeleteId(null); fetchProducts(); }
    catch { toast.error("Failed to delete"); }
  };

  const startEdit = (p) => {
    setEditingId(p._id); setName(p.name); setCategory(p.category);
    setDescription(p.description || ""); setPrice(p.price); setStock(p.stock);
    setOriginalPrice(p.originalPrice || ""); setDeliveryDays(p.deliveryDays || "5");
    setBrand(p.brand || ""); setSku(p.sku || "");
    setPreview(p.image); setImage(null);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const resetForm = () => {
    setName(""); setDescription(""); setPrice(""); setOriginalPrice(""); setStock(""); setCategory("");
    setDeliveryDays("5"); setBrand(""); setSku("");
    setImage(null); setPreview(null); setEditingId(null);
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(searchProd.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchProd.toLowerCase())
  );
  const catColors = ["#FEE12B", "#bfdbfe", "#bbf7d0", "#fde68a", "#e9d5ff"];
  const cats = ["Router", "Fiber Cable", "Fiber Tools", "Security", "Streaming Device"];

  const discountPct = (orig, sell) => orig > sell ? Math.round(((orig - sell) / orig) * 100) : 0;

  const inp = { width: "100%", padding: "11px 14px", border: "2px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", color: "#111", background: "white", outline: "none", transition: "border-color 0.15s", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" };
  const onFocus = e => e.target.style.borderColor = "#FEE12B";
  const onBlur = e => e.target.style.borderColor = "#e5e5e5";

  return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

      {/* HEADER */}
      <div style={{ background: "#111", padding: isMobile ? "24px 16px 20px" : "44px 40px 32px", borderBottom: "4px solid #FEE12B" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-end", flexDirection: isMobile ? "column" : "row", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#FEE12B", marginBottom: "6px" }}>RouterKart · Admin</p>
            <h1 style={{ color: "white", fontSize: isMobile ? "28px" : "clamp(28px,4vw,48px)", fontWeight: "900", letterSpacing: "-1px", margin: 0 }}>Dashboard</h1>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => navigate("/admin/orders")} style={{ padding: "10px 16px", background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif" }}>📋 Orders</button>
            <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} style={{ padding: "10px 16px", background: "#dc2626", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif" }}>Logout</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: isMobile ? "16px" : "32px 40px" }}>

        {/* LOW STOCK ALERT */}
        {stats.lowStock > 0 && (
          <div style={{ background: "#FFFCEB", border: "2px solid #FEE12B", borderRadius: "10px", padding: "12px 18px", marginBottom: "20px", fontSize: "14px", color: "#555", fontWeight: "600" }}>
            ⚠️ <strong>{stats.lowStock} product{stats.lowStock > 1 ? "s are" : " is"} running low on stock</strong>
          </div>
        )}

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)", gap: "12px", marginBottom: "20px" }}>
          {[
            { label: "Products", value: stats.totalProducts, icon: "📦" },
            { label: "Low Stock", value: stats.lowStock, icon: "⚠️", danger: true },
            { label: "Inventory Value", value: `₹${stats.totalValue?.toLocaleString()}`, icon: "💎" },
            { label: "Est. Revenue", value: `₹${sales.revenue?.toLocaleString()}`, icon: "💰" },
            { label: "Avg. Price", value: `₹${sales.avgPrice}`, icon: "📊" },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", borderRadius: "10px", padding: "16px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid #ececec", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize: "20px" }}>{s.icon}</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: "900", fontSize: isMobile ? "15px" : "17px", margin: "0 0 1px", color: s.danger && s.value > 0 ? "#dc2626" : "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.value}</p>
                <p style={{ fontSize: "10px", color: "#aaa", margin: 0, fontWeight: "600" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* PRODUCT TABLE */}
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #ececec", overflow: "hidden", marginBottom: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: "1px solid #f0f0f0", flexWrap: "wrap", gap: "10px" }}>
            <h3 style={{ fontWeight: "900", fontSize: "15px", color: "#111", margin: 0 }}>All Products</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #eee", borderRadius: "6px", padding: "0 12px", background: "#f9f9f9" }}>
              <span>🔍</span>
              <input placeholder="Search products..." value={searchProd} onChange={e => setSearchProd(e.target.value)}
                style={{ border: "none", outline: "none", padding: "8px 0", fontSize: "13px", background: "transparent", fontFamily: "'DM Sans', sans-serif", width: isMobile ? "100px" : "160px" }} />
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
              <thead>
                <tr style={{ background: "#F7F7F5", borderBottom: "1px solid #eee" }}>
                  {["Product", "Category", "Price", "Stock", "Delivery", "Actions"].map(col => (
                    <th key={col} style={{ padding: "10px 14px", textAlign: "left", fontSize: "10px", fontWeight: "800", letterSpacing: "1.2px", textTransform: "uppercase", color: "#aaa" }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ width: "30px", height: "30px", border: "3px solid #eee", borderTop: "3px solid #FEE12B", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#aaa", fontSize: "14px" }}>No products found</td></tr>
                ) : filtered.map(p => (
                  <tr key={p._id} style={{ borderBottom: "1px solid #f5f5f5" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FAFAF8"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src={p.image} alt={p.name} style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "8px", flexShrink: 0, border: "1px solid #f0f0f0" }} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: "700", fontSize: "13px", color: "#111", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>{p.name}</p>
                          {p.brand && <p style={{ fontSize: "11px", color: "#aaa", margin: 0 }}>{p.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "800", color: "#111", background: catColors[cats.indexOf(p.category) % 5] || "#f0f0f0" }}>{p.category}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div>
                        <span style={{ fontWeight: "900", fontSize: "14px", color: "#111" }}>₹{p.price?.toLocaleString()}</span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                            <span style={{ fontSize: "11px", color: "#bbb", textDecoration: "line-through" }}>₹{p.originalPrice?.toLocaleString()}</span>
                            <span style={{ fontSize: "10px", fontWeight: "800", color: "#e53e3e", background: "#FEF2F2", padding: "1px 5px", borderRadius: "3px" }}>{discountPct(p.originalPrice, p.price)}% OFF</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontWeight: "800", fontSize: "14px", color: p.stock === 0 ? "#dc2626" : p.stock <= 3 ? "#cc8800" : "#16a34a" }}>{p.stock}</span>
                      {p.stock > 0 && p.stock <= 3 && <span style={{ display: "block", fontSize: "9px", color: "#cc8800", fontWeight: "700" }}>LOW</span>}
                      {p.stock === 0 && <span style={{ display: "block", fontSize: "9px", color: "#dc2626", fontWeight: "700" }}>OUT</span>}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#2563eb" }}>🚚 {p.deliveryDays || 5} days</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => startEdit(p)} style={{ padding: "6px 10px", background: "#f7f7f5", border: "1px solid #eee", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif" }}>✏️ Edit</button>
                        <button onClick={() => setDeleteId(p._id)} style={{ padding: "6px 8px", background: "#fff0f0", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ADD / EDIT FORM */}
        <div style={{ background: "white", borderRadius: "12px", padding: isMobile ? "20px 16px" : "28px", border: "1px solid #ececec", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "14px", borderBottom: "2px solid #111" }}>
            <h3 style={{ fontWeight: "900", fontSize: "16px", color: "#111", margin: 0 }}>{editingId ? "✏️ Edit Product" : "➕ Add New Product"}</h3>
            {editingId && (
              <button onClick={resetForm} style={{ padding: "7px 14px", background: "transparent", border: "2px solid #eee", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer", color: "#666", fontFamily: "'DM Sans', sans-serif" }}>✕ Cancel</button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 220px", gap: "20px" }}>

            {/* FIELDS */}
            <div>
              {/* NAME + CATEGORY */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={lbl}>Product Name <Req /></label>
                  <input style={inp} placeholder="e.g. TP-Link Archer AX73" value={name} onChange={e => setName(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <label style={lbl}>Category <Req /></label>
                  <select style={inp} value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">Select category</option>
                    {cats.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* SELLING PRICE + ORIGINAL PRICE */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={lbl}>Selling Price (₹) <Req /></label>
                  <input style={inp} placeholder="e.g. 999" type="number" value={price} onChange={e => setPrice(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                  <p style={{ fontSize: "11px", color: "#aaa", margin: "4px 0 0" }}>This is the price customer pays</p>
                </div>
                <div>
                  <label style={lbl}>Original / MRP (₹) <span style={{ color: "#aaa", fontWeight: "500", textTransform: "none", letterSpacing: 0 }}>(for strikethrough)</span></label>
                  <input
                    style={{
                      ...inp,
                      borderColor: originalPrice && Number(originalPrice) <= Number(price) ? "#e53e3e" : "#e5e5e5"
                    }}
                    placeholder="e.g. 1499 (leave blank if no discount)"
                    type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)}
                    onFocus={e => e.target.style.borderColor = "#FEE12B"}
                    onBlur={e => e.target.style.borderColor = originalPrice && Number(originalPrice) <= Number(price) ? "#e53e3e" : "#e5e5e5"} />
                  {originalPrice && price && Number(originalPrice) > Number(price) && (
                    <p style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700", margin: "4px 0 0" }}>
                      ₹<s>{Number(originalPrice).toLocaleString()}</s> → ₹{Number(price).toLocaleString()} ({discountPct(Number(originalPrice), Number(price))}% OFF)
                    </p>
                  )}
                </div>
              </div>

              {/* STOCK + DELIVERY DAYS */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={lbl}>Stock (units) <Req /></label>
                  <input style={inp} placeholder="0" type="number" value={stock} onChange={e => setStock(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <label style={lbl}>Delivery Days <Req /></label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input style={{ ...inp, flex: 1 }} placeholder="5" type="number" min="1" max="30" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                    <span style={{ fontSize: "12px", color: "#888", fontWeight: "600", whiteSpace: "nowrap" }}>working days</span>
                  </div>
                  {deliveryDays && (
                    <p style={{ fontSize: "11px", color: "#2563eb", fontWeight: "600", margin: "4px 0 0" }}>
                      🚚 Delivers by {(() => {
                        const d = new Date(); d.setDate(d.getDate() + Number(deliveryDays));
                        return d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
                      })()}
                    </p>
                  )}
                </div>
              </div>

              {/* BRAND + SKU */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={lbl}>Brand</label>
                  <input style={inp} placeholder="e.g. TP-Link" value={brand} onChange={e => setBrand(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <label style={lbl}>SKU</label>
                  <input style={inp} placeholder="e.g. FKC-AC1200-IN" value={sku} onChange={e => setSku(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div style={{ marginBottom: "18px" }}>
                <label style={lbl}>Description</label>
                <textarea style={{ ...inp, height: "90px", resize: "vertical" }} placeholder="Product description..." value={description} onChange={e => setDescription(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            {/* IMAGE UPLOAD */}
            <div>
              <label style={lbl}>Product Image</label>
              <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #e5e5e5", borderRadius: "10px", minHeight: isMobile ? "120px" : "180px", cursor: "pointer", overflow: "hidden", background: "#fafaf8" }}>
                {preview ? (
                  <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ textAlign: "center", padding: "16px" }}>
                    <div style={{ fontSize: "28px", marginBottom: "6px" }}>📷</div>
                    <p style={{ fontSize: "12px", color: "#aaa", margin: 0, fontWeight: "600" }}>Click to upload</p>
                    <p style={{ fontSize: "10px", color: "#ccc", margin: "3px 0 0" }}>JPG, PNG up to 5MB</p>
                  </div>
                )}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; setImage(f); if (f) setPreview(URL.createObjectURL(f)); }} />
              </label>
              {preview && (
                <button onClick={() => { setPreview(null); setImage(null); }}
                  style={{ width: "100%", marginTop: "8px", padding: "6px", background: "transparent", border: "1px solid #eee", borderRadius: "6px", fontSize: "11px", color: "#999", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  × Remove image
                </button>
              )}
            </div>
          </div>

          {/* SUBMIT */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "4px" }}>
            <button
              onClick={() => editingId ? updateProduct(editingId) : addProduct()}
              disabled={formLoading}
              style={{ padding: "13px 28px", background: "#FEE12B", color: "#111", border: "none", borderRadius: "8px", fontWeight: "900", fontSize: "14px", cursor: formLoading ? "not-allowed" : "pointer", opacity: formLoading ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={e => { if (!formLoading) e.currentTarget.style.background = "#f5d400"; }}
              onMouseLeave={e => e.currentTarget.style.background = "#FEE12B"}>
              {formLoading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
            </button>
            {editingId && (
              <button onClick={resetForm} style={{ padding: "11px 20px", background: "transparent", border: "2px solid #eee", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", color: "#666", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
            )}
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "340px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "14px" }}>🗑️</div>
            <h3 style={{ fontWeight: "900", color: "#111", margin: "0 0 6px" }}>Delete Product?</h3>
            <p style={{ color: "#aaa", fontSize: "14px", margin: "0 0 22px" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: "12px", border: "2px solid #eee", background: "white", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              <button onClick={() => deleteProduct(deleteId)} style={{ flex: 1, padding: "12px", background: "#dc2626", color: "white", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl = { display: "block", fontSize: "11px", fontWeight: "800", color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "7px" };
const Req = () => <span style={{ color: "#e53e3e" }}>*</span>;

export default AdminDashboard;