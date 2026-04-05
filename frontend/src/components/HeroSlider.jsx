import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/useIsMobile";

const slides = [
  { tag: "Limited Time Deal", title: "Buy More,\nSave More", subtitle: "Up to ₹1000 OFF on selected routers", cta: "Shop Now", link: "/store?category=Router", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" },
  { tag: "New Arrivals", title: "Upgrade Your\nNetwork", subtitle: "Latest routers & fiber tools in stock", cta: "Explore", link: "/store", image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80" },
  { tag: "Security", title: "Protect What\nMatters", subtitle: "IP cameras, NVRs & complete security kits", cta: "View Security", link: "/store?category=Security", image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&q=80" },
];

function HeroSlider() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = (i) => {
    if (animating || i === index) return;
    setAnimating(true);
    setIndex(i);
    setTimeout(() => setAnimating(false), 300);
  };

  useEffect(() => {
    const t = setInterval(() => goTo((index + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [index]);

  const s = slides[index];

  return (
    <div style={{ padding: isMobile ? "12px 16px" : "20px 40px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{
        height: isMobile ? "260px" : "380px",
        borderRadius: isMobile ? "14px" : "20px",
        background: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "24px 24px" : "0 60px",
        overflow: "hidden",
        position: "relative",
        opacity: animating ? 0.85 : 1,
        transition: "opacity 0.3s ease"
      }}>
        {/* TEXTURE */}
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(-55deg,transparent,transparent 15px,rgba(255,255,255,0.02) 15px,rgba(255,255,255,0.02) 30px)" }} />

        {/* CONTENT */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: isMobile ? "100%" : "420px" }}>
          <span style={{ display: "inline-block", background: "#FEE12B", color: "#111", fontSize: "10px", fontWeight: "800", letterSpacing: "2px", textTransform: "uppercase", padding: "4px 10px", borderRadius: "4px", marginBottom: isMobile ? "12px" : "20px" }}>
            {s.tag}
          </span>
          <h1 style={{ fontSize: isMobile ? "clamp(22px, 6vw, 32px)" : "clamp(36px, 5vw, 56px)", fontWeight: "900", color: "white", margin: "0 0 10px", lineHeight: 1.1, letterSpacing: "-1px" }}>
            {s.title.split("\n").map((line, i) => <span key={i}>{line}<br /></span>)}
          </h1>
          <p style={{ color: "#777", fontSize: isMobile ? "12px" : "15px", margin: "0 0 20px", fontWeight: "500", lineHeight: 1.5 }}>
            {s.subtitle}
          </p>
          <button
            onClick={() => navigate(s.link)}
            style={{ padding: isMobile ? "11px 20px" : "14px 28px", background: "#FEE12B", color: "#111", border: "none", borderRadius: "10px", fontWeight: "800", fontSize: isMobile ? "13px" : "15px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
          >
            {s.cta} →
          </button>
        </div>

        {/* IMAGE — hide on very small screens */}
        {!isMobile && (
          <div style={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: "-20px", background: "radial-gradient(circle, rgba(254,225,43,0.15) 0%, transparent 70%)" }} />
            <img src={s.image} alt={s.title} style={{ width: "280px", height: "240px", objectFit: "cover", borderRadius: "14px", position: "relative", zIndex: 1, opacity: 0.9 }} />
          </div>
        )}

        {/* SLIDE NUMBER */}
        <div style={{ position: "absolute", bottom: "16px", right: "20px", fontSize: "12px", fontWeight: "700", fontFamily: "monospace" }}>
          <span style={{ color: "#FEE12B" }}>{String(index + 1).padStart(2, "0")}</span>
          <span style={{ color: "#444", margin: "0 4px" }}>/</span>
          <span style={{ color: "#444" }}>{String(slides.length).padStart(2, "0")}</span>
        </div>
      </div>

      {/* DOTS */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginTop: "12px" }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{ height: "8px", width: i === index ? "28px" : "8px", borderRadius: "4px", border: "none", cursor: "pointer", padding: 0, background: i === index ? "#111" : "#ddd", transition: "all 0.3s ease" }} />
        ))}
      </div>
    </div>
  );
}

export default HeroSlider;