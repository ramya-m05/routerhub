import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/useIsMobile";

const CATEGORIES = [
  { name: "Router", icon: "📡", desc: "WiFi 6, mesh & more", bg: "#FFF9E6", border: "#FEE12B" },
  { name: "Fiber Cable", icon: "🔌", desc: "Single & multimode", bg: "#EFF6FF", border: "#93C5FD" },
  { name: "Fiber Tools", icon: "🔧", desc: "Splicers & testers", bg: "#F0FDF4", border: "#86EFAC" },
  { name: "Security", icon: "🔒", desc: "Cameras & NVRs", bg: "#FEF2F2", border: "#FCA5A5" },
  { name: "Streaming Device", icon: "📺", desc: "Boxes & dongles", bg: "#F5F3FF", border: "#C4B5FD" },
];

function CategoryGrid() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(200px, 1fr))",
      gap: isMobile ? "10px" : "14px",
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {CATEGORIES.map((cat) => (
        <div
          key={cat.name}
          onClick={() => navigate(`/store?category=${cat.name}`)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "10px" : "14px",
            padding: isMobile ? "13px 14px" : "16px 18px",
            borderRadius: "12px",
            border: `2px solid ${cat.border}`,
            background: cat.bg,
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; }}
        >
          <span style={{ fontSize: isMobile ? "22px" : "26px", flexShrink: 0 }}>{cat.icon}</span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: "800", fontSize: isMobile ? "12px" : "14px", color: "#111", margin: "0 0 2px", letterSpacing: "-0.2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {cat.name}
            </p>
            <p style={{ fontSize: "10px", color: "#888", margin: 0, fontWeight: "500" }}>{cat.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CategoryGrid;