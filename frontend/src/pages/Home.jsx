import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import ProductCarousel from "../components/ProductCarousel";
import HeroSlider from "../components/HeroSlider";
import CategoryGrid from "../components/CategoryGrid";
import { useIsMobile } from "../hooks/useIsMobile";

function Home() {
  const [products, setProducts] = useState([]);
  const isMobile = useIsMobile();

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.log(err); }
  };

  const p = isMobile ? "12px 16px" : "20px 40px";
  const gap = isMobile ? "28px" : "0";

  return (
    <div style={{ background: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar products={products} />

      <HeroSlider />

      {/* TRUST BAR */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
        background: "#FEE12B",
        margin: isMobile ? "0" : "0",
        borderBottom: "1px solid rgba(0,0,0,0.08)"
      }}>
        {[
          { icon: "🚚", label: "Free Delivery", sub: "Orders ₹499+" },
          { icon: "🔒", label: "Secure Pay", sub: "100% encrypted" },
          { icon: "💯", label: "Genuine", sub: "Brand verified" },
          { icon: "⚡", label: "Fast Support", sub: "24/7 help" }
        ].map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: isMobile ? "12px 14px" : "18px 24px",
            borderRight: "1px solid rgba(0,0,0,0.08)"
          }}>
            <span style={{ fontSize: isMobile ? "18px" : "22px" }}>{item.icon}</span>
            <div>
              <p style={{ fontWeight: "800", fontSize: isMobile ? "11px" : "13px", color: "#111", margin: 0 }}>{item.label}</p>
              <p style={{ fontWeight: "500", fontSize: "10px", color: "#555", margin: "1px 0 0" }}>{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CATEGORIES */}
      <div style={{ padding: isMobile ? "24px 16px 8px" : "44px 40px 12px" }}>
        <p style={labelStyle}>Shop by</p>
        <h2 style={titleStyle(isMobile)}>Categories</h2>
      </div>
      <div style={{ padding: isMobile ? "0 16px" : "0 40px 10px" }}>
        <CategoryGrid />
      </div>

      {/* DEAL BANNER */}
      <div style={{
        margin: isMobile ? "20px 16px" : "20px 40px",
        padding: isMobile ? "24px 20px" : "40px 48px",
        background: "#111",
        borderRadius: isMobile ? "14px" : "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        overflow: "hidden",
        position: "relative"
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <span style={{ display: "inline-block", background: "#FEE12B", color: "#111", fontSize: "9px", fontWeight: "800", letterSpacing: "2px", textTransform: "uppercase", padding: "4px 10px", borderRadius: "3px", marginBottom: "12px" }}>
            Limited Time
          </span>
          <h2 style={{ fontSize: isMobile ? "clamp(22px, 5vw, 32px)" : "clamp(28px, 4vw, 48px)", fontWeight: "900", color: "white", margin: "0 0 8px", letterSpacing: "-1px", lineHeight: 1 }}>
            Special Offer
          </h2>
          <p style={{ color: "#999", fontSize: isMobile ? "13px" : "15px", margin: 0, fontWeight: "500" }}>
            Buy 10 routers <strong style={{ color: "#FEE12B" }}>Get 1 router free</strong>
          </p>
        </div>
        <div style={{ fontSize: isMobile ? "48px" : "80px", opacity: 0.15 }}>🔥</div>
      </div>

      {/* CAROUSELS */}
      {[
        { tag: "Popular now", title: "Trending Products" },
        { tag: "Save more", title: "Best Deals" },
        { tag: "Picked for you", title: "Recommended" },
      ].map((section) => (
        <div key={section.title}>
          <div style={{ padding: isMobile ? "20px 16px 8px" : "44px 40px 12px" }}>
            <p style={labelStyle}>{section.tag}</p>
            <h2 style={titleStyle(isMobile)}>{section.title}</h2>
          </div>
          <ProductCarousel products={products} />
        </div>
      ))}

      {/* FOOTER */}
      <footer style={{ marginTop: "40px", padding: isMobile ? "28px 20px" : "40px", background: "#111" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          flexDirection: isMobile ? "column" : "row",
          gap: "20px",
          maxWidth: "1280px",
          margin: "0 auto"
        }}>
          <div>
            <h3 style={{ fontSize: "22px", fontWeight: "900", color: "white", letterSpacing: "-0.5px", margin: "0 0 4px" }}>
              Router<span style={{ color: "#FEE12B" }}>Kart</span>
            </h3>
            <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>India's trusted source for networking gear</p>
          </div>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {["About", "Privacy", "Terms", "Support"].map(link => (
              <a key={link} href="#" style={{ color: "#666", textDecoration: "none", fontSize: "13px", fontWeight: "500" }}>{link}</a>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid #222", marginTop: "24px", paddingTop: "16px", textAlign: "center", maxWidth: "1280px", margin: "24px auto 0" }}>
          <p style={{ color: "#444", fontSize: "12px", margin: 0 }}>© 2026 RouterKart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const labelStyle = { fontSize: "10px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#aaa", margin: "0 0 4px" };
const titleStyle = (isMobile) => ({ fontSize: isMobile ? "22px" : "clamp(22px, 3vw, 32px)", fontWeight: "900", color: "#111", margin: 0, letterSpacing: "-0.8px", lineHeight: 1.1 });

export default Home;