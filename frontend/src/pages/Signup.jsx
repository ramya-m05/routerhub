import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { useIsMobile } from "../hooks/useIsMobile";

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function Signup() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [emailErr,    setEmailErr]    = useState("");

  const getStrength = () => {
    if (!password) return null;
    if (password.length < 6)  return { label: "Weak",   color: "#e53e3e", pct: 33 };
    if (password.length < 10) return { label: "Fair",   color: "#cc8800", pct: 66 };
    return                         { label: "Strong",  color: "#16a34a", pct: 100 };
  };
  const strength = getStrength();

  const validate = () => {
    if (!name.trim())             { toast.error("Full name is required");               return false; }
    if (!email.trim())            { toast.error("Email address is required");           return false; }
    if (!isValidEmail(email))     {
      setEmailErr("Please enter a valid email address (e.g. you@example.com)");
      toast.error("Enter a valid email address");                                       return false;
    }
    if (password.length < 6)      { toast.error("Password must be at least 6 characters"); return false; }
    if (password !== confirmPass)  { toast.error("Passwords do not match ❌");           return false; }
    return true;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await API.post("/auth/register", {
        name:     name.trim(),
        email:    email.trim().toLowerCase(),
        password,
      });
      // If backend returns token directly on register, log them in immediately
      if (res.data.token) {
        localStorage.setItem("token",    res.data.token);
        localStorage.setItem("role",     res.data.role     || "user");
        localStorage.setItem("userName", res.data.name     || name.trim());
        toast.success("Account created! Welcome to RouterKart 🎉");
        navigate("/store");
      } else {
        toast.success("Account created! Please sign in.");
        navigate("/login");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (msg.toLowerCase().includes("already"))
        toast.error("This email is already registered. Please login.");
      else
        toast.error(msg || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: "100%", padding: "12px 14px",
    border: "2px solid #e5e5e5", borderRadius: "8px",
    fontSize: "14px", color: "#111", background: "white",
    outline: "none", transition: "border-color 0.2s",
    boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif",
  };
  const lbl = {
    display: "block", fontSize: "11px", fontWeight: "800",
    color: "#555", letterSpacing: "0.5px",
    textTransform: "uppercase", marginBottom: "7px",
  };
  const fo = (e) => (e.target.style.borderColor = "#FEE12B");
  const bl = (e) => (e.target.style.borderColor = "#e5e5e5");

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── LEFT BRAND PANEL (desktop only) ── */}
      {!isMobile && (
        <div style={{
          flex: 1, background: "#111",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "60px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ maxWidth: "380px", position: "relative", zIndex: 1 }}>
            <div style={{
              width: "48px", height: "48px", background: "#FEE12B",
              borderRadius: "10px", display: "flex", alignItems: "center",
              justifyContent: "center", fontWeight: "900", fontSize: "18px",
              color: "#111", marginBottom: "22px",
            }}>RK</div>

            <h1 style={{
              fontSize: "clamp(32px, 4vw, 48px)", fontWeight: "900",
              color: "white", margin: "0 0 14px",
              letterSpacing: "-1.5px", lineHeight: 1,
            }}>
              Router<span style={{ color: "#FEE12B" }}>Kart</span>
            </h1>

            <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.65", margin: "0 0 28px" }}>
              India's trusted store for routers, fiber tools & networking equipment.
            </p>

            {[
              "🚀 Fast delivery across India",
              "🔒 Safe & secure checkout",
              "💎 Genuine, brand-verified products",
              "⚡ 24/7 WhatsApp support",
            ].map((f, i) => (
              <div key={i} style={{
                color: "#bbb", fontSize: "13px", fontWeight: "500",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: "6px",
                borderLeft: "3px solid #FEE12B",
                marginBottom: "10px",
              }}>{f}</div>
            ))}
          </div>

          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: "40%",
            background: "repeating-linear-gradient(-45deg,transparent,transparent 10px,rgba(254,225,43,0.03) 10px,rgba(254,225,43,0.03) 20px)",
          }} />
        </div>
      )}

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{
        width: isMobile ? "100%" : "500px",
        flexShrink: 0,
        background: isMobile ? "#fff" : "#F7F7F5",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "28px 20px" : "40px",
        overflowY: "auto",
      }}>
        <div style={{
          background: "white",
          borderRadius: isMobile ? "0" : "16px",
          padding: isMobile ? "4px 0" : "40px",
          width: "100%",
          boxShadow: isMobile ? "none" : "0 4px 32px rgba(0,0,0,0.08)",
        }}>

          {/* Mobile logo */}
          {isMobile && (
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <h1 style={{ fontWeight: "900", fontSize: "26px", color: "#111", margin: 0 }}>
                Router<span style={{ color: "#FEE12B" }}>Kart</span>
              </h1>
            </div>
          )}

          <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#111", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Create Account
          </h2>
          <p style={{ color: "#999", fontSize: "14px", margin: "0 0 24px" }}>
            Sign up and start shopping on RouterKart
          </p>

          {/* Full Name */}
          <div style={{ marginBottom: "16px" }}>
            <label style={lbl}>Full Name</label>
            <input
              placeholder="John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSignup()}
              style={inp}
              onFocus={fo} onBlur={bl}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label style={lbl}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); if (emailErr) setEmailErr(""); }}
              onKeyDown={e => e.key === "Enter" && handleSignup()}
              style={{ ...inp, borderColor: emailErr ? "#e53e3e" : "#e5e5e5" }}
              onFocus={fo}
              onBlur={e => {
                if (email && !isValidEmail(email)) {
                  setEmailErr("Please enter a valid email address (e.g. you@example.com)");
                  e.target.style.borderColor = "#e53e3e";
                } else {
                  setEmailErr("");
                  e.target.style.borderColor = "#e5e5e5";
                }
              }}
            />
            {emailErr && (
              <div style={{ marginTop: "6px", padding: "8px 12px", background: "#FEF2F2", border: "1px solid #fecaca", borderRadius: "6px" }}>
                <p style={{ fontSize: "12px", color: "#e53e3e", fontWeight: "700", margin: 0 }}>⚠️ {emailErr}</p>
              </div>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: "16px" }}>
            <label style={lbl}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ ...inp, paddingRight: "50px" }}
                onFocus={fo} onBlur={bl}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
            {strength && (
              <div style={{ marginTop: "6px" }}>
                <div style={{ height: "3px", background: "#f0f0f0", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: strength.pct + "%", background: strength.color, transition: "width 0.3s" }} />
                </div>
                <p style={{ fontSize: "11px", color: strength.color, fontWeight: "700", margin: "3px 0 0" }}>
                  {strength.label} password
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "24px" }}>
            <label style={lbl}>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSignup()}
                style={{
                  ...inp,
                  paddingRight: "50px",
                  borderColor: confirmPass && confirmPass !== password
                    ? "#e53e3e"
                    : confirmPass && confirmPass === password && password.length >= 6
                    ? "#16a34a"
                    : "#e5e5e5",
                }}
                onFocus={fo}
                onBlur={e => {
                  e.target.style.borderColor =
                    confirmPass && confirmPass !== password ? "#e53e3e" : "#e5e5e5";
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            {confirmPass && confirmPass !== password && (
              <p style={{ fontSize: "11px", color: "#e53e3e", fontWeight: "700", margin: "5px 0 0" }}>
                Passwords don't match
              </p>
            )}
            {confirmPass && confirmPass === password && password.length >= 6 && (
              <p style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700", margin: "5px 0 0" }}>
                ✅ Passwords match
              </p>
            )}
          </div>

          {/* Sign Up button */}
          <button
            onClick={handleSignup}
            disabled={loading}
            style={{
              width: "100%", padding: "14px",
              background: "#FEE12B", color: "#111",
              border: "none", borderRadius: "8px",
              fontWeight: "800", fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginBottom: "20px",
              fontFamily: "'DM Sans', sans-serif",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#f5d400"; }}
            onMouseLeave={e => (e.currentTarget.style.background = "#FEE12B")}
          >
            {loading ? "Creating account..." : "Create Account →"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ flex: 1, height: "1px", background: "#eee", display: "block" }} />
            <span style={{ fontSize: "12px", color: "#aaa", fontWeight: "600" }}>Already have an account?</span>
            <span style={{ flex: 1, height: "1px", background: "#eee", display: "block" }} />
          </div>

          <Link
            to="/login"
            style={{
              display: "block", padding: "13px",
              border: "2px solid #111", borderRadius: "8px",
              textAlign: "center", textDecoration: "none",
              color: "#111", fontWeight: "800", fontSize: "14px",
            }}
          >
            Sign In Instead
          </Link>

        </div>
      </div>
    </div>
  );
}

export default Signup;