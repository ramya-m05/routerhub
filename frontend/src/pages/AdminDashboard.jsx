import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { useIsMobile } from "../hooks/useIsMobile";

const DEFAULT_CATS = ["Router", "Fiber Cable", "Fiber Tools", "Security", "Streaming Device"];
const STORAGE_KEY  = "rk_categories";
const loadCats     = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_CATS; } catch { return DEFAULT_CATS; } };
const saveCats     = (arr) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
const CAT_COLORS   = ["#FEE12B", "#bfdbfe", "#bbf7d0", "#fde68a", "#e9d5ff", "#fed7aa", "#fecdd3", "#d1fae5"];

function AdminDashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  /* ── product fields ── */
  const [products,      setProducts]      = useState([]);
  const [name,          setName]          = useState("");
  const [description,   setDescription]   = useState("");
  const [price,         setPrice]         = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock,         setStock]         = useState("");
  const [category,      setCategory]      = useState("");
  const [brand,         setBrand]         = useState("");
  const [sku,           setSku]           = useState("");
  const [deliveryDays,  setDeliveryDays]  = useState("5");
  const [editingId,     setEditingId]     = useState(null);

  /* ── categories ── */
  const [categories,   setCategories]  = useState(loadCats);
  const [newCatName,   setNewCatName]  = useState("");
  const [showCatPanel, setShowCatPanel]= useState(false);
  const [editCatIdx,   setEditCatIdx]  = useState(null);
  const [editCatVal,   setEditCatVal]  = useState("");
  const [deleteCatIdx, setDeleteCatIdx]= useState(null);

  /* ── images: { file, preview, existing } ── */
  const [imageSlots, setImageSlots] = useState([]);
  const MAX_IMAGES   = 6;
  const fileInputRef = useRef(null);

  /* ── ui ── */
  const [loading,     setLoading]    = useState(true);
  const [formLoading, setFormLoading]= useState(false);
  const [deleteId,    setDeleteId]   = useState(null);
  const [searchProd,  setSearchProd] = useState("");
  const [stats, setStats] = useState({ totalProducts: 0, lowStock: 0 });
  const [sales, setSales] = useState({ revenue: 0, avgPrice: 0 });

  if (!localStorage.getItem("token")) { window.location.href = "/"; }

  useEffect(() => { saveCats(categories); }, [categories]);

  /* ── fetch products ── */
  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      const arr = Array.isArray(res.data) ? res.data : [];
      setProducts(arr);
      calcStats(arr);
      calcSales(arr);
      const dbCats = [...new Set(arr.map(p => p.category).filter(Boolean))];
      setCategories(prev => {
        const merged = [...new Set([...prev, ...dbCats])];
        saveCats(merged);
        return merged;
      });
    } catch { toast.error("Failed to fetch products"); }
    finally  { setLoading(false); }
  };
  useEffect(() => { fetchProducts(); }, []);

  const calcStats = (p) => {
    let lStock = 0;
    p.forEach(x => { if (x.stock <= 3) lStock++; });
    setStats({ totalProducts: p.length, lowStock: lStock });
  };
  const calcSales = (p) => {
    let rev = 0, tot = 0;
    p.forEach(x => { rev += Number(x.price) * Number(x.stock); tot += Number(x.price); });
    setSales({ revenue: rev, avgPrice: p.length ? (tot / p.length).toFixed(0) : 0 });
  };

  /* ── categories ── */
  const handleAddCat = () => {
    const val = newCatName.trim();
    if (!val) { toast.error("Enter a category name"); return; }
    if (categories.map(c => c.toLowerCase()).includes(val.toLowerCase())) { toast.error("Already exists"); return; }
    setCategories(prev => [...prev, val]);
    setNewCatName("");
    toast.success(`"${val}" added ✅`);
  };

  const handleSaveEditCat = () => {
    const val     = editCatVal.trim();
    const oldName = categories[editCatIdx];
    if (!val) { toast.error("Name cannot be empty"); return; }
    if (val.toLowerCase() !== oldName.toLowerCase() && categories.map(c => c.toLowerCase()).includes(val.toLowerCase())) {
      toast.error("That name already exists"); return;
    }
    setCategories(prev => prev.map((c, i) => i === editCatIdx ? val : c));
    if (category === oldName) setCategory(val);
    setEditCatIdx(null); setEditCatVal("");
    toast.success("Category renamed ✅");
  };

  const handleDeleteCat = (idx) => {
    if (products.some(p => p.category === categories[idx])) {
      toast.error(`"${categories[idx]}" is used by products — remove them first`);
      setDeleteCatIdx(null); return;
    }
    setCategories(prev => prev.filter((_, i) => i !== idx));
    setDeleteCatIdx(null);
    toast.success("Category deleted");
  };

  /* ── images ── */
  const handleAddImages = (files) => {
    const arr       = Array.from(files);
    const remaining = MAX_IMAGES - imageSlots.length;
    if (remaining <= 0) { toast.error(`Max ${MAX_IMAGES} images allowed`); return; }
    const toAdd = arr.slice(0, remaining);
    setImageSlots(prev => [
      ...prev,
      ...toAdd.map(file => ({ file, preview: URL.createObjectURL(file), existing: false }))
    ]);
    if (arr.length > remaining) toast(`Only first ${remaining} added — max ${MAX_IMAGES}`);
  };

  const removeImage = (idx) => {
    setImageSlots(prev => {
      const copy = [...prev];
      if (!copy[idx].existing) URL.revokeObjectURL(copy[idx].preview);
      copy.splice(idx, 1);
      return copy;
    });
  };

  const moveImage = (from, to) => {
    if (to < 0 || to >= imageSlots.length) return;
    setImageSlots(prev => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  /* ── validation ── */
  const validate = () => {
    if (!name.trim())                             { toast.error("Product name is required");          return false; }
    if (!category)                                { toast.error("Please select a category");          return false; }
    if (!price || isNaN(price) || +price <= 0)    { toast.error("Enter a valid selling price");       return false; }
    if (originalPrice && +originalPrice < +price) { toast.error("MRP must be ≥ selling price");       return false; }
    if (!stock || isNaN(stock) || +stock < 0)     { toast.error("Enter valid stock quantity");        return false; }
    if (!deliveryDays || +deliveryDays < 1)       { toast.error("Enter valid delivery days (min 1)"); return false; }
    return true;
  };

  /* ── FormData: new image files go to backend → Cloudinary; existing URLs are preserved ── */
  const buildForm = () => {
    const fd = new FormData();
    fd.append("name",         name);
    fd.append("category",     category);
    fd.append("description",  description);
    fd.append("price",        price);
    fd.append("stock",        stock);
    fd.append("deliveryDays", deliveryDays);
    if (originalPrice) fd.append("originalPrice", originalPrice);
    if (brand) fd.append("brand", brand);
    if (sku)   fd.append("sku",   sku);
    // New files — backend will upload these to Cloudinary
    imageSlots.filter(s => !s.existing && s.file).forEach(s => fd.append("images", s.file));
    // Existing Cloudinary URLs — backend will keep these
    fd.append("existingImages", JSON.stringify(
      imageSlots.filter(s => s.existing).map(s => s.preview)
    ));
    return fd;
  };

  const addProduct = async () => {
    if (!validate()) return;
    setFormLoading(true);
    try {
      await API.post("/products", buildForm());
      toast.success("Product added ✅");
      fetchProducts();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally { setFormLoading(false); }
  };

  const updateProduct = async (id) => {
    if (!validate()) return;
    setFormLoading(true);
    try {
      await API.put(`/products/${id}`, buildForm());
      toast.success("Product updated ✅");
      fetchProducts();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally { setFormLoading(false); }
  };

  const deleteProduct = async (id) => {
    try { await API.delete(`/products/${id}`); toast.success("Deleted"); setDeleteId(null); fetchProducts(); }
    catch { toast.error("Failed to delete"); }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setName(p.name || ""); setCategory(p.category || ""); setDescription(p.description || "");
    setPrice(p.price || ""); setStock(p.stock || ""); setOriginalPrice(p.originalPrice || "");
    setDeliveryDays(p.deliveryDays || "5"); setBrand(p.brand || ""); setSku(p.sku || "");
    const imgs = p.images?.length ? p.images : (p.image ? [p.image] : []);
    setImageSlots(imgs.filter(Boolean).map(url => ({ file: null, preview: url, existing: true })));
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const resetForm = () => {
    setName(""); setDescription(""); setPrice(""); setOriginalPrice("");
    setStock(""); setCategory(""); setDeliveryDays("5"); setBrand(""); setSku("");
    imageSlots.forEach(s => { if (!s.existing) URL.revokeObjectURL(s.preview); });
    setImageSlots([]); setEditingId(null);
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(searchProd.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchProd.toLowerCase())
  );

  const catColor = (cat) => CAT_COLORS[categories.indexOf(cat) % CAT_COLORS.length] || "#f0f0f0";
  const discP    = (orig, sell) => orig > sell ? Math.round(((orig - sell) / orig) * 100) : 0;

  const inp = { width: "100%", padding: "11px 14px", border: "2px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", color: "#111", background: "white", outline: "none", transition: "border-color 0.15s", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" };
  const lbl = { display: "block", fontSize: "11px", fontWeight: "800", color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "7px" };
  const fo  = e => (e.target.style.borderColor = "#FEE12B");
  const bl  = e => (e.target.style.borderColor = "#e5e5e5");
  const Req = () => <span style={{ color: "#e53e3e" }}>*</span>;

  return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

      {/* HEADER */}
      <div style={{ background: "#111", padding: isMobile ? "24px 16px 20px" : "40px 40px 28px", borderBottom: "4px solid #FEE12B" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-end", flexDirection: isMobile ? "column" : "row", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#FEE12B", marginBottom: "6px" }}>RouterKart · Admin</p>
            <h1 style={{ color: "white", fontSize: isMobile ? "26px" : "clamp(26px,4vw,44px)", fontWeight: "900", letterSpacing: "-1px", margin: 0 }}>Dashboard</h1>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button onClick={() => setShowCatPanel(v => !v)}
              style={{ padding: "10px 16px", background: showCatPanel ? "#FEE12B" : "rgba(255,255,255,0.08)", color: showCatPanel ? "#111" : "white", border: `1px solid ${showCatPanel ? "#FEE12B" : "rgba(255,255,255,0.15)"}`, borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif" }}>
              🗂️ Categories {showCatPanel ? "▲" : "▼"}
            </button>
            <button onClick={() => navigate("/admin/orders")}
              style={{ padding: "10px 16px", background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif" }}>
              📋 Orders
            </button>
            <button onClick={() => { localStorage.clear(); window.location.href = "/"; }}
              style={{ padding: "10px 16px", background: "#dc2626", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif" }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: isMobile ? "16px" : "28px 40px" }}>

        {/* CATEGORY PANEL */}
        {showCatPanel && (
          <div style={{ background: "white", borderRadius: "12px", padding: isMobile ? "18px 14px" : "24px", border: "2px solid #FEE12B", marginBottom: "20px", boxShadow: "0 4px 20px rgba(254,225,43,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontWeight: "900", fontSize: "16px", color: "#111", margin: 0 }}>🗂️ Manage Categories</h3>
              <span style={{ fontSize: "12px", color: "#aaa", fontWeight: "600" }}>{categories.length} categories</span>
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
              <input placeholder="New category name" value={newCatName} onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddCat()}
                style={{ ...inp, flex: 1, minWidth: "220px" }} onFocus={fo} onBlur={bl} />
              <button onClick={handleAddCat}
                style={{ padding: "11px 20px", background: "#FEE12B", color: "#111", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
                + Add
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
              {categories.map((cat, idx) => {
                const inUse = products.filter(p => p.category === cat).length;
                return (
                  <div key={idx} style={{ background: "#F7F7F5", borderRadius: "10px", padding: "12px 14px", border: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    {editCatIdx === idx ? (
                      <input value={editCatVal} onChange={e => setEditCatVal(e.target.value)} autoFocus
                        onKeyDown={e => { if (e.key === "Enter") handleSaveEditCat(); if (e.key === "Escape") { setEditCatIdx(null); setEditCatVal(""); } }}
                        style={{ ...inp, padding: "6px 10px", fontSize: "13px", flex: 1 }} onFocus={fo} onBlur={bl} />
                    ) : (
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: catColor(cat), flexShrink: 0 }} />
                          <span style={{ fontWeight: "700", fontSize: "13px", color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat}</span>
                        </div>
                        <span style={{ fontSize: "11px", color: "#aaa", marginLeft: "18px" }}>{inUse} product{inUse !== 1 ? "s" : ""}</span>
                      </div>
                    )}
                    {editCatIdx === idx ? (
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button onClick={handleSaveEditCat} style={{ padding: "4px 10px", background: "#FEE12B", border: "none", borderRadius: "5px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}>✓</button>
                        <button onClick={() => { setEditCatIdx(null); setEditCatVal(""); }} style={{ padding: "4px 8px", background: "#eee", border: "none", borderRadius: "5px", fontSize: "12px", cursor: "pointer" }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button onClick={() => { setEditCatIdx(idx); setEditCatVal(cat); }}
                          style={{ padding: "4px 8px", background: "#f0f0f0", border: "none", borderRadius: "5px", fontSize: "12px", cursor: "pointer" }}>✏️</button>
                        <button onClick={() => setDeleteCatIdx(idx)} disabled={inUse > 0}
                          style={{ padding: "4px 8px", background: inUse > 0 ? "#fafafa" : "#fff0f0", border: "none", borderRadius: "5px", fontSize: "12px", cursor: inUse > 0 ? "not-allowed" : "pointer", opacity: inUse > 0 ? 0.4 : 1 }}>🗑️</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STATS */}
        {stats.lowStock > 0 && (
          <div style={{ background: "#FFFCEB", border: "2px solid #FEE12B", borderRadius: "10px", padding: "12px 18px", marginBottom: "18px", fontSize: "14px", color: "#555", fontWeight: "600" }}>
            ⚠️ <strong>{stats.lowStock} product{stats.lowStock > 1 ? "s are" : " is"} running low on stock</strong>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)", gap: "12px", marginBottom: "20px" }}>
          {[
            { label: "Products",   value: stats.totalProducts,                   icon: "📦" },
            { label: "Low Stock",  value: stats.lowStock,                        icon: "⚠️", danger: true },
            { label: "Categories", value: categories.length,                     icon: "🗂️" },
            { label: "Revenue",    value: `₹${sales.revenue?.toLocaleString()}`, icon: "💰" },
            { label: "Avg. Price", value: `₹${sales.avgPrice}`,                 icon: "📊" },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", borderRadius: "10px", padding: "14px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid #ececec", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize: "20px" }}>{s.icon}</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: "900", fontSize: "17px", margin: "0 0 1px", color: s.danger && s.value > 0 ? "#dc2626" : "#111" }}>{s.value}</p>
                <p style={{ fontSize: "10px", color: "#aaa", margin: 0, fontWeight: "600" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* PRODUCT TABLE */}
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #ececec", overflow: "hidden", marginBottom: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f0f0f0", flexWrap: "wrap", gap: "10px" }}>
            <h3 style={{ fontWeight: "900", fontSize: "15px", color: "#111", margin: 0 }}>All Products</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #eee", borderRadius: "6px", padding: "0 12px", background: "#f9f9f9" }}>
              <span>🔍</span>
              <input placeholder="Search..." value={searchProd} onChange={e => setSearchProd(e.target.value)}
                style={{ border: "none", outline: "none", padding: "8px 0", fontSize: "13px", background: "transparent", fontFamily: "'DM Sans', sans-serif", width: isMobile ? "100px" : "160px" }} />
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "680px" }}>
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
                    <div style={{ width: "28px", height: "28px", border: "3px solid #eee", borderTop: "3px solid #FEE12B", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#aaa", fontSize: "14px" }}>No products found</td></tr>
                ) : filtered.map(p => {
                  const thumb    = p.images?.[0] || p.image || undefined;
                  const imgCount = p.images?.length || (p.image ? 1 : 0);
                  return (
                    <tr key={p._id} style={{ borderBottom: "1px solid #f5f5f5" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#FAFAF8"}
                      onMouseLeave={e => e.currentTarget.style.background = "white"}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            {thumb
                              ? <img src={thumb} alt={p.name} style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "8px", border: "1px solid #f0f0f0" }} />
                              : <div style={{ width: "42px", height: "42px", background: "#f5f5f0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📦</div>
                            }
                            {imgCount > 1 && (
                              <span style={{ position: "absolute", bottom: "-4px", right: "-4px", background: "#FEE12B", color: "#111", fontSize: "9px", fontWeight: "900", padding: "1px 5px", borderRadius: "8px", border: "1px solid white" }}>+{imgCount - 1}</span>
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: "700", fontSize: "13px", color: "#111", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "150px" }}>{p.name}</p>
                            {p.brand && <p style={{ fontSize: "11px", color: "#aaa", margin: 0 }}>{p.brand}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "800", color: "#111", background: catColor(p.category) }}>{p.category}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontWeight: "900", fontSize: "14px" }}>₹{p.price?.toLocaleString()}</span>
                        {p.originalPrice && +p.originalPrice > +p.price && (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                            <span style={{ fontSize: "11px", color: "#bbb", textDecoration: "line-through" }}>₹{p.originalPrice?.toLocaleString()}</span>
                            <span style={{ fontSize: "10px", fontWeight: "800", color: "#fff", background: "#e53e3e", padding: "1px 5px", borderRadius: "3px" }}>{discP(+p.originalPrice, +p.price)}%</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontWeight: "800", fontSize: "14px", color: +p.stock === 0 ? "#dc2626" : +p.stock <= 3 ? "#cc8800" : "#16a34a" }}>{p.stock}</span>
                        {+p.stock > 0 && +p.stock <= 3 && <span style={{ display: "block", fontSize: "9px", color: "#cc8800", fontWeight: "700" }}>LOW</span>}
                        {+p.stock === 0 && <span style={{ display: "block", fontSize: "9px", color: "#dc2626", fontWeight: "700" }}>OUT</span>}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#2563eb" }}>🚚 {p.deliveryDays || 5}d</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => startEdit(p)} style={{ padding: "6px 10px", background: "#f7f7f5", border: "1px solid #eee", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif" }}>✏️ Edit</button>
                          <button onClick={() => setDeleteId(p._id)} style={{ padding: "6px 8px", background: "#fff0f0", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ADD / EDIT FORM */}
        <div style={{ background: "white", borderRadius: "12px", padding: isMobile ? "18px 14px" : "28px", border: "1px solid #ececec", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "14px", borderBottom: "2px solid #111" }}>
            <h3 style={{ fontWeight: "900", fontSize: "16px", color: "#111", margin: 0 }}>
              {editingId ? "✏️ Edit Product" : "➕ Add New Product"}
            </h3>
            {editingId && (
              <button onClick={resetForm} style={{ padding: "7px 14px", background: "transparent", border: "2px solid #eee", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer", color: "#666", fontFamily: "'DM Sans', sans-serif" }}>✕ Cancel</button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "24px" }}>

            {/* TEXT FIELDS */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={lbl}>Product Name <Req /></label>
                  <input style={inp} placeholder="e.g. TP-Link Archer AX73" value={name} onChange={e => setName(e.target.value)} onFocus={fo} onBlur={bl} />
                </div>
                <div>
                  <label style={lbl}>Category <Req /></label>
                  <select style={inp} value={category} onChange={e => {
                    if (e.target.value === "__new__") {
                      const n = window.prompt("Enter new category name:");
                      if (n?.trim()) {
                        const val = n.trim();
                        if (!categories.map(c => c.toLowerCase()).includes(val.toLowerCase())) {
                          setCategories(prev => { const u = [...prev, val]; saveCats(u); return u; });
                          toast.success(`"${val}" added`);
                        }
                        setCategory(val);
                      }
                    } else { setCategory(e.target.value); }
                  }}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="__new__">➕ Add new category…</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={lbl}>Selling Price (₹) <Req /></label>
                  <input style={inp} placeholder="e.g. 999" type="number" value={price} onChange={e => setPrice(e.target.value)} onFocus={fo} onBlur={bl} />
                  <p style={{ fontSize: "11px", color: "#aaa", margin: "4px 0 0" }}>Price customer pays</p>
                </div>
                <div>
                  <label style={lbl}>Original / MRP (₹)</label>
                  <input
                    style={{ ...inp, borderColor: originalPrice && +originalPrice < +price ? "#e53e3e" : "#e5e5e5" }}
                    placeholder="Leave blank if no discount" type="number" value={originalPrice}
                    onChange={e => setOriginalPrice(e.target.value)}
                    onFocus={e => e.target.style.borderColor = "#FEE12B"}
                    onBlur={e => e.target.style.borderColor = originalPrice && +originalPrice < +price ? "#e53e3e" : "#e5e5e5"}
                  />
                  {originalPrice && price && +originalPrice > +price && (
                    <p style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700", margin: "4px 0 0" }}>
                      ₹<s>{(+originalPrice).toLocaleString()}</s> → ₹{(+price).toLocaleString()} ({discP(+originalPrice, +price)}% OFF)
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={lbl}>Stock <Req /></label>
                  <input style={inp} placeholder="0" type="number" value={stock} onChange={e => setStock(e.target.value)} onFocus={fo} onBlur={bl} />
                </div>
                <div>
                  <label style={lbl}>Delivery Days <Req /></label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input style={{ ...inp, flex: 1 }} placeholder="5" type="number" min="1" max="30" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} onFocus={fo} onBlur={bl} />
                    <span style={{ fontSize: "12px", color: "#888", fontWeight: "600", whiteSpace: "nowrap" }}>days</span>
                  </div>
                  {deliveryDays && (
                    <p style={{ fontSize: "11px", color: "#2563eb", fontWeight: "600", margin: "4px 0 0" }}>
                      🚚 Delivers by {(() => { const d = new Date(); d.setDate(d.getDate() + +deliveryDays); return d.toLocaleDateString("en-IN", { day: "numeric", month: "long" }); })()}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={lbl}>Brand</label>
                  <input style={inp} placeholder="e.g. TP-Link" value={brand} onChange={e => setBrand(e.target.value)} onFocus={fo} onBlur={bl} />
                </div>
                <div>
                  <label style={lbl}>SKU</label>
                  <input style={inp} placeholder="e.g. FKC-AC1200-IN" value={sku} onChange={e => setSku(e.target.value)} onFocus={fo} onBlur={bl} />
                </div>
              </div>

              <div>
                <label style={lbl}>Description</label>
                <textarea style={{ ...inp, height: "90px", resize: "vertical" }} placeholder="Product description..." value={description} onChange={e => setDescription(e.target.value)} onFocus={fo} onBlur={bl} />
              </div>
            </div>

            {/* IMAGE UPLOAD — files sent to backend → uploaded to Cloudinary */}
            <div style={{ width: isMobile ? "100%" : "280px", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                <label style={lbl}>Product Photos</label>
                <span style={{ fontSize: "11px", color: imageSlots.length >= MAX_IMAGES ? "#e53e3e" : "#aaa", fontWeight: "600" }}>
                  {imageSlots.length}/{MAX_IMAGES}
                </span>
              </div>

              <div style={{ background: "#F0FDF4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "8px 12px", marginBottom: "10px", fontSize: "11px", color: "#16a34a", fontWeight: "600" }}>
                ☁️ Images upload to Cloudinary automatically
              </div>

              {imageSlots.length < MAX_IMAGES && (
                <label
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #FEE12B", borderRadius: "10px", padding: "18px 12px", cursor: "pointer", background: "#FFFDF0", marginBottom: "12px", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#FFF8D0"}
                  onMouseLeave={e => e.currentTarget.style.background = "#FFFDF0"}
                >
                  <span style={{ fontSize: "28px", marginBottom: "6px" }}>📸</span>
                  <p style={{ fontSize: "12px", fontWeight: "700", color: "#888", margin: 0 }}>Click to add photos</p>
                  <p style={{ fontSize: "10px", color: "#ccc", margin: "4px 0 0" }}>Up to {MAX_IMAGES - imageSlots.length} more · JPG, PNG, WEBP</p>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }}
                    onChange={e => { handleAddImages(e.target.files); e.target.value = ""; }} />
                </label>
              )}

              {imageSlots.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {imageSlots.map((slot, idx) => (
                    <div key={idx} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", border: idx === 0 ? "3px solid #FEE12B" : "2px solid #eee", aspectRatio: "1", background: "#f5f5f0" }}>
                      <img src={slot.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      {idx === 0 && (
                        <div style={{ position: "absolute", top: "5px", left: "5px", background: "#FEE12B", color: "#111", fontSize: "9px", fontWeight: "900", padding: "2px 6px", borderRadius: "4px" }}>COVER</div>
                      )}
                      {slot.existing && (
                        <div style={{ position: "absolute", top: "5px", right: "5px", background: "#22c55e", color: "white", fontSize: "8px", fontWeight: "900", padding: "2px 5px", borderRadius: "4px" }}>☁️</div>
                      )}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px" }}>
                        <div style={{ display: "flex", gap: "2px" }}>
                          <button onClick={() => moveImage(idx, idx - 1)} disabled={idx === 0}
                            style={{ background: "none", border: "none", color: idx === 0 ? "#666" : "white", fontSize: "14px", cursor: idx === 0 ? "default" : "pointer", padding: "2px 4px" }}>←</button>
                          <button onClick={() => moveImage(idx, idx + 1)} disabled={idx === imageSlots.length - 1}
                            style={{ background: "none", border: "none", color: idx === imageSlots.length - 1 ? "#666" : "white", fontSize: "14px", cursor: idx === imageSlots.length - 1 ? "default" : "pointer", padding: "2px 4px" }}>→</button>
                        </div>
                        <button onClick={() => removeImage(idx)}
                          style={{ background: "#e53e3e", border: "none", color: "white", fontSize: "11px", fontWeight: "900", padding: "2px 7px", borderRadius: "4px", cursor: "pointer" }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {imageSlots.length > 0 && (
                <p style={{ fontSize: "11px", color: "#aaa", margin: "10px 0 0", lineHeight: 1.5 }}>
                  First photo is the cover. ☁️ = already on Cloudinary. Use ← → to reorder.
                </p>
              )}
            </div>
          </div>

          {/* SUBMIT */}
          <div style={{ display: "flex", gap: "12px", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" }}>
            <button
              onClick={() => editingId ? updateProduct(editingId) : addProduct()}
              disabled={formLoading}
              style={{ padding: "13px 28px", background: "#FEE12B", color: "#111", border: "none", borderRadius: "8px", fontWeight: "900", fontSize: "14px", cursor: formLoading ? "not-allowed" : "pointer", opacity: formLoading ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={e => { if (!formLoading) e.currentTarget.style.background = "#f5d400"; }}
              onMouseLeave={e => e.currentTarget.style.background = "#FEE12B"}
            >
              {formLoading ? "Uploading & Saving..." : editingId ? "Update Product" : "Add Product"}
            </button>
            {editingId && (
              <button onClick={resetForm} style={{ padding: "11px 20px", background: "transparent", border: "2px solid #eee", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", color: "#666", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
            )}
          </div>
        </div>
      </div>

      {/* DELETE PRODUCT MODAL */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "340px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "14px" }}>🗑️</div>
            <h3 style={{ fontWeight: "900", color: "#111", margin: "0 0 6px" }}>Delete Product?</h3>
            <p style={{ color: "#aaa", fontSize: "14px", margin: "0 0 22px" }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: "12px", border: "2px solid #eee", background: "white", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              <button onClick={() => deleteProduct(deleteId)} style={{ flex: 1, padding: "12px", background: "#dc2626", color: "white", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CATEGORY MODAL */}
      {deleteCatIdx !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "340px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🗂️</div>
            <h3 style={{ fontWeight: "900", color: "#111", margin: "0 0 6px" }}>Delete Category?</h3>
            <p style={{ color: "#555", fontSize: "14px", margin: "0 0 6px" }}>"<strong>{categories[deleteCatIdx]}</strong>"</p>
            <p style={{ color: "#aaa", fontSize: "13px", margin: "0 0 22px" }}>Existing products are unaffected.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeleteCatIdx(null)} style={{ flex: 1, padding: "11px", border: "2px solid #eee", background: "white", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              <button onClick={() => handleDeleteCat(deleteCatIdx)} style={{ flex: 1, padding: "11px", background: "#dc2626", color: "white", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default AdminDashboard;