import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { useIsMobile } from "../hooks/useIsMobile";

// Two-step signup: FORM → OTP verification
const STEP = { FORM: "form", OTP: "otp" };

function Signup() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Step 1
  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass,    setShowPass]    = useState(false);

  // Step 2
  const [otp,     setOtp]     = useState("");
  const [step,    setStep]    = useState(STEP.FORM);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

useEffect(() => {
  if (timer > 0) {
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }
}, [timer]);

const [cooldown, setCooldown] = useState(0);

useEffect(() => {
  if (cooldown > 0) {
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }
}, [cooldown]);

  /* ── password strength ── */
  const getStrength = () => {
    if (!password) return null;
    if (password.length < 6)  return { label: "Weak",   color: "#dc2626", pct: 33 };
    if (password.length < 10) return { label: "Fair",   color: "#cc8800", pct: 66 };
    return                           { label: "Strong",  color: "#16a34a", pct: 100 };
  };
  const strength = getStrength();

  /* ── 60-second countdown ── */
  const startTimer = () => {
    setTimer(60);
    const t = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  /* ── Send OTP ── */
  const handleSendOtp = async () => {
  if (loading) return;

  if (!email) {
    toast.error("Please enter email");
    return;
  }

  if (password !== confirmPass) {
    toast.error("Passwords do not match");
    return;
  }

  console.log("OTP API CALLED");

  setLoading(true);

  try {
    await API.post("/auth/send-otp", {
  name,
  email: email.trim().toLowerCase(),
  password
});

    toast.success("OTP sent to your email");

    setStep(STEP.OTP);     // ✅ MOVE TO OTP SCREEN
    startTimer();          // ✅ START TIMER

  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to send OTP");
  } finally {
    setLoading(false);
  }
};

  /* ── Verify OTP ── */
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { toast.error("Please enter the 6-digit OTP"); return; }
    setLoading(true);
    try {
      const res = await API.post("/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp:   otp.trim()
      });
      localStorage.setItem("token", res.data.token);
localStorage.setItem("user", JSON.stringify(res.data.user));
localStorage.setItem("userName", res.data.user.name || "User");

res.data.user.role === "admin"
  ? navigate("/admin")
  : navigate("/store");;
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    setLoading(true);
    try {
      await API.post("/auth/resend-otp", { email: email.trim().toLowerCase() });
      toast.success("New OTP sent!");
      setOtp("");
      startTimer();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ── Shared styles ── */
  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: "2px solid #e5e5e5",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#111",
    background: "white",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
  };
  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: "800",
    color: "#555",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    marginBottom: "7px",
  };
  const fo = e => (e.target.style.borderColor = "#FEE12B");
  const bl = e => (e.target.style.borderColor = "#e5e5e5");
  const btnBase = {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "800",
    fontSize: "15px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "opacity 0.2s",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── LEFT BRAND PANEL (desktop only) ── */}
      {!isMobile && (
        <div style={{
          flex: 1,
          background: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ maxWidth: "380px", position: "relative", zIndex: 1 }}>
            {/* Logo mark */}
            <div style={{
              width: "48px", height: "48px", background: "#FEE12B",
              borderRadius: "10px", display: "flex", alignItems: "center",
              justifyContent: "center", fontWeight: "900", fontSize: "18px",
              color: "#111", marginBottom: "20px",
            }}>RK</div>

            <h1 style={{
              fontSize: "clamp(32px, 4vw, 48px)", fontWeight: "900",
              color: "white", margin: "0 0 14px", letterSpacing: "-1.5px", lineHeight: 1,
            }}>
              Router<span style={{ color: "#FEE12B" }}>Kart</span>
            </h1>

            <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.65", margin: "0 0 28px" }}>
              India's trusted store for routers, fiber tools and networking equipment.
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

          {/* Diagonal stripe overlay */}
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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

          {/* ══ STEP 1: Registration form ══ */}
          {step === STEP.FORM && (
            <>
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
                We'll email you an OTP to verify your address
              </p>

              {/* Name */}
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Full Name</label>
                <input
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                  style={inputStyle}
                  onFocus={fo} onBlur={bl}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                  style={inputStyle}
                  onFocus={fo} onBlur={bl}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ ...inputStyle, paddingRight: "50px" }}
                    onFocus={fo} onBlur={bl}
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
                {strength && (
                  <div style={{ marginTop: "6px" }}>
                    <div style={{ height: "3px", background: "#f0f0f0", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: strength.pct + "%",
                        background: strength.color,
                        transition: "width 0.3s",
                      }} />
                    </div>
                    <p style={{ fontSize: "11px", color: strength.color, fontWeight: "700", margin: "3px 0 0" }}>
                      {strength.label} password
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: "22px" }}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                  style={{
                    ...inputStyle,
                    borderColor: confirmPass && confirmPass !== password ? "#dc2626" : "#e5e5e5",
                  }}
                  onFocus={fo}
                  onBlur={e => {
                    e.target.style.borderColor =
                      confirmPass && confirmPass !== password ? "#dc2626" : "#e5e5e5";
                  }}
                />
                {confirmPass && confirmPass !== password && (
                  <p style={{ fontSize: "11px", color: "#dc2626", fontWeight: "700", margin: "4px 0 0" }}>
                    Passwords don't match
                  </p>
                )}
              </div>

              {/* Send OTP button */}
              <button
  type="button"   // ✅ IMPORTANT FIX
  onClick={handleSendOtp}
  disabled={loading}
  style={{
    ...btnBase,
    background: "#FEE12B",
    color: "#111",
    opacity: loading ? 0.7 : 1,
    cursor: loading ? "not-allowed" : "pointer",
    marginBottom: "20px",
  }}
>
  {loading ? "Sending OTP..." : "Send OTP to Email →"}
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
            </>
          )}

          {/* ══ STEP 2: OTP Verification ══ */}
          {step === STEP.OTP && (
            <>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "52px", marginBottom: "12px" }}>📧</div>
                <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#111", margin: "0 0 10px" }}>
                  Verify Your Email
                </h2>
                <p style={{ color: "#666", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                  We sent a <strong>6-digit OTP</strong> to<br />
                  <strong style={{ color: "#111" }}>{email}</strong>
                </p>
              </div>

              <div style={{
                background: "#FFF9E6", border: "2px solid #FEE12B",
                borderRadius: "10px", padding: "12px 16px", marginBottom: "20px",
              }}>
                <p style={{ color: "#666", fontSize: "12px", margin: 0, lineHeight: 1.5 }}>
                  ⏰ This OTP expires in <strong>10 minutes</strong>.
                  Check your spam folder if not in inbox.
                </p>
              </div>

              {/* OTP input */}
              <div style={{ marginBottom: "8px" }}>
                <label style={labelStyle}>Enter 6-Digit OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 6) setOtp(val);
                  }}
                  maxLength={6}
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
                  style={{
                    ...inputStyle,
                    textAlign: "center",
                    fontSize: "28px",
                    letterSpacing: "10px",
                    fontWeight: "900",
                    fontFamily: "monospace",
                    padding: "14px",
                  }}
                  onFocus={fo} onBlur={bl}
                />
              </div>

              {/* Resend timer */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "20px",
              }}>
                <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>
                  {timer > 0 ? "Resend OTP in " + timer + "s" : "Didn't receive it?"}
                </p>
                {timer === 0 && (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    style={{
                      background: "none", border: "none",
                      color: "#FEE12B", fontWeight: "800",
                      fontSize: "13px", cursor: "pointer",
                      textDecoration: "underline", padding: 0,
                    }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {/* Verify button */}
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                style={{
                  ...btnBase,
                  background: "#FEE12B",
                  color: "#111",
                  opacity: (loading || otp.length !== 6) ? 0.6 : 1,
                  cursor: (loading || otp.length !== 6) ? "not-allowed" : "pointer",
                  marginBottom: "12px",
                }}
              >
                {loading ? "Verifying..." : "Verify & Create Account →"}
              </button>

              {/* Back button */}
              <button
                onClick={() => { setStep(STEP.FORM); setOtp(""); }}
                style={{
                  ...btnBase,
                  background: "transparent",
                  color: "#666",
                  border: "2px solid #eee",
                }}
              >
                ← Change Email / Details
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Signup;