import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { useIsMobile } from "../hooks/useIsMobile";

/* ── Steps ── */
const STEP = {
  EMAIL: "email",    // enter email
  OTP:   "otp",     // enter OTP
  RESET: "reset",   // enter new password
  DONE:  "done",    // success screen
};

/* ── Email regex ── */
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function ForgotPassword() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [step,      setStep]      = useState(STEP.EMAIL);
  const [email,     setEmail]     = useState("");
  const [emailErr,  setEmailErr]  = useState("");
  const [otp,       setOtp]       = useState("");
  const [newPass,   setNewPass]   = useState("");
  const [confirmP,  setConfirmP]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [timer,     setTimer]     = useState(0);

  /* ── countdown ── */
  const startTimer = () => {
    setTimer(60);
    const t = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  /* ── email validation ── */
  const validateEmail = () => {
    if (!email.trim()) { setEmailErr("Email address is required"); return false; }
    if (!isValidEmail(email)) {
      setEmailErr("Please enter a valid email address (e.g. you@example.com)");
      return false;
    }
    setEmailErr("");
    return true;
  };

  /* ── password strength ── */
  const getStrength = () => {
    if (!newPass) return null;
    if (newPass.length < 6)  return { label: "Weak",   color: "#e53e3e", pct: 33 };
    if (newPass.length < 10) return { label: "Fair",   color: "#cc8800", pct: 66 };
    return                         { label: "Strong",  color: "#16a34a", pct: 100 };
  };
  const strength = getStrength();

  /* ── STEP 1: Send OTP ── */
  const handleSendOtp = async () => {
    if (!validateEmail()) return;
    setLoading(true);
    try {
      await API.post("/auth/forgot-password/send-otp", {
        email: email.trim().toLowerCase(),
      });
      toast.success("OTP sent to " + email + " 📧");
      setStep(STEP.OTP);
      startTimer();
    } catch (err) {
      const msg = err.response?.data?.message;
      // Show specific error if email not registered
      if (msg?.toLowerCase().includes("not found") || msg?.toLowerCase().includes("not registered")) {
        toast.error("No account found with this email address");
      } else {
        toast.error(msg || "Failed to send OTP. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    setLoading(true);
    try {
      await API.post("/auth/forgot-password/send-otp", {
        email: email.trim().toLowerCase(),
      });
      toast.success("New OTP sent!");
      setOtp("");
      startTimer();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ── STEP 2: Verify OTP ── */
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { toast.error("Please enter the 6-digit OTP"); return; }
    setLoading(true);
    try {
      await API.post("/auth/forgot-password/verify-otp", {
        email: email.trim().toLowerCase(),
        otp:   otp.trim(),
      });
      toast.success("OTP verified ✅ Set your new password");
      setStep(STEP.RESET);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ── STEP 3: Reset password ── */
  const handleResetPassword = async () => {
    if (newPass.length < 6) {
      toast.error("Password must be at least 6 characters"); return;
    }
    if (newPass !== confirmP) {
      toast.error("Passwords do not match"); return;
    }
    setLoading(true);
    try {
      await API.post("/auth/forgot-password/reset", {
        email:       email.trim().toLowerCase(),
        otp:         otp.trim(),
        newPassword: newPass,
      });
      toast.success("Password reset successful! Please login 🎉");
      setStep(STEP.DONE);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  /* ── shared styles ── */
  const inputBase = {
    width: "100%", padding: "13px 16px",
    border: "2px solid #e5e5e5", borderRadius: "8px",
    fontSize: "14px", color: "#111", background: "white",
    outline: "none", transition: "border-color 0.2s",
    boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif",
  };
  const labelBase = {
    display: "block", fontSize: "11px", fontWeight: "800",
    color: "#555", letterSpacing: "0.5px",
    textTransform: "uppercase", marginBottom: "8px",
  };
  const fo = (e) => (e.target.style.borderColor = "#FEE12B");
  const bl = (e) => (e.target.style.borderColor = "#e5e5e5");
  const btnPrimary = {
    width: "100%", padding: "14px",
    background: "#FEE12B", color: "#111",
    border: "none", borderRadius: "8px",
    fontWeight: "800", fontSize: "15px",
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
    transition: "background 0.15s",
  };
  const btnSecondary = {
    width: "100%", padding: "13px",
    background: "transparent", color: "#666",
    border: "2px solid #eee", borderRadius: "8px",
    fontWeight: "700", fontSize: "14px",
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  };

  /* ── step labels for progress bar ── */
  const STEPS_META = [
    { id: STEP.EMAIL, label: "Email"    },
    { id: STEP.OTP,   label: "Verify"  },
    { id: STEP.RESET, label: "Reset"   },
  ];
  const stepIdx = { [STEP.EMAIL]: 0, [STEP.OTP]: 1, [STEP.RESET]: 2, [STEP.DONE]: 3 };
  const currentIdx = stepIdx[step];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── LEFT PANEL (desktop) ── */}
      {!isMobile && (
        <div style={{
          flex: 1, background: "#111",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "60px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ maxWidth: "360px", position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "56px", marginBottom: "20px" }}>🔐</div>
            <h2 style={{ fontSize: "clamp(26px,3vw,36px)", fontWeight: "900", color: "white", margin: "0 0 14px", letterSpacing: "-0.8px", lineHeight: 1.1 }}>
              Forgot your<br />password?
            </h2>
            <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.7", margin: "0 0 28px" }}>
              No worries! Enter your registered email and we'll send you a one-time password to verify your identity.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { step: "1", label: "Enter your registered email" },
                { step: "2", label: "Verify the OTP we send you" },
                { step: "3", label: "Set a new strong password" },
              ].map(s => (
                <div key={s.step} style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{
                    width: "28px", height: "28px", background: "#FEE12B",
                    borderRadius: "50%", display: "flex", alignItems: "center",
                    justifyContent: "center", fontWeight: "900", fontSize: "12px",
                    color: "#111", flexShrink: 0,
                  }}>{s.step}</div>
                  <p style={{ color: "#ccc", fontSize: "13px", fontWeight: "500", margin: 0 }}>{s.label}</p>
                </div>
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
        overflowY: "auto",
      }}>
        <div style={{
          background: "white",
          borderRadius: isMobile ? "0" : "16px",
          padding: isMobile ? "4px 0" : "36px",
          width: "100%",
          boxShadow: isMobile ? "none" : "0 4px 32px rgba(0,0,0,0.08)",
        }}>

          {/* Mobile logo */}
          {isMobile && step !== STEP.DONE && (
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h1 style={{ fontWeight: "900", fontSize: "24px", color: "#111", margin: 0 }}>
                Router<span style={{ color: "#FEE12B" }}>Kart</span>
              </h1>
            </div>
          )}

          {/* ── PROGRESS BAR (steps 1-3) ── */}
          {step !== STEP.DONE && (
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {STEPS_META.map((s, i) => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < STEPS_META.length - 1 ? 1 : "none", gap: "6px" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: i < currentIdx ? "#16a34a" : i === currentIdx ? "#FEE12B" : "#f0f0f0",
                      color: i <= currentIdx ? "#111" : "#aaa",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: "900", flexShrink: 0,
                      transition: "all 0.3s",
                    }}>
                      {i < currentIdx ? "✓" : i + 1}
                    </div>
                    {i < STEPS_META.length - 1 && (
                      <div style={{
                        flex: 1, height: "2px",
                        background: i < currentIdx ? "#16a34a" : "#f0f0f0",
                        borderRadius: "1px", transition: "background 0.3s",
                      }} />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                {STEPS_META.map((s, i) => (
                  <span key={s.id} style={{
                    fontSize: "10px", fontWeight: "700",
                    color: i === currentIdx ? "#111" : "#aaa",
                    letterSpacing: "0.5px",
                  }}>{s.label}</span>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              STEP 1 — Enter Email
          ══════════════════════════════════════ */}
          {step === STEP.EMAIL && (
            <>
              <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#111", margin: "0 0 6px" }}>
                Reset Password
              </h2>
              <p style={{ color: "#999", fontSize: "14px", margin: "0 0 24px", lineHeight: 1.5 }}>
                Enter the email address linked to your RouterKart account.
              </p>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelBase}>
                  Registered Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (emailErr) setEmailErr("");
                  }}
                  onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                  style={{
                    ...inputBase,
                    borderColor: emailErr ? "#e53e3e" : "#e5e5e5",
                  }}
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
                  autoFocus
                />
                {emailErr && (
                  <div style={{
                    marginTop: "8px", padding: "9px 13px",
                    background: "#FEF2F2", border: "1px solid #fecaca",
                    borderRadius: "6px",
                  }}>
                    <p style={{ fontSize: "12px", color: "#e53e3e", fontWeight: "700", margin: 0 }}>
                      ⚠️ {emailErr}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                style={{
                  ...btnPrimary,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                  marginBottom: "14px",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#f5d400"; }}
                onMouseLeave={e => (e.currentTarget.style.background = "#FEE12B")}
              >
                {loading ? "Sending OTP..." : "Send OTP →"}
              </button>

              <Link
                to="/login"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "6px", padding: "12px",
                  border: "2px solid #eee", borderRadius: "8px",
                  textDecoration: "none", color: "#666",
                  fontWeight: "700", fontSize: "14px",
                }}
              >
                ← Back to Login
              </Link>
            </>
          )}

          {/* ══════════════════════════════════════
              STEP 2 — Enter OTP
          ══════════════════════════════════════ */}
          {step === STEP.OTP && (
            <>
              <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#111", margin: "0 0 6px" }}>
                Verify OTP
              </h2>
              <p style={{ color: "#666", fontSize: "14px", margin: "0 0 20px", lineHeight: 1.6 }}>
                We sent a 6-digit OTP to<br />
                <strong style={{ color: "#111" }}>{email}</strong>
              </p>

              <div style={{
                background: "#FFF9E6", border: "2px solid #FEE12B",
                borderRadius: "10px", padding: "12px 16px", marginBottom: "20px",
              }}>
                <p style={{ color: "#666", fontSize: "12px", margin: 0, lineHeight: 1.5 }}>
                  ⏰ This OTP expires in <strong>10 minutes</strong>.
                  Check your spam folder if not in inbox.
                </p>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label style={labelBase}>Enter 6-Digit OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, "");
                    if (v.length <= 6) setOtp(v);
                  }}
                  maxLength={6}
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
                  style={{
                    ...inputBase,
                    textAlign: "center", fontSize: "28px",
                    letterSpacing: "10px", fontWeight: "900",
                    fontFamily: "monospace", padding: "14px",
                  }}
                  onFocus={fo} onBlur={bl}
                />
              </div>

              {/* Timer / resend */}
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

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                style={{
                  ...btnPrimary,
                  opacity: (loading || otp.length !== 6) ? 0.6 : 1,
                  cursor: (loading || otp.length !== 6) ? "not-allowed" : "pointer",
                  marginBottom: "12px",
                }}
                onMouseEnter={e => { if (!loading && otp.length === 6) e.currentTarget.style.background = "#f5d400"; }}
                onMouseLeave={e => (e.currentTarget.style.background = "#FEE12B")}
              >
                {loading ? "Verifying..." : "Verify OTP →"}
              </button>

              <button
                onClick={() => { setStep(STEP.EMAIL); setOtp(""); }}
                style={btnSecondary}
              >
                ← Change Email
              </button>
            </>
          )}

          {/* ══════════════════════════════════════
              STEP 3 — New Password
          ══════════════════════════════════════ */}
          {step === STEP.RESET && (
            <>
              <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#111", margin: "0 0 6px" }}>
                Set New Password
              </h2>
              <p style={{ color: "#999", fontSize: "14px", margin: "0 0 24px" }}>
                Choose a strong password for your account.
              </p>

              {/* New Password */}
              <div style={{ marginBottom: "16px" }}>
                <label style={labelBase}>New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    style={{ ...inputBase, paddingRight: "50px" }}
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
                        height: "100%", width: strength.pct + "%",
                        background: strength.color, transition: "width 0.3s",
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
                <label style={labelBase}>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-enter your new password"
                  value={confirmP}
                  onChange={e => setConfirmP(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleResetPassword()}
                  style={{
                    ...inputBase,
                    borderColor: confirmP && confirmP !== newPass ? "#e53e3e" : "#e5e5e5",
                  }}
                  onFocus={fo}
                  onBlur={e => {
                    e.target.style.borderColor =
                      confirmP && confirmP !== newPass ? "#e53e3e" : "#e5e5e5";
                  }}
                />
                {confirmP && confirmP !== newPass && (
                  <p style={{ fontSize: "11px", color: "#e53e3e", fontWeight: "700", margin: "5px 0 0" }}>
                    Passwords don't match
                  </p>
                )}
                {confirmP && confirmP === newPass && newPass.length >= 6 && (
                  <p style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700", margin: "5px 0 0" }}>
                    ✅ Passwords match
                  </p>
                )}
              </div>

              <button
                onClick={handleResetPassword}
                disabled={loading || newPass.length < 6 || newPass !== confirmP}
                style={{
                  ...btnPrimary,
                  opacity: (loading || newPass.length < 6 || newPass !== confirmP) ? 0.6 : 1,
                  cursor: (loading || newPass.length < 6 || newPass !== confirmP) ? "not-allowed" : "pointer",
                  marginBottom: "12px",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#f5d400"; }}
                onMouseLeave={e => (e.currentTarget.style.background = "#FEE12B")}
              >
                {loading ? "Resetting..." : "Reset Password →"}
              </button>

              <button onClick={() => setStep(STEP.OTP)} style={btnSecondary}>
                ← Back to OTP
              </button>
            </>
          )}

          {/* ══════════════════════════════════════
              STEP 4 — Success
          ══════════════════════════════════════ */}
          {step === STEP.DONE && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
              <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#111", margin: "0 0 10px", letterSpacing: "-0.5px" }}>
                Password Reset!
              </h2>
              <p style={{ color: "#666", fontSize: "14px", lineHeight: 1.6, margin: "0 0 28px" }}>
                Your password has been updated successfully.
                You can now log in with your new password.
              </p>

              <div style={{
                background: "#F0FDF4", border: "2px solid #bbf7d0",
                borderRadius: "10px", padding: "14px 18px", marginBottom: "24px",
              }}>
                <p style={{ color: "#16a34a", fontSize: "13px", fontWeight: "600", margin: 0 }}>
                  ✅ Your account is secure. Remember to use a unique password.
                </p>
              </div>

              <button
                onClick={() => navigate("/login")}
                style={{ ...btnPrimary, marginBottom: "12px" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f5d400")}
                onMouseLeave={e => (e.currentTarget.style.background = "#FEE12B")}
              >
                Login Now →
              </button>

              <Link
                to="/store"
                style={{
                  display: "block", padding: "12px",
                  border: "2px solid #eee", borderRadius: "8px",
                  textDecoration: "none", color: "#666",
                  fontWeight: "700", fontSize: "14px",
                }}
              >
                Continue Shopping
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;