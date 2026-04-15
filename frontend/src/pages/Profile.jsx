import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useIsMobile } from "../hooks/useIsMobile";

const OTP_STEP = { IDLE: "idle", SENDING: "sending", VERIFY: "verify", VERIFYING: "verifying" };
const ADDR_LABELS = ["Home", "Work", "Other"];


/* ─── Address Form Modal ─────────────────────────── */
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

function AddressModal({ existing, onSave, onClose }) {
  const [form, setForm] = useState(existing || {
    label:     "Home",
    doorNo:    "",
    houseName: "",
    cross:     "",
    landmark:  "",
    city:      "",
    district:  "",
    state:     "Karnataka",
    pincode:   "",
    phone:     "",
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.doorNo?.trim()) {
      toast.error("Door No. is required"); return;
    }
    if (!form.city?.trim()) {
      toast.error("City is required"); return;
    }
    if (!form.district?.trim()) {
      toast.error("District is required"); return;
    }
    if (!form.state?.trim()) {
      toast.error("State is required"); return;
    }
    if (!form.pincode?.trim() || form.pincode.length !== 6) {
      toast.error("Enter a valid 6-digit pincode"); return;
    }
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  const inp = {
    width: "100%", padding: "11px 14px", border: "2px solid #e5e5e5",
    borderRadius: "8px", fontSize: "14px", color: "#111", background: "white",
    outline: "none", transition: "border-color 0.15s",
    boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif",
  };
  const fo = e => (e.target.style.borderColor = "#FEE12B");
  const bl = e => (e.target.style.borderColor = "#e5e5e5");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px", overflowY: "auto" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "520px", boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontWeight: "900", fontSize: "18px", color: "#111", margin: 0 }}>
            {existing ? "✏️ Edit Address" : "➕ Add New Address"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#aaa", lineHeight: 1 }}>×</button>
        </div>

        {/* LABEL */}
        <div style={{ marginBottom: "16px" }}>
          <label style={lbl}>Label</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {ADDR_LABELS.map(l => (
              <button key={l} onClick={() => set("label", l)}
                style={{ flex: 1, padding: "9px", border: `2px solid ${form.label === l ? "#FEE12B" : "#e5e5e5"}`, background: form.label === l ? "#FFFDF0" : "white", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", color: "#111", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}>
                {l === "Home" ? "🏠" : l === "Work" ? "🏢" : "📍"} {l}
              </button>
            ))}
          </div>
        </div>

        {/* ROW 1 — Door No + House Name */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div>
            <label style={lbl}>Door No. <span style={{ color: "#e53e3e" }}>*</span></label>
            <input placeholder="e.g. 12B, Flat 4A" value={form.doorNo || ""} onChange={e => set("doorNo", e.target.value)} style={inp} onFocus={fo} onBlur={bl} />
          </div>
          <div>
            <label style={lbl}>House / Building Name</label>
            <input placeholder="e.g. Green Apartments" value={form.houseName || ""} onChange={e => set("houseName", e.target.value)} style={inp} onFocus={fo} onBlur={bl} />
          </div>
        </div>

        {/* ROW 2 — Cross + Landmark */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div>
            <label style={lbl}>Cross / Street</label>
            <input placeholder="e.g. 5th Cross, MG Road" value={form.cross || ""} onChange={e => set("cross", e.target.value)} style={inp} onFocus={fo} onBlur={bl} />
          </div>
          <div>
            <label style={lbl}>Landmark <span style={{ color: "#aaa", fontWeight: "500", textTransform: "none", letterSpacing: 0 }}>(Optional)</span></label>
            <input placeholder="e.g. Near Bus Stand" value={form.landmark || ""} onChange={e => set("landmark", e.target.value)} style={inp} onFocus={fo} onBlur={bl} />
          </div>
        </div>

        {/* ROW 3 — City + District */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div>
            <label style={lbl}>City <span style={{ color: "#e53e3e" }}>*</span></label>
            <input placeholder="e.g. Bangalore" value={form.city || ""} onChange={e => set("city", e.target.value)} style={inp} onFocus={fo} onBlur={bl} />
          </div>
          <div>
            <label style={lbl}>District <span style={{ color: "#e53e3e" }}>*</span></label>
            <input placeholder="e.g. Bangalore Urban" value={form.district || ""} onChange={e => set("district", e.target.value)} style={inp} onFocus={fo} onBlur={bl} />
          </div>
        </div>

        {/* ROW 4 — State (full width) */}
        <div style={{ marginBottom: "12px" }}>
          <label style={lbl}>State <span style={{ color: "#e53e3e" }}>*</span></label>
          <select
            value={form.state || "Karnataka"}
            onChange={e => set("state", e.target.value)}
            style={inp}
            onFocus={fo}
            onBlur={bl}
          >
            {INDIAN_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* ROW 5 — Pincode + Phone */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div>
            <label style={lbl}>Pincode <span style={{ color: "#e53e3e" }}>*</span></label>
            <input
              placeholder="6-digit pincode"
              value={form.pincode || ""}
              maxLength={6}
              onChange={e => set("pincode", e.target.value.replace(/\D/g, ""))}
              style={{
                ...inp,
                borderColor: form.pincode?.length > 0 && form.pincode?.length !== 6 ? "#e53e3e" : "#e5e5e5",
              }}
              onFocus={fo}
              onBlur={e => { e.target.style.borderColor = form.pincode?.length > 0 && form.pincode?.length !== 6 ? "#e53e3e" : "#e5e5e5"; }}
            />
            {form.pincode?.length > 0 && form.pincode?.length !== 6 && (
              <p style={{ fontSize: "11px", color: "#e53e3e", margin: "4px 0 0", fontWeight: "600" }}>Enter 6-digit pincode</p>
            )}
          </div>
          <div>
            <label style={lbl}>Phone</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", fontWeight: "700", color: "#555", pointerEvents: "none" }}>+91</span>
              <input
                type="tel"
                placeholder="98xxxxxxxx"
                value={form.phone || ""}
                maxLength={10}
                onChange={e => set("phone", e.target.value.replace(/\D/g, ""))}
                style={{ ...inp, paddingLeft: "48px" }}
                onFocus={fo} onBlur={bl}
              />
            </div>
          </div>
        </div>

        {/* DEFAULT CHECKBOX */}
        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "20px" }}>
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={e => set("isDefault", e.target.checked)}
            style={{ accentColor: "#FEE12B", width: "16px", height: "16px", flexShrink: 0 }}
          />
          <span style={{ fontSize: "13px", color: "#555", fontWeight: "600" }}>Set as default address</span>
        </label>

        {/* BUTTONS */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "12px", border: "2px solid #eee", background: "white", borderRadius: "8px", fontWeight: "700", cursor: "pointer", color: "#666", fontFamily: "'DM Sans', sans-serif" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 1, padding: "12px", background: "#FEE12B", color: "#111", border: "none", borderRadius: "8px", fontWeight: "800", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif" }}>
            {saving ? "Saving..." : "Save Address"}
          </button>
        </div>

      </div>
    </div>
  );
}

/* ─── Main Profile ───────────────────────────────── */
function Profile() {
  const navigate  = useNavigate();
  const isMobile  = useIsMobile();

  const [user, setUser]         = useState(null);
  // At top of Profile component
const localuser = JSON.parse(localStorage.getItem("user")) || {};
const isAdmin = localuser?.role === "admin" || localuser?.isAdmin === true;
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving]     = useState(false);

  const [addresses, setAddresses]           = useState([]);
  const [showAddrModal, setShowAddrModal]   = useState(false);
  const [editingAddr, setEditingAddr]       = useState(null);

  const [emailModal, setEmailModal]   = useState(false);
  const [newEmail, setNewEmail]       = useState("");
  const [otpStep, setOtpStep]         = useState(OTP_STEP.IDLE);
  const [otp, setOtp]                 = useState("");
  const [otpTimer, setOtpTimer]       = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    fetchAll();
  }, []);

  useEffect(() => {
    if (otpTimer <= 0) return;
    const t = setInterval(() => setOtpTimer(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [otpTimer]);

  const fetchAll = async () => {
    try {
      const [uRes, aRes] = await Promise.all([API.get("/users/profile"), API.get("/users/addresses")]);
      setUser(uRes.data);
      setEditName(uRes.data.name || "");
      setEditPhone(uRes.data.phone || "");
      setAddresses(Array.isArray(aRes.data) ? aRes.data : []);
    } catch (err) {
      if (err.response?.status === 401) { toast.error("Session expired"); handleLogout(); }
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!editName.trim()) { toast.error("Name cannot be empty"); return; }
    setSaving(true);
    try {
      const res = await API.put("/users/profile", { name: editName.trim(), phone: editPhone.trim() });
      setUser(res.data); localStorage.setItem("userName", res.data.name); setEditing(false);
      toast.success("Profile updated ✅");
    } catch (err) { toast.error(err.response?.data?.message || "Failed to update profile"); }
    finally { setSaving(false); }
  };

  /* ── Email OTP ── */
  const handleSendEmailOtp = async () => {
    if (!newEmail.trim() || !/\S+@\S+\.\S+/.test(newEmail)) { toast.error("Enter a valid email"); return; }
    setOtpStep(OTP_STEP.SENDING);
    try {
      await API.post("/users/email-otp/send", { newEmail: newEmail.trim() });
      setOtpStep(OTP_STEP.VERIFY); setOtpTimer(60);
      toast.success(`OTP sent to ${newEmail} 📧`);
    } catch (err) { toast.error(err.response?.data?.message || "Failed to send OTP"); setOtpStep(OTP_STEP.IDLE); }
  };
  const handleVerifyEmailOtp = async () => {
    if (otp.length !== 6) { toast.error("Enter 6-digit OTP"); return; }
    setOtpStep(OTP_STEP.VERIFYING);
    try {
      const res = await API.post("/users/email-otp/verify", { newEmail: newEmail.trim(), otp });
      setUser(res.data); setEmailModal(false); setNewEmail(""); setOtp(""); setOtpStep(OTP_STEP.IDLE);
      toast.success("Email updated ✅");
    } catch (err) { toast.error(err.response?.data?.message || "Invalid OTP"); setOtpStep(OTP_STEP.VERIFY); }
  };

  /* ── Addresses ── */
  const handleAddAddress = async (form) => {
    const res = await API.post("/users/addresses", form);
    setAddresses(res.data); setShowAddrModal(false); toast.success("Address added ✅");
    console.log("FORM DATA:", form);
  };
  const handleUpdateAddress = async (form) => {
    const res = await API.put(`/users/addresses/${editingAddr._id}`, form);
    setAddresses(res.data); setEditingAddr(null); toast.success("Address updated ✅");
  };
  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    const res = await API.delete(`/users/addresses/${id}`);
    setAddresses(res.data); toast.success("Address deleted");
  };
  const handleSetDefault = async (id) => {
    const res = await API.patch(`/users/addresses/${id}/default`);
    setAddresses(res.data);
  };

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const initials = (name) => name?.trim().split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const memberSince = (d) => d ? new Date(d).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "N/A";

  const inp = { width: "100%", padding: "11px 14px", border: "2px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", color: "#111", background: "white", outline: "none", transition: "border-color 0.15s", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif", fontWeight: "600" };

  if (loading) return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh" }}>
      <Navbar setSearch={() => {}} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid #eee", borderTop: "3px solid #FEE12B", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#999", fontSize: "14px" }}>Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar setSearch={() => {}} />

      {/* HEADER */}
      <div style={{ background: "#111", padding: isMobile ? "28px 20px 22px" : "44px 40px 32px", borderBottom: "4px solid #FEE12B" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p style={{ fontSize: "12px", marginBottom: "8px" }}>
            <Link to="/store" style={{ color: "#FEE12B", textDecoration: "none", fontWeight: "700" }}>Store</Link>
            <span style={{ margin: "0 8px", color: "#555" }}>/</span>
            <span style={{ color: "#999" }}>My Account</span>
          </p>
          <h1 style={{ color: "white", fontSize: isMobile ? "32px" : "clamp(32px,5vw,52px)", fontWeight: "900", letterSpacing: "-1.5px", margin: 0 }}>My Account</h1>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "20px 16px" : "40px", display: "flex", flexDirection: isMobile ? "column" : "row", gap: "20px", alignItems: "flex-start" }}>

        {/* SIDEBAR */}
        <div style={{ width: isMobile ? "100%" : "240px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "22px 18px", textAlign: "center", border: "1px solid #ececec" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#FEE12B", color: "#111", fontSize: "22px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 4px 16px rgba(254,225,43,0.4)" }}>
              {initials(user?.name)}
            </div>
            <h3 style={{ fontWeight: "900", fontSize: "15px", color: "#111", margin: "0 0 3px" }}>{user?.name}</h3>
            <p style={{ color: "#aaa", fontSize: "12px", margin: "0 0 12px" }}>{user?.email}</p>
            {user?.role === "admin" && <span style={{ background: "#111", color: "#FEE12B", padding: "3px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "800" }}>⚡ Admin</span>}
            <div style={{ marginTop: "12px", padding: "10px", background: "#F7F7F5", borderRadius: "8px" }}>
              <p style={{ fontSize: "10px", fontWeight: "800", color: "#aaa", margin: "0 0 2px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Member Since</p>
              <p style={{ fontSize: "13px", color: "#666", fontWeight: "700", margin: 0 }}>{memberSince(user?.createdAt)}</p>
            </div>
          </div>
          

          
<div style={{ background: "white", borderRadius: "12px", overflow: "hidden", border: "1px solid #ececec" }}>

  {isAdmin && (
    <div onClick={() => navigate("/admin")}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderBottom: "1px solid #f5f5f5", cursor: "pointer", background: "#FFFDF0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span>⚙️</span>
        <span style={{ flex: 1, fontSize: "14px", fontWeight: "700", color: "#111" }}>Admin Dashboard</span>
      </div>
      <span style={{ color: "#FEE12B" }}>→</span>
    </div>
  )}

  {[
    { icon: "📦", label: "My Orders",  path: "/orders"   },
    { icon: "❤️", label: "Wishlist",   path: "/wishlist" },
    { icon: "🛒", label: "Cart",       path: "/cart"     },
  ].map(item => (
    <Link key={item.path} to={item.path}
      style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", textDecoration: "none", color: "#333", fontSize: "14px", fontWeight: "600", borderBottom: "1px solid #f5f5f5" }}>
      <span>{item.icon}</span>
      <span style={{ flex: 1 }}>{item.label}</span>
      <span style={{ color: "#ccc" }}>→</span>
    </Link>
  ))}

  <button onClick={handleLogout}
    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", background: "none", border: "none", color: "#cc4444", fontSize: "14px", fontWeight: "700", cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "'DM Sans', sans-serif" }}>
    <span>🚪</span>Logout
  </button>
</div>

        </div>
        {/* MAIN */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* ── PERSONAL INFO ── */}
          <div style={{ background: "white", borderRadius: "12px", padding: isMobile ? "18px 16px" : "26px", border: "1px solid #ececec" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", paddingBottom: "14px", borderBottom: "2px solid #111" }}>
              <h3 style={{ fontWeight: "900", fontSize: "16px", color: "#111", margin: 0 }}>Personal Information</h3>
              {!editing
                ? <button onClick={() => setEditing(true)} style={{ padding: "7px 14px", background: "#FEE12B", color: "#111", border: "none", borderRadius: "6px", fontWeight: "800", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>✏️ Edit</button>
                : <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => { setEditing(false); setEditName(user?.name || ""); setEditPhone(user?.phone || ""); }} style={{ padding: "7px 12px", border: "2px solid #eee", background: "white", borderRadius: "6px", fontWeight: "700", fontSize: "12px", cursor: "pointer", color: "#999", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving} style={{ padding: "7px 14px", background: "#111", color: "white", border: "none", borderRadius: "6px", fontWeight: "800", fontSize: "12px", cursor: "pointer", opacity: saving ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif" }}>{saving ? "Saving..." : "Save"}</button>
                  </div>
              }
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "18px" }}>
              <div>
                <p style={fLabel}>Full Name</p>
                {editing ? <input value={editName} onChange={e => setEditName(e.target.value)} style={inp} onFocus={e => e.target.style.borderColor = "#FEE12B"} onBlur={e => e.target.style.borderColor = "#e5e5e5"} /> : <p style={fVal}>{user?.name || "—"}</p>}
              </div>
              <div>
                <p style={fLabel}>Phone</p>
                {editing
                  ? <div style={{ position: "relative" }}><span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", fontWeight: "700", color: "#555" }}>+91</span><input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="98xxxxxxxx" maxLength={10} style={{ ...inp, paddingLeft: "48px" }} onFocus={e => e.target.style.borderColor = "#FEE12B"} onBlur={e => e.target.style.borderColor = "#e5e5e5"} /></div>
                  : <p style={fVal}>{user?.phone ? `+91 ${user.phone}` : "—"}</p>}
              </div>
              <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                <p style={fLabel}>Email Address</p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, padding: "11px 14px", background: "#f9f9f9", border: "2px solid #eee", borderRadius: "8px", fontSize: "14px", color: "#444", fontWeight: "600" }}>{user?.email}</div>
                  <button onClick={() => { setEmailModal(true); setNewEmail(""); setOtp(""); setOtpStep(OTP_STEP.IDLE); }}
                    style={{ padding: "10px 14px", border: "2px solid #111", background: "white", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
                    ✉️ Change
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── SAVED ADDRESSES ── */}
          <div style={{ background: "white", borderRadius: "12px", padding: isMobile ? "18px 16px" : "26px", border: "1px solid #ececec" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", paddingBottom: "14px", borderBottom: "2px solid #111" }}>
              <h3 style={{ fontWeight: "900", fontSize: "16px", color: "#111", margin: 0 }}>📍 Saved Addresses</h3>
              <button onClick={() => { setEditingAddr(null); setShowAddrModal(true); }}
                style={{ padding: "7px 14px", background: "#FEE12B", color: "#111", border: "none", borderRadius: "6px", fontWeight: "800", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                + Add New
              </button>
            </div>

            {addresses.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 20px" }}>
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>📭</div>
                <p style={{ fontWeight: "700", color: "#111", margin: "0 0 4px" }}>No saved addresses</p>
                <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>Add an address to speed up checkout</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {addresses.map(addr => (
                  <div key={addr._id} style={{ padding: "16px", background: addr.isDefault ? "#FFFDF0" : "#F7F7F5", borderRadius: "10px", border: `2px solid ${addr.isDefault ? "#FEE12B" : "#eee"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <span style={{ fontSize: "13px" }}>{addr.label === "Home" ? "🏠" : addr.label === "Work" ? "🏢" : "📍"}</span>
                          <span style={{ fontWeight: "800", fontSize: "14px", color: "#111" }}>{addr.label}</span>
                          {addr.isDefault && <span style={{ background: "#FEE12B", color: "#111", fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "10px" }}>DEFAULT</span>}
                        </div>
                        <p style={{ fontSize: "13px", color: "#555", margin: "0 0 4px", lineHeight: 1.5 }}>
                          {[addr.doorNo, addr.houseName, addr.cross, addr.landmark && `Near ${addr.landmark}`, addr.city, addr.district, addr.pincode].filter(Boolean).join(", ")}
                        </p>
                        {addr.phone && <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>📞 +91 {addr.phone}</p>}
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                        {!addr.isDefault && (
                          <button onClick={() => handleSetDefault(addr._id)} style={{ padding: "5px 10px", background: "transparent", border: "1px solid #ddd", borderRadius: "6px", fontSize: "11px", fontWeight: "700", cursor: "pointer", color: "#666", fontFamily: "'DM Sans', sans-serif" }}>Set Default</button>
                        )}
                        <button onClick={() => { setEditingAddr(addr); setShowAddrModal(true); }} style={{ padding: "5px 10px", background: "#f7f7f5", border: "1px solid #eee", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>✏️</button>
                        <button onClick={() => handleDeleteAddress(addr._id)} style={{ padding: "5px 8px", background: "#fff0f0", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── SIGN OUT ── */}
          <div style={{ background: "white", borderRadius: "12px", padding: isMobile ? "16px" : "20px 26px", border: "1px solid #fee2e2" }}>
            <h4 style={{ fontWeight: "800", color: "#cc0000", fontSize: "13px", margin: "0 0 4px" }}>Sign Out</h4>
            <p style={{ color: "#999", fontSize: "13px", margin: "0 0 12px" }}>You'll need to sign in again to access your account.</p>
            <button onClick={handleLogout} style={{ padding: "9px 18px", background: "#fff0f0", color: "#cc0000", border: "2px solid #fecaca", borderRadius: "8px", fontWeight: "800", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Logout from RouterKart
            </button>
          </div>
        </div>
      </div>

      {/* ADDRESS MODAL */}
      {showAddrModal && (
        <AddressModal
          existing={editingAddr}
          onSave={editingAddr ? handleUpdateAddress : handleAddAddress}
          onClose={() => { setShowAddrModal(false); setEditingAddr(null); }}
        />
      )}

      {/* EMAIL CHANGE MODAL */}
      {emailModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "420px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontWeight: "900", fontSize: "18px", color: "#111", margin: 0 }}>Change Email</h3>
              <button onClick={() => { setEmailModal(false); setOtpStep(OTP_STEP.IDLE); }} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#aaa" }}>×</button>
            </div>
            <p style={{ color: "#aaa", fontSize: "13px", margin: "0 0 18px" }}>Current: <strong style={{ color: "#111" }}>{user?.email}</strong></p>

            {(otpStep === OTP_STEP.IDLE || otpStep === OTP_STEP.SENDING) && (
              <>
                <label style={lbl}>New Email Address</label>
                <input type="email" placeholder="new@example.com" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  style={{ ...inp, marginBottom: "16px" }} onFocus={e => e.target.style.borderColor = "#FEE12B"} onBlur={e => e.target.style.borderColor = "#e5e5e5"} />
                <div style={{ background: "#FFF9E6", border: "1px solid #FEE12B", borderRadius: "8px", padding: "12px 14px", marginBottom: "18px" }}>
                  <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>📧 A 6-digit OTP will be sent to the new email. Expires in 10 minutes.</p>
                </div>
                <button onClick={handleSendEmailOtp} disabled={otpStep === OTP_STEP.SENDING}
                  style={{ width: "100%", padding: "13px", background: "#FEE12B", color: "#111", border: "none", borderRadius: "8px", fontWeight: "900", fontSize: "14px", cursor: "pointer", opacity: otpStep === OTP_STEP.SENDING ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif" }}>
                  {otpStep === OTP_STEP.SENDING ? "Sending OTP..." : "Send OTP →"}
                </button>
              </>
            )}

            {(otpStep === OTP_STEP.VERIFY || otpStep === OTP_STEP.VERIFYING) && (
              <>
                <div style={{ background: "#F0FDF4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px" }}>
                  <p style={{ color: "#16a34a", fontSize: "12px", fontWeight: "600", margin: 0 }}>✅ OTP sent to <strong>{newEmail}</strong></p>
                </div>
                <label style={lbl}>Enter 6-digit OTP</label>
                <input type="text" placeholder="• • • • • •" value={otp}
                  onChange={e => { if (e.target.value.length <= 6) setOtp(e.target.value.replace(/\D/g, "")); }}
                  maxLength={6} autoFocus
                  style={{ ...inp, textAlign: "center", fontSize: "26px", letterSpacing: "10px", fontWeight: "900", fontFamily: "monospace", marginBottom: "8px", padding: "14px" }}
                  onFocus={e => e.target.style.borderColor = "#FEE12B"} onBlur={e => e.target.style.borderColor = "#e5e5e5"} />
                <p style={{ fontSize: "12px", color: "#aaa", margin: "0 0 16px" }}>
                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : <span onClick={handleSendEmailOtp} style={{ color: "#FEE12B", cursor: "pointer", fontWeight: "700", textDecoration: "underline" }}>Resend OTP</span>}
                </p>
                <button onClick={handleVerifyEmailOtp} disabled={otpStep === OTP_STEP.VERIFYING || otp.length !== 6}
                  style={{ width: "100%", padding: "13px", background: "#111", color: "white", border: "none", borderRadius: "8px", fontWeight: "900", fontSize: "14px", cursor: "pointer", opacity: (otpStep === OTP_STEP.VERIFYING || otp.length !== 6) ? 0.6 : 1, marginBottom: "10px", fontFamily: "'DM Sans', sans-serif" }}>
                  {otpStep === OTP_STEP.VERIFYING ? "Verifying..." : "Verify & Update Email"}
                </button>
                <button onClick={() => { setOtpStep(OTP_STEP.IDLE); setOtp(""); }}
                  style={{ width: "100%", padding: "11px", border: "2px solid #eee", background: "white", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", color: "#666", fontFamily: "'DM Sans', sans-serif" }}>
                  ← Change Email
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const lbl    = { display: "block", fontSize: "11px", fontWeight: "800", color: "#555", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "7px" };
const fLabel = { fontSize: "10px", fontWeight: "800", color: "#aaa", letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 6px" };
const fVal   = { fontSize: "15px", fontWeight: "700", color: "#111", margin: 0 };

export default Profile;