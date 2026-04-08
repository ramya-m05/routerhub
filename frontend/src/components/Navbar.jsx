import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { useIsMobile } from "../hooks/useIsMobile";

function Navbar({ products = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const isMobile = useIsMobile();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [recent, setRecent] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setRecent(JSON.parse(localStorage.getItem("recentSearch")) || []);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setShowMobileSearch(false);
  }, [location]);

  const suggestions = debouncedSearch.length > 0
    ? products.filter(p => p.name?.toLowerCase().includes(debouncedSearch.toLowerCase())).slice(0, 6)
    : [];

  const showSearchDrop = showDropdown && (suggestions.length > 0 || (search.length === 0 && recent.length > 0));

  const handleSelect = (text, id) => {
    const updated = [text, ...recent.filter(r => r !== text)].slice(0, 5);
    localStorage.setItem("recentSearch", JSON.stringify(updated));
    setRecent(updated);
    setSearch("");
    setShowDropdown(false);
    setShowMobileSearch(false);
    navigate(`/product/${id}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    setShowProfile(false);
    setShowMobileMenu(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const navLinks = [
    { path: "/store", label: "Store" },
    { path: "/orders", label: "Orders" },
    ...(role === "admin" ? [{ path: "/admin", label: "Admin" }] : []),
  ];

  return (
    <>
      <nav style={{ ...s.nav, boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.1)" : "0 1px 0 #eee" }}>
        <div style={{ ...s.inner, padding: isMobile ? "0 16px" : "0 32px" }}>

          {/* LOGO */}
          <Link to="/" style={s.logo}>
            <img
              src="/images/ROUTERKART_logo2.png"
              alt="RouterKart"
              style={{ height: isMobile ? "46px" : "54px", width: "auto", objectFit: "contain" }}
            />
          </Link>

          {/* DESKTOP NAV */}
          {!isMobile && (
            <div style={s.navLinks}>
              {navLinks.map(l => (
                <Link key={l.path} to={l.path} style={{
                  ...s.navLink,
                  color: isActive(l.path) ? "#FEE12B" : "#aaa",
                  borderBottom: isActive(l.path) ? "2px solid #FEE12B" : "2px solid transparent"
                }}>{l.label}</Link>
              ))}
            </div>
          )}

          {/* DESKTOP SEARCH */}
          {!isMobile && (
            <div style={s.searchWrap}>
              <div style={s.searchBox}>
                <span style={{ fontSize: "14px", flexShrink: 0 }}>🔍</span>
                <input
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  style={s.searchInput}
                />
                {search && <button onClick={() => { setSearch(""); setDebouncedSearch(""); }} style={s.clearBtn}>×</button>}
              </div>
              {showSearchDrop && <SearchDrop suggestions={suggestions} recent={recent} search={search} setSearch={setSearch} onSelect={handleSelect} />}
            </div>
          )}

          {/* RIGHT ACTIONS */}
          <div style={s.actions}>
            {isMobile && (
              <button onClick={() => setShowMobileSearch(v => !v)} style={s.iconAction}>🔍</button>
            )}
            <Link to="/wishlist" style={s.iconBtn}>
              <span style={{ fontSize: "18px" }}>❤️</span>
              {wishlist.length > 0 && <span style={s.badge}>{wishlist.length}</span>}
            </Link>
            <Link to="/cart" style={s.iconBtn}>
              <span style={{ fontSize: "18px" }}>🛒</span>
              {cartCount > 0 && <span style={s.badge}>{cartCount}</span>}
            </Link>

            {/* DESKTOP PROFILE */}
            {!isMobile && token && (
              <div ref={profileRef} style={{ position: "relative" }}>
                <button onClick={() => setShowProfile(v => !v)} style={s.profileBtn}>
                  <div style={s.profileAvatar}>{(localStorage.getItem("userName") || "U")[0].toUpperCase()}</div>
                  <span style={{ fontSize: "8px", color: "#aaa" }}>{showProfile ? "▲" : "▼"}</span>
                </button>
                {showProfile && (
                  <div style={s.profileMenu}>
                    <div style={s.menuDivider} />
                    {[
                      { icon: "👤", label: "My Profile", path: "/profile" },
                      { icon: "📦", label: "My Orders", path: "/orders" },
                      { icon: "❤️", label: "Wishlist", path: "/wishlist" },
                      { icon: "🛒", label: "Cart", path: "/cart" },
                    ].map(item => (
                      <Link key={item.path} to={item.path} onClick={() => setShowProfile(false)} style={s.menuItem}>
                        <span>{item.icon}</span><span>{item.label}</span>
                      </Link>
                    ))}
                    {role === "admin" && (
                      <Link to="/admin" onClick={() => setShowProfile(false)} style={{ ...s.menuItem, color: "#a855f7" }}>
                        <span>⚙️</span><span>Admin Dashboard</span>
                      </Link>
                    )}
                    <div style={s.menuDivider} />
                    <button onClick={handleLogout} style={s.menuLogout}>
                      <span>🚪</span><span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            {!isMobile && !token && (
              <Link to="/login" style={s.loginBtn}>Sign In</Link>
            )}

            {/* HAMBURGER */}
            {isMobile && (
              <button onClick={() => setShowMobileMenu(v => !v)} style={s.hamburger}>
                <span style={{ fontSize: "20px" }}>{showMobileMenu ? "✕" : "☰"}</span>
              </button>
            )}
          </div>
        </div>

        {/* MOBILE SEARCH BAR */}
        {isMobile && showMobileSearch && (
          <div style={{ padding: "8px 16px 12px", borderTop: "1px solid #222", position: "relative", background: "#111" }}>
            <div style={s.searchBox}>
              <span style={{ fontSize: "14px" }}>🔍</span>
              <input
                autoFocus
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                style={s.searchInput}
              />
              {search && <button onClick={() => { setSearch(""); setDebouncedSearch(""); }} style={s.clearBtn}>×</button>}
            </div>
            {showSearchDrop && <SearchDrop suggestions={suggestions} recent={recent} search={search} setSearch={setSearch} onSelect={handleSelect} />}
          </div>
        )}
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {isMobile && showMobileMenu && (
        <div style={s.mobileOverlay}>
          {token && (
            <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px" }}>
              <div style={{ ...s.profileAvatar, width: "44px", height: "44px", fontSize: "18px" }}>
                {(localStorage.getItem("") || "U")[0].toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: "800", fontSize: "15px", color: "#111", margin: 0 }}>
                  {localStorage.getItem("userName") || "My Account"}
                </p>
                <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>
                  {role === "admin" ? "⚡ Admin" : "Customer"}
                </p>
              </div>
            </div>
          )}
          <div style={s.menuDivider} />
          {[
            { icon: "🏠", label: "Home", path: "/" },
            { icon: "🛍️", label: "Store", path: "/store" },
            { icon: "📦", label: "My Orders", path: "/orders" },
            { icon: "❤️", label: "Wishlist", path: "/wishlist" },
            { icon: "🛒", label: "Cart", path: "/cart", badge: cartCount },
            { icon: "👤", label: "Profile", path: "/profile" },
            ...(role === "admin" ? [{ icon: "⚙️", label: "Admin Dashboard", path: "/admin" }] : []),
          ].map(item => (
            <Link key={item.path} to={item.path} onClick={() => setShowMobileMenu(false)}
              style={{
                ...s.mobileLink,
                background: isActive(item.path) ? "#FFFDF0" : "transparent",
                borderLeft: isActive(item.path) ? "3px solid #FEE12B" : "3px solid transparent"
              }}>
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{ background: "#FEE12B", color: "#111", fontSize: "11px", fontWeight: "900", padding: "2px 8px", borderRadius: "10px" }}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
          <div style={s.menuDivider} />
          {!token ? (
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link to="/login" onClick={() => setShowMobileMenu(false)}
                style={{ display: "block", padding: "14px", background: "#FEE12B", color: "#111", textDecoration: "none", fontWeight: "800", borderRadius: "10px", textAlign: "center", fontSize: "15px" }}>
                Sign In
              </Link>
              <Link to="/signup" onClick={() => setShowMobileMenu(false)}
                style={{ display: "block", padding: "14px", border: "2px solid #111", color: "#111", textDecoration: "none", fontWeight: "800", borderRadius: "10px", textAlign: "center", fontSize: "15px" }}>
                Create Account
              </Link>
            </div>
          ) : (
            <button onClick={handleLogout} style={s.mobileLogout}>
              🚪 Logout
            </button>
          )}
        </div>
      )}
    </>
  );
}

function SearchDrop({ suggestions, recent, search, setSearch, onSelect }) {
  return (
    <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "white", borderRadius: "12px", boxShadow: "0 8px 40px rgba(0,0,0,0.15)", overflow: "hidden", zIndex: 300, border: "1px solid #efefef" }}>
      {search.length === 0 && recent.map((r, i) => (
        <div key={i} onMouseDown={() => setSearch(r)}
          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", cursor: "pointer", fontSize: "13px", color: "#555" }}>
          <span style={{ color: "#aaa" }}>🕐</span>{r}
        </div>
      ))}
      {suggestions.map(p => (
        <div key={p._id} onMouseDown={() => onSelect(p.name, p._id)}
          style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", cursor: "pointer" }}>
          <img src={p.image} alt={p.name} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: "700", fontSize: "13px", color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
            <p style={{ fontSize: "11px", color: "#aaa", margin: 0 }}>{p.category}</p>
          </div>
          <span style={{ fontWeight: "800", fontSize: "13px", flexShrink: 0 }}>₹{p.price?.toLocaleString()}</span>
        </div>
      ))}
      {search.length > 0 && suggestions.length === 0 && (
        <p style={{ padding: "16px", color: "#aaa", fontSize: "13px", textAlign: "center" }}>No results for "{search}"</p>
      )}
    </div>
  );
}

const s = {
  nav: { position: "sticky", top: 0, zIndex: 1000, background: "#111", transition: "box-shadow 0.2s" },
  inner: { display: "flex", alignItems: "center", gap: "12px", height: "68px", maxWidth: "1400px", margin: "0 auto" },
  logo: { display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 },
  navLinks: { display: "flex", gap: "4px", flexShrink: 0 },
  navLink: { fontSize: "13px", fontWeight: "700", textDecoration: "none", padding: "4px 12px", fontFamily: "'DM Sans', sans-serif", transition: "color 0.15s" },
  searchWrap: { position: "relative", flex: 1, maxWidth: "480px" },
  searchBox: { display: "flex", alignItems: "center", border: "2px solid #2a2a2a", borderRadius: "10px", padding: "0 14px", gap: "8px", background: "#1a1a1a" },
  searchInput: { flex: 1, border: "none", background: "transparent", padding: "10px 0", fontSize: "13px", color: "white", outline: "none", fontFamily: "'DM Sans', sans-serif" },
  clearBtn: { background: "none", border: "none", fontSize: "18px", color: "#666", cursor: "pointer", padding: 0 },
  actions: { display: "flex", alignItems: "center", gap: "2px", marginLeft: "auto", flexShrink: 0 },
  iconAction: { width: "40px", height: "40px", background: "none", border: "none", fontSize: "18px", cursor: "pointer", borderRadius: "8px" },
  iconBtn: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "8px", textDecoration: "none" },
  badge: { position: "absolute", top: "4px", right: "4px", width: "16px", height: "16px", background: "#FEE12B", color: "#111", fontSize: "9px", fontWeight: "900", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  profileBtn: { display: "flex", alignItems: "center", gap: "6px", background: "none", border: "2px solid #2a2a2a", borderRadius: "10px", padding: "6px 10px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  profileAvatar: { width: "28px", height: "28px", background: "#FEE12B", color: "#111", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "13px" },
  profileMenu: { position: "absolute", top: "calc(100% + 10px)", right: 0, width: "220px", background: "white", borderRadius: "14px", boxShadow: "0 8px 40px rgba(0,0,0,0.4)", border: "1px solid #efefef", overflow: "hidden", zIndex: 200 },
  menuDivider: { height: "1px", background: "#f0f0f0" },
  menuItem: { display: "flex", alignItems: "center", gap: "10px", padding: "11px 18px", textDecoration: "none", color: "#444", fontSize: "13px", fontWeight: "600", fontFamily: "'DM Sans', sans-serif" },
  menuLogout: { display: "flex", alignItems: "center", gap: "10px", padding: "11px 18px", background: "transparent", border: "none", color: "#cc4444", fontSize: "13px", fontWeight: "700", cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "'DM Sans', sans-serif" },
  loginBtn: { padding: "9px 18px", background: "#FEE12B", color: "#111", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "13px", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" },
  hamburger: { width: "40px", height: "40px", background: "none", border: "none", cursor: "pointer", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" },
  mobileOverlay: { position: "fixed", top: "68px", left: 0, right: 0, bottom: 0, background: "white", zIndex: 999, overflowY: "auto" },
  mobileLink: { display: "flex", alignItems: "center", gap: "14px", padding: "15px 20px", textDecoration: "none", color: "#333", fontSize: "15px", fontWeight: "600", fontFamily: "'DM Sans', sans-serif" },
  mobileLogout: { display: "flex", alignItems: "center", gap: "12px", padding: "15px 20px", background: "none", border: "none", color: "#cc4444", fontSize: "15px", fontWeight: "700", cursor: "pointer", width: "100%", fontFamily: "'DM Sans', sans-serif" }
};

export default Navbar;