// services/notificationService.js
// ─────────────────────────────────────────────────────
// Sends admin notifications via:
//   1. WhatsApp (Twilio WhatsApp Sandbox / WATI)
//   2. SMS     (Twilio SMS)
//
// npm install twilio
//
// .env variables needed:
//   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
//   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
//   TWILIO_PHONE=+14155238886          ← Twilio sandbox WhatsApp number
//   ADMIN_PHONE=+919876543210          ← Your WhatsApp / phone
//   TWILIO_SMS_FROM=+1xxxxxxxxxx       ← Twilio SMS number (if different)
//   WHATSAPP_NUMBER=919876543210       ← for wa.me links (no +)
// ─────────────────────────────────────────────────────

let twilioClient = null;

const getTwilio = () => {
  if (!twilioClient) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.warn("⚠️  Twilio credentials missing — notifications disabled");
      return null;
    }
    const twilio = require("twilio");
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

/* ── Send WhatsApp message to admin ──────────────── */
const sendAdminWhatsApp = async (message) => {
  const client = getTwilio();
  if (!client || !process.env.ADMIN_PHONE) return;
  try {
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE}`,
      to:   `whatsapp:${process.env.ADMIN_PHONE}`,
      body: message
    });
    console.log("✅ WhatsApp notification sent to admin");
  } catch (err) {
    console.error("❌ WhatsApp notification failed:", err.message);
  }
};

/* ── Send SMS to admin ───────────────────────────── */
const sendAdminSMS = async (message) => {
  const client = getTwilio();
  if (!client || !process.env.ADMIN_PHONE) return;
  try {
    await client.messages.create({
      from: process.env.TWILIO_SMS_FROM || process.env.TWILIO_PHONE,
      to:   process.env.ADMIN_PHONE,
      body: message
    });
    console.log("✅ SMS notification sent to admin");
  } catch (err) {
    console.error("❌ SMS notification failed:", err.message);
  }
};

/* ── New order notification ──────────────────────── */
const notifyAdminNewOrder = async (order, userName, userEmail) => {
  const orderId = `#${String(order._id).slice(-8).toUpperCase()}`;
  const items   = (order.items || []).map(i => `${i.name} ×${i.qty}`).join(", ");
  const total   = `₹${order.totalAmount?.toLocaleString("en-IN")}`;
  const mode    = order.paymentMode === "cod" ? "Cash on Delivery" : "Online Payment";

  const message = [
    `🛒 *New Order — RouterKart*`,
    ``,
    `Order: ${orderId}`,
    `Customer: ${userName}`,
    `Phone: ${order.phone || "—"}`,
    `Email: ${userEmail}`,
    ``,
    `Items: ${items}`,
    `Total: *${total}*`,
    `Payment: ${mode}`,
    ``,
    `📍 ${order.address || "—"}`,
    ``,
    `Manage: https://routerkart.in/admin/orders`
  ].join("\n");

  // Fire both in parallel — failure of one doesn't stop the other
  await Promise.allSettled([
    sendAdminWhatsApp(message),
    sendAdminSMS(`RouterKart New Order ${orderId} from ${userName} — ${total}. Check admin panel.`)
  ]);
};

/* ── Order status change notification ───────────── */
const notifyAdminStatusChange = async (orderId, newStatus, userName) => {
  const message = `📦 RouterKart: Order #${String(orderId).slice(-8).toUpperCase()} for ${userName} is now *${newStatus.toUpperCase()}*.`;
  await sendAdminWhatsApp(message);
};

module.exports = {
  notifyAdminNewOrder,
  notifyAdminStatusChange
};