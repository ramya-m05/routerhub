import { useState } from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "../hooks/useIsMobile";

const FAQS = [
  {
    q: "How do I track my order?",
    a: "Once your order is dispatched, you'll receive a tracking number via email. You can also check the status on your Orders page after logging in to RouterKart.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI, credit/debit cards, net banking, and Cash on Delivery (COD) via Razorpay. COD orders require a ₹150 advance at checkout.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard delivery takes 3–7 working days depending on your location. The estimated delivery date is shown on each product page and your order confirmation email.",
  },
  {
    q: "Can I cancel my order?",
    a: "Yes, orders can be cancelled before they are shipped. Once dispatched, cancellation is not possible. Please email admin@routerkart.in or WhatsApp us immediately for cancellation requests.",
  },
  {
    q: "I received a wrong or damaged product. What do I do?",
    a: "Please email admin@routerkart.in within 3 days of delivery with your Order ID and photos of the issue. We'll arrange a return pickup and process your refund or replacement within 5–7 business days.",
  },
  {
    q: "How long does a refund take?",
    a: "Refunds are processed within 5–7 business days after the return is approved. The amount is credited back to your original payment method.",
  },
  {
    q: "Do you offer warranty on products?",
    a: "Yes, all products are genuine and come with manufacturer warranty. Warranty duration varies by product and brand — please check the product description page for details.",
  },
  {
    q: "I forgot my password. How do I reset it?",
    a: "Click 'Forgot Password?' on the Login page. Enter your registered email and we'll send you an OTP to reset your password.",
  },
  {
    q: "Can I change my delivery address after placing an order?",
    a: "Address changes are only possible before the order is dispatched. Please contact us immediately via WhatsApp or email with your Order ID and the new address.",
  },
  {
    q: "Do you ship outside India?",
    a: "Currently, RouterKart ships only within India. We plan to expand international shipping in the future.",
  },
  {
    q: "Is Cash on Delivery (COD) available for all products?",
    a: "COD is available for most products and locations. A ₹150 advance is collected online to confirm the order, with the remaining balance paid on delivery.",
  },
  {
    q: "How do I write a product review?",
    a: "You can write a review on the product page after you've received your order. Only verified buyers (who have purchased and received the product) can submit reviews.",
  },
];

function Support() {
  const isMobile  = useIsMobile();
  const [openFaq, setOpenFaq] = useState(null);
  const [search,  setSearch]  = useState("");

  const filtered = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

      {/* HEADER */}
      <div style={{ background: "#111", padding: isMobile ? "24px 20px 20px" : "44px 40px 32px", borderBottom: "4px solid #FEE12B" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <Link to="/" style={{ color: "#FEE12B", textDecoration: "none", fontSize: "13px", fontWeight: "700" }}>← RouterKart</Link>
          <h1 style={{ color: "white", fontSize: isMobile ? "32px" : "clamp(32px,5vw,52px)", fontWeight: "900", letterSpacing: "-1.5px", margin: "12px 0 6px" }}>Support Center</h1>
          <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>We're here to help — find answers or reach out to us directly</p>
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: isMobile ? "28px 20px 60px" : "48px 40px 80px" }}>

        {/* CONTACT CHANNELS */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "14px", marginBottom: "40px" }}>
          {[
            {
              icon: "💬",
              title: "WhatsApp",
              desc: "Fastest response — chat with us on WhatsApp for order issues, product queries, or anything else.",
              action: "Chat on WhatsApp",
              href: "https://wa.me/919876543210?text=Hi RouterKart, I need help with my order.",
              color: "#25D366",
              light: "#F0FDF4",
              border: "#bbf7d0",
            },
            {
              icon: "📧",
              title: "Email Support",
              desc: "Email us for returns, refund requests, or detailed queries. We respond within 24–48 business hours.",
              action: "admin@routerkart.in",
              href: "mailto:admin@routerkart.in",
              color: "#111",
              light: "#F7F7F5",
              border: "#eee",
            },
            {
              icon: "📦",
              title: "My Orders",
              desc: "Track your orders, view status updates, and access your order history from your account.",
              action: "View My Orders",
              href: "/orders",
              color: "#1d4ed8",
              light: "#EFF6FF",
              border: "#BFDBFE",
              internal: true,
            },
          ].map((c, i) => (
            <div key={i} style={{ background: c.light, borderRadius: "12px", padding: "20px", border: `1px solid ${c.border}`, display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "28px", marginBottom: "10px" }}>{c.icon}</span>
              <h3 style={{ fontWeight: "900", fontSize: "15px", color: "#111", margin: "0 0 6px" }}>{c.title}</h3>
              <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.6, margin: "0 0 14px", flex: 1 }}>{c.desc}</p>
              {c.internal ? (
                <Link to={c.href} style={{ display: "inline-block", padding: "9px 16px", background: c.color, color: "white", textDecoration: "none", fontWeight: "800", borderRadius: "7px", fontSize: "13px", textAlign: "center" }}>{c.action}</Link>
              ) : (
                <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                  style={{ display: "inline-block", padding: "9px 16px", background: c.color, color: "white", textDecoration: "none", fontWeight: "800", borderRadius: "7px", fontSize: "13px", textAlign: "center" }}>
                  {c.action}
                </a>
              )}
            </div>
          ))}
        </div>

        {/* FAQ SECTION */}
        <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#111", margin: "0 0 6px", letterSpacing: "-0.5px" }}>Frequently Asked Questions</h2>
        <p style={{ fontSize: "14px", color: "#aaa", margin: "0 0 18px" }}>Can't find your answer? Contact us on WhatsApp or email.</p>

        {/* FAQ SEARCH */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", border: "2px solid #eee", borderRadius: "10px", padding: "0 16px", background: "white", marginBottom: "20px", transition: "border-color 0.2s" }}
          onFocus={() => {}} onBlur={() => {}}>
          <span style={{ fontSize: "16px", color: "#aaa" }}>🔍</span>
          <input
            placeholder="Search questions..."
            value={search}
            onChange={e => { setSearch(e.target.value); setOpenFaq(null); }}
            style={{ flex: 1, border: "none", outline: "none", padding: "13px 0", fontSize: "14px", color: "#111", background: "transparent", fontFamily: "'DM Sans', sans-serif" }}
          />
          {search && (
            <button onClick={() => setSearch("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "18px", padding: 0 }}>✕</button>
          )}
        </div>

        {/* FAQ LIST */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", background: "white", borderRadius: "12px", border: "1px solid #eee" }}>
            <p style={{ fontSize: "32px", marginBottom: "10px" }}>🤔</p>
            <p style={{ fontWeight: "700", color: "#111", margin: "0 0 4px" }}>No results found for "{search}"</p>
            <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>Try a different keyword or contact us on WhatsApp.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map((faq, i) => (
              <div key={i} style={{ background: "white", borderRadius: "10px", border: `1px solid ${openFaq === i ? "#FEE12B" : "#eee"}`, overflow: "hidden", transition: "border-color 0.15s" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", padding: "16px 18px", background: "transparent", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif" }}>
                  <span style={{ fontWeight: "700", fontSize: "14px", color: "#111", flex: 1 }}>{faq.q}</span>
                  <span style={{ fontSize: "18px", color: openFaq === i ? "#FEE12B" : "#aaa", flexShrink: 0, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 18px 16px", borderTop: "1px solid #f5f5f5" }}>
                    <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.75", margin: "12px 0 0" }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* BOTTOM CTA */}
        <div style={{ background: "#111", borderRadius: "14px", padding: isMobile ? "24px 20px" : "28px 32px", marginTop: "40px", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <p style={{ fontWeight: "900", fontSize: "17px", color: "white", margin: "0 0 5px" }}>Still need help?</p>
            <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>Our team typically responds within a few hours on working days.</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
              style={{ padding: "11px 18px", background: "#25D366", color: "white", textDecoration: "none", fontWeight: "800", borderRadius: "8px", fontSize: "13px", whiteSpace: "nowrap" }}>
              💬 WhatsApp
            </a>
            <a href="mailto:admin@routerkart.in"
              style={{ padding: "11px 18px", background: "#FEE12B", color: "#111", textDecoration: "none", fontWeight: "800", borderRadius: "8px", fontSize: "13px", whiteSpace: "nowrap" }}>
              📧 Email Us
            </a>
          </div>
        </div>

        {/* POLICY LINKS */}
        <div style={{ marginTop: "32px", padding: "20px", background: "white", borderRadius: "10px", border: "1px solid #eee" }}>
          <p style={{ fontWeight: "800", fontSize: "13px", color: "#111", margin: "0 0 12px" }}>Quick Links</p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[
              { label: "Privacy Policy", to: "/privacy" },
              { label: "Terms & Conditions", to: "/terms" },
              { label: "Refund Policy", to: "/terms#refund-policy" },
              { label: "Cancellation Policy", to: "/terms#cancellation-policy" },
              { label: "About RouterKart", to: "/about" },
            ].map((l, i) => (
              <Link key={i} to={l.to} style={{ fontSize: "13px", fontWeight: "700", color: "#555", textDecoration: "none", padding: "6px 14px", background: "#F7F7F5", borderRadius: "20px", border: "1px solid #eee" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "24px" }}>
          <Link to="/" style={{ display: "inline-block", padding: "12px 24px", background: "#FEE12B", color: "#111", textDecoration: "none", fontWeight: "800", borderRadius: "8px", fontSize: "14px" }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default Support;