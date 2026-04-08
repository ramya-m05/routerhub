import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
   const user = JSON.parse(localStorage.getItem("user") || "null");

if (token && user) {
  user.role === "admin"
    ? navigate("/admin")
    : navigate("/store");
}
}, []);

  const handleLogin = async () => {
  if (!email || !password) {
    toast.error("Please fill in all fields");
    return;
  }

  setLoading(true);

  try {
    const res = await API.post("/auth/login", { email, password });

    // ✅ FIXED
    if (res.data.role !== "admin") {
      toast.error("Access denied. Admin only.");
      return;
    }

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data));
    localStorage.setItem("userName", res.data.name || "Admin");

    toast.success("Welcome back, Admin ⚡");
    navigate("/admin");

  } catch (err) {
    const msg = err.response?.data?.message;
    if (msg === "User not found") toast.error("Admin not found");
    else if (msg === "Incorrect password") toast.error("Wrong password");
    else toast.error("Login failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={styles.wrapper}>
      {/* BACKGROUND PATTERN */}
      <div style={styles.bgPattern} />

      <div style={styles.card}>
        {/* LOGO */}
        <div style={styles.logoWrap}>
          <div style={styles.logoMark}>RH</div>
          <div>
            <h2 style={styles.logoText}>
              Router<span style={{ color: "#FEE12B" }}>kart</span>
            </h2>
            <p style={styles.logoSub}>Admin Panel</p>
          </div>
        </div>

        <div style={styles.divider} />

        <h3 style={styles.title}>Sign in to Admin</h3>
        <p style={styles.subtitle}>Manage products, orders and analytics</p>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Admin Email</label>
          <input
            type="email"
            placeholder="admin@Routerkart.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={styles.input}
            onFocus={(e) => (e.target.style.borderColor = "#FEE12B")}
            onBlur={(e) => (e.target.style.borderColor = "#333")}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{ ...styles.input, paddingRight: "50px" }}
              onFocus={(e) => (e.target.style.borderColor = "#FEE12B")}
              onBlur={(e) => (e.target.style.borderColor = "#333")}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              style={styles.eyeBtn}
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            ...styles.loginBtn,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = "#f5d400";
          }}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "#FEE12B")
          }
        >
          {loading ? "Signing in..." : "⚡ Admin Sign In"}
        </button>

        <p style={styles.backLink}>
          <a href="/login" style={{ color: "#666", fontSize: "13px", textDecoration: "none" }}>
            ← Back to store login
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  bgPattern: {
    position: "absolute",
    inset: 0,
    background:
      "repeating-linear-gradient(-45deg,transparent,transparent 20px,rgba(254,225,43,0.03) 20px,rgba(254,225,43,0.03) 40px)",
  },
  card: {
    background: "#1a1a1a",
    borderRadius: "20px",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
    border: "1px solid #2a2a2a",
    boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
    position: "relative",
    zIndex: 1,
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "24px",
  },
  logoMark: {
    width: "44px",
    height: "44px",
    background: "#FEE12B",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "16px",
    color: "#111",
    flexShrink: 0,
  },
  logoText: {
    fontSize: "22px",
    fontWeight: "900",
    color: "white",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  logoSub: {
    fontSize: "11px",
    color: "#555",
    margin: "2px 0 0",
    fontWeight: "600",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  divider: {
    height: "1px",
    background: "#2a2a2a",
    marginBottom: "24px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "900",
    color: "white",
    margin: "0 0 6px",
    letterSpacing: "-0.3px",
  },
  subtitle: {
    color: "#666",
    fontSize: "13px",
    margin: "0 0 28px",
  },
  fieldGroup: {
    marginBottom: "18px",
  },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: "800",
    color: "#666",
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "13px 16px",
    border: "2px solid #333",
    borderRadius: "8px",
    fontSize: "14px",
    color: "white",
    background: "#222",
    outline: "none",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
  },
  eyeBtn: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  loginBtn: {
    width: "100%",
    padding: "14px",
    background: "#FEE12B",
    color: "#111",
    border: "none",
    borderRadius: "8px",
    fontWeight: "900",
    fontSize: "15px",
    transition: "background 0.15s",
    marginTop: "8px",
    marginBottom: "20px",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.2px",
  },
  backLink: {
    textAlign: "center",
    margin: 0,
  },
};

export default AdminLogin;