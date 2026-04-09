import { Link } from "react-router-dom";
import { useIsMobile } from "../hooks/useIsMobile";

const LAST_UPDATED = "April 2026";

function TermsAndConditions() {
  const isMobile = useIsMobile();

  return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

      <div style={{ background: "#111", padding: isMobile ? "24px 20px 20px" : "44px 40px 32px", borderBottom: "4px solid #FEE12B" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <Link to="/" style={{ color: "#FEE12B", textDecoration: "none", fontSize: "13px", fontWeight: "700" }}>← RouterKart</Link>
          <h1 style={{ color: "white", fontSize: isMobile ? "28px" : "clamp(28px,5vw,48px)", fontWeight: "900", letterSpacing: "-1.5px", margin: "12px 0 6px" }}>Terms & Conditions</h1>
          <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: isMobile ? "28px 20px 60px" : "48px 40px 80px" }}>

        <InfoBox>
          Please read these Terms & Conditions carefully before using RouterKart. By accessing or placing an order on routerkart.in, you agree to be bound by these terms.
        </InfoBox>

        {/* Quick nav */}
        <div style={{ background: "white", borderRadius: "12px", padding: "18px 20px", marginBottom: "32px", border: "1px solid #eee" }}>
          <p style={{ fontSize: "11px", fontWeight: "800", color: "#aaa", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 12px" }}>On This Page</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {["Terms & Conditions", "Refund Policy", "Cancellation Policy", "Shipping Policy"].map((s, i) => (
              <a key={i} href={`#${s.toLowerCase().replace(/[\s&]+/g, "-")}`}
                style={{ fontSize: "13px", fontWeight: "700", color: "#111", textDecoration: "none", padding: "5px 12px", background: "#F7F7F5", borderRadius: "20px", border: "1px solid #eee" }}>
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* ── TERMS & CONDITIONS ── */}
        <div id="terms-conditions">
          <PolicyHeader label="Section 1" title="Terms & Conditions" emoji="🧾" />

          <Section title="Acceptance of Terms">
            <p>By accessing and using routerkart.in ("Website"), you accept and agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use our website.</p>
            <p>RouterKart reserves the right to modify these terms at any time. Continued use of the website after any changes constitutes your acceptance of the new terms.</p>
          </Section>

          <Section title="Use of the Website">
            <ul>
              <li>You must be at least 18 years of age to place an order on RouterKart, or be using the website under the supervision of a parent or guardian.</li>
              <li>You agree to provide accurate, current, and complete information during registration and checkout.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials. RouterKart is not liable for any loss resulting from unauthorised use of your account.</li>
              <li>You agree not to use the website for any unlawful purpose or in any way that could damage, disable, or impair the website.</li>
              <li>RouterKart reserves the right to suspend or terminate your account if we detect fraudulent activity or a violation of these terms.</li>
            </ul>
          </Section>

          <Section title="Products & Pricing">
            <ul>
              <li>All products listed on RouterKart are subject to availability. We do not guarantee that any product will remain in stock.</li>
              <li>Prices displayed on the website are in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.</li>
              <li>Prices may change without prior notice due to market conditions, supplier pricing, or promotional offers.</li>
              <li>Product images are for illustrative purposes. The actual product may vary slightly in appearance.</li>
              <li>RouterKart makes every effort to ensure accurate product descriptions. However, we do not warrant that descriptions or any other content on the website is error-free.</li>
            </ul>
          </Section>

          <Section title="Orders & Payments">
            <ul>
              <li>An order is confirmed only after successful payment processing and a confirmation email is sent to you.</li>
              <li>RouterKart reserves the right to cancel any order due to pricing errors, stock unavailability, fraud prevention, or any other unforeseen circumstance.</li>
              <li>We accept payments via UPI, credit/debit cards, net banking, and Cash on Delivery (COD), processed securely through Razorpay.</li>
              <li>For COD orders, a nominal advance payment of ₹150 is required to confirm the order. The remaining balance is paid at the time of delivery.</li>
              <li>In the event of a failed payment, your order will not be processed. Please retry or contact support.</li>
            </ul>
          </Section>

          <Section title="Intellectual Property">
            <p>All content on RouterKart — including text, graphics, logos, product images, and software — is the property of RouterKart or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without express written permission.</p>
          </Section>

          <Section title="Limitation of Liability">
            <p>RouterKart shall not be liable for any indirect, incidental, or consequential damages arising from:</p>
            <ul>
              <li>The use or inability to use the website or its products</li>
              <li>Delays or failures in delivery caused by courier partners or force majeure events</li>
              <li>Any errors or omissions in product descriptions or prices</li>
              <li>Unauthorised access to your account caused by your failure to secure your credentials</li>
            </ul>
            <p>Our total liability in any case shall not exceed the amount paid by you for the specific order in question.</p>
          </Section>

          <Section title="Governing Law">
            <p>These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising from the use of this website shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.</p>
          </Section>
        </div>

        <Divider />

        {/* ── REFUND POLICY ── */}
        <div id="refund-policy">
          <PolicyHeader label="Section 2" title="Refund Policy" emoji="💰" />

          <Section title="Eligibility for Refunds">
            <p>RouterKart accepts refund requests in the following cases:</p>
            <ul>
              <li>The product received is defective, damaged, or not working</li>
              <li>The wrong product was delivered (different from what was ordered)</li>
              <li>The product is missing parts or accessories listed in the description</li>
            </ul>
            <p>Refunds are <strong>not applicable</strong> for:</p>
            <ul>
              <li>Products that have been used, opened, or physically damaged by the customer</li>
              <li>Change of mind after delivery</li>
              <li>Items marked as non-returnable on the product page</li>
              <li>Products with tampered or missing serial numbers or warranty seals</li>
            </ul>
          </Section>

          <Section title="How to Raise a Refund Request">
            <ol>
              <li style={{ marginBottom: "8px" }}>Email us at <a href="mailto:admin@routerkart.in" style={{ color: "#111", fontWeight: "700" }}>admin@routerkart.in</a> within <strong>3 days of delivery</strong>.</li>
              <li style={{ marginBottom: "8px" }}>Include your Order ID, a description of the issue, and clear photographs of the product.</li>
              <li style={{ marginBottom: "8px" }}>Our team will review your request within 48 business hours.</li>
              <li>If approved, a return pickup will be arranged or you will be asked to self-ship the product.</li>
            </ol>
          </Section>

          <Section title="Refund Timeline">
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "12px", marginTop: "4px" }}>
              {[
                { step: "1", label: "Request raised", time: "Within 3 days of delivery" },
                { step: "2", label: "Review & approval", time: "1–2 business days" },
                { step: "3", label: "Refund processed", time: "5–7 business days" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#F7F7F5", borderRadius: "10px", padding: "14px 16px", border: "1px solid #eee" }}>
                  <p style={{ fontSize: "10px", fontWeight: "800", color: "#FEE12B", margin: "0 0 5px", letterSpacing: "0.5px" }}>STEP {s.step}</p>
                  <p style={{ fontWeight: "800", fontSize: "13px", color: "#111", margin: "0 0 3px" }}>{s.label}</p>
                  <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>{s.time}</p>
                </div>
              ))}
            </div>
            <p style={{ marginTop: "14px" }}>Refunds are credited to the original payment method (UPI, card, or bank account). Shipping charges are <strong>non-refundable</strong> unless the return is due to our error.</p>
          </Section>
        </div>

        <Divider />

        {/* ── CANCELLATION POLICY ── */}
        <div id="cancellation-policy">
          <PolicyHeader label="Section 3" title="Cancellation Policy" emoji="❌" />

          <Section title="Order Cancellation by Customer">
            <ul>
              <li>You may cancel your order <strong>before it is shipped</strong> by contacting us at <a href="mailto:admin@routerkart.in" style={{ color: "#111", fontWeight: "700" }}>admin@routerkart.in</a> or via WhatsApp.</li>
              <li>Once the order has been picked up by the courier, cancellation is <strong>not possible</strong>. You may initiate a return after delivery instead.</li>
              <li>For COD orders, the ₹150 advance amount will be refunded to your bank account or UPI within 5–7 business days if the order is cancelled before dispatch.</li>
            </ul>
          </Section>

          <Section title="Cancellation by RouterKart">
            <p>RouterKart reserves the right to cancel an order in the following situations:</p>
            <ul>
              <li>Product is out of stock or discontinued after order placement</li>
              <li>Payment verification failed or suspicious transaction detected</li>
              <li>Incorrect pricing due to a website error</li>
              <li>Delivery not feasible to the provided address</li>
            </ul>
            <p>In all such cases, you will be notified via email and a full refund will be processed within 5–7 business days.</p>
          </Section>

          <Section title="Refund for Cancelled Orders">
            <p>Refunds for cancelled orders are processed to the original payment method. Bank transfer refunds may take an additional 2–3 business days depending on your bank's processing time.</p>
          </Section>
        </div>

        <Divider />

        {/* ── SHIPPING POLICY ── */}
        <div id="shipping-policy">
          <PolicyHeader label="Section 4" title="Shipping Policy" emoji="🚚" />

          <Section title="Shipping Coverage & Timelines">
            <ul>
              <li>RouterKart ships across India through trusted courier partners.</li>
              <li>Standard delivery takes <strong>3–7 working days</strong> depending on your location. Delivery estimates are shown on each product page.</li>
              <li>Remote or rural areas may take additional time.</li>
              <li>Orders placed before 5:00 PM on a working day are typically dispatched the same day or the next morning.</li>
            </ul>
          </Section>

          <Section title="Shipping Charges">
            <ul>
              <li>Free shipping on all orders above ₹999.</li>
              <li>A flat delivery charge of ₹49 applies to orders below ₹999.</li>
              <li>Shipping charges are non-refundable.</li>
            </ul>
          </Section>

          <Section title="Tracking Your Order">
            <p>Once your order is dispatched, you will receive a tracking number via email. You can use this to track your shipment on the courier's website or through your <Link to="/orders" style={{ color: "#111", fontWeight: "700" }}>My Orders</Link> page on RouterKart.</p>
          </Section>

          <Section title="Delivery Failures">
            <p>If a delivery attempt fails (e.g., no one available to receive), the courier will typically make 2–3 attempts. If delivery fails after all attempts, the package will be returned to us. In such cases, please contact us to arrange redelivery.</p>
            <p>RouterKart is not responsible for delays caused by courier partners, natural disasters, strikes, or other force majeure events.</p>
          </Section>
        </div>

        <Section title="Contact Us">
          <p>For any questions regarding these policies:</p>
          <p>📧 <a href="mailto:admin@routerkart.in" style={{ color: "#111", fontWeight: "700" }}>admin@routerkart.in</a></p>
          <p>🌐 <a href="https://routerkart.in" style={{ color: "#111", fontWeight: "700" }}>routerkart.in</a></p>
          <p>📍 Bengaluru, Karnataka, India</p>
        </Section>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
          <Link to="/" style={{ display: "inline-block", padding: "12px 24px", background: "#FEE12B", color: "#111", textDecoration: "none", fontWeight: "800", borderRadius: "8px", fontSize: "14px" }}>← Back to Home</Link>
          <Link to="/privacy" style={{ display: "inline-block", padding: "12px 24px", background: "#111", color: "white", textDecoration: "none", fontWeight: "800", borderRadius: "8px", fontSize: "14px" }}>Privacy Policy →</Link>
        </div>
      </div>
    </div>
  );
}

function PolicyHeader({ label, title, emoji }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#111", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px" }}>
      <span style={{ fontSize: "28px" }}>{emoji}</span>
      <div>
        <p style={{ fontSize: "10px", fontWeight: "700", color: "#FEE12B", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 2px" }}>{label}</p>
        <h2 style={{ color: "white", fontWeight: "900", fontSize: "20px", margin: 0, letterSpacing: "-0.3px" }}>{title}</h2>
      </div>
    </div>
  );
}
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#111", margin: "0 0 10px", paddingBottom: "7px", borderBottom: "2px solid #FEE12B", display: "inline-block" }}>{title}</h3>
      <div style={{ fontSize: "14px", color: "#555", lineHeight: "1.85" }}>{children}</div>
    </div>
  );
}
function InfoBox({ children }) {
  return (
    <div style={{ background: "#FFF9E6", border: "2px solid #FEE12B", borderRadius: "10px", padding: "14px 18px", marginBottom: "28px", fontSize: "13px", color: "#555", fontWeight: "600", lineHeight: 1.6 }}>
      ℹ️ {children}
    </div>
  );
}
function Divider() {
  return <div style={{ height: "2px", background: "#f0f0f0", margin: "36px 0" }} />;
}

export default TermsAndConditions;