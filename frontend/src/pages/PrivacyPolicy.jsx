import { Link } from "react-router-dom";
import { useIsMobile } from "../hooks/useIsMobile";

const LAST_UPDATED = "April 2026";
const CONTACT      = "admin@routerkart.in";

function PrivacyPolicy() {
  const isMobile = useIsMobile();

  return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

      <div style={{ background: "#111", padding: isMobile ? "24px 20px 20px" : "44px 40px 32px", borderBottom: "4px solid #FEE12B" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <Link to="/" style={{ color: "#FEE12B", textDecoration: "none", fontSize: "13px", fontWeight: "700" }}>← RouterKart</Link>
          <h1 style={{ color: "white", fontSize: isMobile ? "32px" : "clamp(32px,5vw,52px)", fontWeight: "900", letterSpacing: "-1.5px", margin: "12px 0 6px" }}>Privacy Policy</h1>
          <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: isMobile ? "28px 20px 60px" : "48px 40px 80px" }}>

        <InfoBox>
          By using routerkart.in you understand, agree and consent to this Privacy Policy. If you do not agree, please do not use our website.
        </InfoBox>

        <Section title="About RouterKart">
          <p>RouterKart is an online retail platform for networking equipment — routers, fiber cables, fiber tools, security systems, and streaming devices — operated from Bengaluru, Karnataka, India.</p>
          <p>You can contact us at <a href={`mailto:${CONTACT}`} style={{ color: "#111", fontWeight: "700" }}>{CONTACT}</a> for any privacy-related concerns.</p>
        </Section>

        <Section title="Information We Collect">
          <p>When you use RouterKart, we may collect the following types of information:</p>
          <SubHeading>Personal Information</SubHeading>
          <ul>
            <li>Full name and contact details (email address, phone number)</li>
            <li>Delivery address (door number, street, city, district, pincode)</li>
            <li>Order history and purchase details</li>
            <li>Payment information (processed securely via Razorpay — we do not store card details)</li>
            <li>Account credentials (email and password — passwords are encrypted)</li>
          </ul>
          <SubHeading>Non-Personal Information</SubHeading>
          <ul>
            <li>Browser type and version, operating system</li>
            <li>IP address and approximate geographic location</li>
            <li>Pages visited, time spent, and navigation paths on our website</li>
            <li>Device type and screen resolution</li>
          </ul>
        </Section>

        <Section title="How We Use Your Information">
          <p>We use the information we collect for the following purposes:</p>
          <ul>
            <li>Processing, fulfilling, and tracking your orders</li>
            <li>Sending order confirmation and delivery update emails</li>
            <li>Managing your account, saved addresses, and wishlist</li>
            <li>Sending OTPs for account verification and password reset</li>
            <li>Responding to customer support queries</li>
            <li>Sending promotional offers and newsletters (only with your consent — you can unsubscribe at any time)</li>
            <li>Preventing fraud, detecting security breaches, and maintaining platform integrity</li>
            <li>Complying with legal obligations and court orders</li>
            <li>Analysing user behaviour to improve website experience</li>
          </ul>
        </Section>

        <Section title="Cookies & Similar Technologies">
          <p>RouterKart uses cookies to enhance your browsing experience. Cookies are small text files stored on your device by your browser. We use cookies to:</p>
          <ul>
            <li>Keep you logged in across sessions</li>
            <li>Remember items in your cart and wishlist</li>
            <li>Analyse website traffic and user behaviour</li>
            <li>Improve the personalisation of product recommendations</li>
          </ul>
          <p>You can control or disable cookies through your browser settings. Note that disabling cookies may affect certain features of the website.</p>
        </Section>

        <Section title="Sharing Your Information">
          <p>RouterKart does <strong>not sell</strong> your personal data to third parties. We may share your information only in the following circumstances:</p>
          <SubHeading>Payment Processing</SubHeading>
          <p>Your name, email, phone, and order amount are shared with Razorpay (our payment gateway) solely for the purpose of processing your payment. Razorpay's privacy practices are governed by their own policy.</p>
          <SubHeading>Shipping & Delivery</SubHeading>
          <p>Your name, phone number, and delivery address are shared with our courier partners to fulfil your order.</p>
          <SubHeading>Legal Requirements</SubHeading>
          <p>We may disclose your information when required to comply with applicable laws, court orders, or government requests.</p>
          <SubHeading>SMS & WhatsApp Notifications</SubHeading>
          <p>Your phone number may be used to send order notifications via SMS or WhatsApp through authorised service providers (Twilio or similar). This is only used for transactional updates related to your order.</p>
        </Section>

        <Section title="Data Security">
          <p>We take the security of your personal information seriously and have implemented the following measures:</p>
          <ul>
            <li>All passwords are hashed using bcrypt — they are never stored in plain text</li>
            <li>All payment transactions are processed via Razorpay with SSL/TLS encryption</li>
            <li>Authentication tokens expire after 7 days</li>
            <li>Access to customer data is restricted to authorised personnel only</li>
            <li>Product images are stored securely via Cloudinary</li>
          </ul>
          <p>While we take all reasonable precautions, no system on the internet is 100% secure. We encourage you to never share your password with anyone.</p>
        </Section>

        <Section title="Data Retention">
          <p>Your personal information is retained for as long as your account is active or as required to fulfil the purposes described in this policy. If you wish to delete your account and associated data, please email us at <a href={`mailto:${CONTACT}`} style={{ color: "#111", fontWeight: "700" }}>{CONTACT}</a>.</p>
          <p>Order records may be retained for a longer period as required under applicable tax and commercial laws.</p>
        </Section>

        <Section title="Children's Privacy">
          <p>RouterKart is not intended for use by children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.</p>
        </Section>

        <Section title="Your Rights">
          <p>As a RouterKart user, you have the right to:</p>
          <ul>
            <li>Access and review the personal information we hold about you</li>
            <li>Update or correct your personal information via your Account &gt; Profile page</li>
            <li>Delete your account and personal data by contacting us</li>
            <li>Opt out of promotional emails by clicking the unsubscribe link in any email</li>
            <li>Withdraw consent for specific data uses (this may affect your ability to use certain services)</li>
          </ul>
        </Section>

        <Section title="Links to Third-Party Websites">
          <p>Our website may contain links to third-party websites. RouterKart is not responsible for the privacy practices or content of those websites. We encourage you to review their privacy policies before providing any personal information.</p>
        </Section>

        <Section title="Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. Material changes will be notified via email or a prominent notice on our homepage. Your continued use of RouterKart after any changes constitutes your acceptance of the updated policy.</p>
        </Section>

        <Section title="Contact Us">
          <p>If you have questions, concerns, or grievances about this Privacy Policy, please contact us:</p>
          <ContactCard />
        </Section>

        <BackToHome />
      </div>
    </div>
  );
}

/* ── shared sub-components ── */
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={{ fontSize: "19px", fontWeight: "900", color: "#111", margin: "0 0 12px", paddingBottom: "9px", borderBottom: "2px solid #FEE12B", display: "inline-block" }}>{title}</h2>
      <div style={{ fontSize: "14px", color: "#555", lineHeight: "1.85" }}>{children}</div>
    </div>
  );
}
function SubHeading({ children }) {
  return <p style={{ fontWeight: "800", color: "#111", fontSize: "14px", margin: "16px 0 6px" }}>{children}</p>;
}
function InfoBox({ children }) {
  return (
    <div style={{ background: "#FFF9E6", border: "2px solid #FEE12B", borderRadius: "10px", padding: "14px 18px", marginBottom: "28px", fontSize: "13px", color: "#555", fontWeight: "600", lineHeight: 1.6 }}>
      ℹ️ {children}
    </div>
  );
}
function ContactCard() {
  return (
    <div style={{ background: "#111", borderRadius: "10px", padding: "20px 24px", marginTop: "10px" }}>
      <p style={{ color: "white", fontWeight: "900", fontSize: "16px", margin: "0 0 10px" }}>Router<span style={{ color: "#FEE12B" }}>Kart</span></p>
      <p style={{ color: "#aaa", fontSize: "13px", margin: "0 0 4px" }}>📧 <a href="mailto:admin@routerkart.in" style={{ color: "#FEE12B", textDecoration: "none" }}>admin@routerkart.in</a></p>
      <p style={{ color: "#aaa", fontSize: "13px", margin: "0 0 4px" }}>🌐 <a href="https://routerkart.in" target="_blank" rel="noopener noreferrer" style={{ color: "#FEE12B", textDecoration: "none" }}>routerkart.in</a></p>
      <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>📍 Bengaluru, Karnataka, India</p>
    </div>
  );
}
function BackToHome() {
  return (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
      <Link to="/" style={{ display: "inline-block", padding: "12px 24px", background: "#FEE12B", color: "#111", textDecoration: "none", fontWeight: "800", borderRadius: "8px", fontSize: "14px" }}>← Back to Home</Link>
    </div>
  );
}

export default PrivacyPolicy;