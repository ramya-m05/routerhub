import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { useIsMobile } from "../hooks/useIsMobile";

/* ── simple email regex ── */
const isValidEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function Login() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailErr, setEmailErr] = useState("");

  /* ── auto redirect if already logged in ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (token && user) {
      user.role === "admin"
        ? navigate("/admin")
        : navigate("/store");
    }
  }, [navigate]);

  /* ── validate email on blur ── */
  const handleEmailBlur = () => {
    if (!email) {
      setEmailErr("");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailErr(
        "Please enter a valid email address (e.g. you@example.com)"
      );
    } else {
      setEmailErr("");
    }
  };

  /* ── login ── */
  const handleLogin = async () => {
    // 🔥 VALIDATIONS
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailErr(
        "Please enter a valid email address (e.g. you@example.com)"
      );
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password: password.trim(), // ✅ FIX (important)
      });

      console.log("LOGIN RESPONSE:", res.data);

      // ✅ STORE DATA
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem(
        "userName",
        res.data.user.name || "User"
      );

      toast.success("Login successful 🚀");

      // ✅ REDIRECT
      res.data.user.role === "admin"
        ? navigate("/admin")
        : navigate("/store");

    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data || err);

      const msg = err.response?.data?.message;

      if (msg === "User not found") {
        toast.error("No account found with this email ❌");
      } else if (msg === "Incorrect password") {
        toast.error("Wrong password ❌");
      } else {
        toast.error(msg || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── shared styles ── */
  const inputBase = {
    width: "100%", padding: "13px 16px",
    border: "2px solid #e5e5e5", borderRadius: "8px",
    fontSize: "14px", color: "#111", background: "white",
    outline: "none", transition: "border-color 0.15s",
    boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif",
  };
  const labelBase = {
    display: "block", fontSize: "11px", fontWeight: "800",
    color: "#555", letterSpacing: "0.5px",
    textTransform: "uppercase", marginBottom: "8px",
  };
  const fo = (e) => (e.target.style.borderColor = "#FEE12B");
  const bl = (e, hasErr) =>
    (e.target.style.borderColor = hasErr ? "#e53e3e" : "#e5e5e5");

  
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
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "48px", height: "48px", background: "#FEE12B",
              borderRadius: "8px", fontWeight: "900", fontSize: "18px",
              color: "#111", marginBottom: "22px",
            }}>RK</div>

            <h1 style={{
              fontSize: "clamp(32px,4vw,48px)", fontWeight: "900",
              color: "white", margin: "0 0 14px", letterSpacing: "-1.5px", lineHeight: 1,
            }}>
              Router<span style={{ color: "#FEE12B" }}>Kart</span>
            </h1>

            <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.65", margin: "0 0 32px" }}>
              India's #1 store for networking equipment — routers, fiber tools, security systems and more.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "🚚 Free delivery on orders ₹999+",
                "🔒 Secure & encrypted payments",
                "💯 Genuine brand-verified products",
              ].map((f, i) => (
                <div key={i} style={{
                  color: "#bbb", fontSize: "13px", fontWeight: "500",
                  padding: "10px 14px", background: "rgba(255,255,255,0.04)",
                  borderRadius: "6px", borderLeft: "3px solid #FEE12B",
                }}>{f}</div>
              ))}
            </div>
          </div>
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: "40%",
            background: "repeating-linear-gradient(-45deg,transparent,transparent 10px,rgba(254,225,43,0.03) 10px,rgba(254,225,43,0.03) 20px)",
          }} />
        </div>
      )}

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{
        width: isMobile ? "100%" : "480px",
        flexShrink: 0,
        background: isMobile ? "#fff" : "#F7F7F5",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "32px 20px" : "40px",
      }}>
        <div style={{
          background: "white", borderRadius: isMobile ? "0" : "16px",
          padding: isMobile ? "4px 0" : "36px", width: "100%",
          boxShadow: isMobile ? "none" : "0 4px 32px rgba(0,0,0,0.08)",
        }}>

          {/* Mobile logo */}
          {isMobile && (
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "44px", height: "44px", background: "#FEE12B",
                borderRadius: "8px", fontWeight: "900", fontSize: "17px",
                color: "#111", marginBottom: "10px",
              }}>RK</div>
              <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#111", margin: 0 }}>
                Router<span style={{ color: "#FEE12B" }}>Kart</span>
              </h1>
            </div>
          )}

          <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#111", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
            Welcome back
          </h2>
          <p style={{ color: "#999", fontSize: "14px", margin: "0 0 26px" }}>
            Sign in to your RouterKart account
          </p>

          {/* ── Email ── */}
          <div style={{ marginBottom: "18px" }}>
            <label style={labelBase}>Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); if (emailErr) setEmailErr(""); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ ...inputBase, borderColor: emailErr ? "#e53e3e" : "#e5e5e5" }}
              onFocus={fo}
              onBlur={e => { handleEmailBlur(); bl(e, !!emailErr); }}
            />
            {emailErr && (
              <p style={{ fontSize: "11px", color: "#e53e3e", fontWeight: "700", margin: "5px 0 0" }}>
                ⚠️ {emailErr}
              </p>
            )}
          </div>

          {/* ── Password ── */}
          <div style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ ...labelBase, marginBottom: 0 }}>Password</label>
              {/* ── Forgot Password link ── */}
              <Link
                to="/forgot-password"
                style={{
                  fontSize: "12px", fontWeight: "700",
                  color: "#FEE12B", textDecoration: "none",
                  letterSpacing: "0.2px",
                }}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{ ...inputBase, paddingRight: "50px" }}
                onFocus={fo}
                onBlur={e => bl(e, false)}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: "absolute", right: "14px", top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none",
                  cursor: "pointer", fontSize: "16px",
                }}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* ── Sign In button ── */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%", padding: "14px",
              background: "#FEE12B", color: "#111",
              border: "none", borderRadius: "8px",
              fontWeight: "800", fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "background 0.15s",
              marginTop: "18px", marginBottom: "22px",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#f5d400"; }}
            onMouseLeave={e => (e.currentTarget.style.background = "#FEE12B")}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          {/* ── Divider ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ flex: 1, height: "1px", background: "#eee", display: "block" }} />
            <span style={{ fontSize: "12px", color: "#aaa", fontWeight: "600" }}>New to RouterKart?</span>
            <span style={{ flex: 1, height: "1px", background: "#eee", display: "block" }} />
          </div>

          <Link
            to="/signup"
            style={{
              display: "block", width: "100%", padding: "13px",
              border: "2px solid #111", borderRadius: "8px",
              textAlign: "center", textDecoration: "none",
              color: "#111", fontWeight: "800", fontSize: "14px",
              boxSizing: "border-box",
            }}
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;