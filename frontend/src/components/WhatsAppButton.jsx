// WhatsAppButton.jsx
// Drop this anywhere inside your App (e.g. right before </CartProvider> in App.jsx)
// Set WHATSAPP_NUMBER to your business WhatsApp number with country code (no + or spaces)

const WHATSAPP_NUMBER = "8073919667"; // ← Replace with your actual number
const WHATSAPP_MESSAGE = "Hi RouterKart! I need help with a product.";

function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat with us on WhatsApp"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9000,
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background: "#25D366",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(37,211,102,0.45)",
        textDecoration: "none",
        transition: "transform 0.2s, box-shadow 0.2s",
        animation: "waPulse 2.5s ease-in-out infinite",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "scale(1.12)";
        e.currentTarget.style.boxShadow = "0 6px 28px rgba(37,211,102,0.65)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,211,102,0.45)";
      }}
    >
      {/* WhatsApp SVG icon */}
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
        <path
          d="M16 2C8.268 2 2 8.268 2 16c0 2.417.638 4.683 1.752 6.645L2 30l7.573-1.727A13.934 13.934 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z"
          fill="#25D366"
        />
        <path
          d="M16 3.5C9.096 3.5 3.5 9.096 3.5 16c0 2.29.6 4.44 1.65 6.3L3.5 28.5l6.35-1.63A12.44 12.44 0 0016 28.5c6.904 0 12.5-5.596 12.5-12.5S22.904 3.5 16 3.5z"
          fill="white"
        />
        <path
          d="M22.5 19.45c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.19-.57-.34z"
          fill="#25D366"
        />
      </svg>

      <style>{`
        @keyframes waPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(37,211,102,0.45); }
          50% { box-shadow: 0 4px 32px rgba(37,211,102,0.75), 0 0 0 8px rgba(37,211,102,0.12); }
        }
      `}</style>
    </a>
  );
}

export default WhatsAppButton;