import { Link } from "react-router-dom";
import { useIsMobile } from "../hooks/useIsMobile";

function About() {
  const isMobile = useIsMobile();

  return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

      {/* HEADER */}
      <div style={{ background: "#111", padding: isMobile ? "24px 20px 20px" : "44px 40px 32px", borderBottom: "4px solid #FEE12B" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <Link to="/" style={{ color: "#FEE12B", textDecoration: "none", fontSize: "13px", fontWeight: "700" }}>← RouterKart</Link>
          <h1 style={{ color: "white", fontSize: isMobile ? "32px" : "clamp(32px,5vw,52px)", fontWeight: "900", letterSpacing: "-1.5px", margin: "12px 0 6px" }}>About Us</h1>
          <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>Learn more about RouterKart and our mission</p>
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: isMobile ? "28px 20px 60px" : "48px 40px 80px" }}>

        {/* WHO WE ARE */}
        <Section title="Who We Are">
          <p>RouterKart is India's trusted online store for networking equipment — routers, fiber cables, fiber tools, security systems, and streaming devices. Based in Bengaluru, we started with a single mission: make reliable networking gear accessible to every home, office, and ISP technician across the country.</p>
          <p>We source directly from trusted distributors and brands so every product on our platform is genuine, warranty-backed, and competitively priced.</p>
        </Section>

        {/* MISSION */}
        <Section title="Our Mission">
          <p>To be the most reliable and affordable source of networking products in India, delivering genuine gear with honest pricing and fast shipping — no compromise.</p>
        </Section>

        {/* WHAT WE OFFER */}
        <Section title="What We Offer">
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginTop: "4px" }}>
            {[
              { icon: "📡", label: "Routers & Modems", desc: "GPON, Wi-Fi 6, dual-band, and enterprise routers from leading brands." },
              { icon: "🔌", label: "Fiber Cables", desc: "UPC/APC patch cords, armoured cables, and pigtails." },
              { icon: "🔧", label: "Fiber Tools", desc: "Optical power meters, splicers, cleavers, and tool kits." },
              { icon: "🔒", label: "Security Systems", desc: "IP cameras, DVR kits, and surveillance solutions." },
              { icon: "📺", label: "Streaming Devices", desc: "Fire Sticks, Android boxes, and media players." },
              { icon: "🛠️", label: "Network Accessories", desc: "SFP modules, PoE injectors, switches, and more." },
            ].map((item, i) => (
              <div key={i} style={{ background: "white", borderRadius: "10px", padding: "16px", border: "1px solid #eee", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "24px", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ fontWeight: "800", fontSize: "14px", color: "#111", margin: "0 0 4px" }}>{item.label}</p>
                  <p style={{ fontSize: "13px", color: "#666", margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* WHY ROUTERKART */}
        <Section title="Why Choose RouterKart">
          {[
            { icon: "✅", title: "100% Genuine Products", desc: "Every item is sourced from verified distributors. No counterfeits, ever." },
            { icon: "🚚", title: "Fast Delivery", desc: "We ship across India with trusted courier partners. Most orders delivered within 5 working days." },
            { icon: "💰", title: "Honest Pricing", desc: "What you see is what you pay. No hidden charges." },
            { icon: "🔄", title: "Easy Returns", desc: "7-day hassle-free return policy on all products." },
            { icon: "🔒", title: "Secure Payments", desc: "All transactions are processed via Razorpay with bank-grade encryption." },
            { icon: "💬", title: "WhatsApp Support", desc: "Reach us anytime on WhatsApp for quick help with orders or products." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ fontWeight: "800", fontSize: "14px", color: "#111", margin: "0 0 3px" }}>{item.title}</p>
                <p style={{ fontSize: "14px", color: "#555", margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </Section>

        {/* CONTACT */}
        <Section title="Get in Touch">
          <p>Have questions, bulk order enquiries, or partnership proposals? We'd love to hear from you.</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", marginTop: "8px" }}>
            {[
              { label: "Email", value: "admin@routerkart.in" },
              { label: "WhatsApp", value: "Available on our website" },
              { label: "Website", value: "routerkart.in" },
              { label: "Location", value: "Bengaluru, Karnataka, India" },
            ].map((c, i) => (
              <div key={i} style={{ background: "#F7F7F5", borderRadius: "8px", padding: "12px 16px" }}>
                <p style={{ fontSize: "10px", fontWeight: "800", color: "#aaa", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 4px" }}>{c.label}</p>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#111", margin: 0 }}>{c.value}</p>
              </div>
            ))}
          </div>
        </Section>

        <BackToHome />
      </div>
    </div>
  );
}

/* ── shared sub-components ── */
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "36px" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#111", margin: "0 0 14px", paddingBottom: "10px", borderBottom: "2px solid #FEE12B", display: "inline-block" }}>{title}</h2>
      <div style={{ fontSize: "14px", color: "#555", lineHeight: "1.8" }}>{children}</div>
    </div>
  );
}
function BackToHome() {
  return (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
      <Link to="/" style={{ display: "inline-block", padding: "12px 24px", background: "#FEE12B", color: "#111", textDecoration: "none", fontWeight: "800", borderRadius: "8px", fontSize: "14px" }}>← Back to Home</Link>
      <Link to="/store" style={{ display: "inline-block", padding: "12px 24px", background: "#111", color: "white", textDecoration: "none", fontWeight: "800", borderRadius: "8px", fontSize: "14px" }}>Shop Now →</Link>
    </div>
  );
}

export default About;