// services/emailService.js
// npm install nodemailer
// .env: EMAIL_USER=admin@routerkart.in  EMAIL_PASS=yourGmailAppPassword
//       ADMIN_EMAIL=admin@routerkart.in  ADMIN_PHONE=919876543210

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true, // MUST be true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP READY ✅");
  }
});

/* ─── Shared email wrapper ─────────────────────────── */
const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log("📤 Sending to:", to);

    const info = await transporter.sendMail({
  from: `"RouterKart" <admin@routerkart.in>`,
  to,
  subject,
  html,
});

    console.log("✅ SUCCESS:", info.response);
    return true;

  } catch (err) {
    console.error("❌ ERROR:", err);
    return false;
  }
};

/* ─── Brand colors ─────────────────────────────────── */
const BG = "#111111";
const YELLOW = "#FEE12B";
const LIGHT = "#F7F7F5";
const BODY_FONT = "font-family:'Segoe UI',Arial,sans-serif;";

const emailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#eeeeee;${BODY_FONT}">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eeeeee;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- HEADER -->
        <tr>
          <td style="background:${BG};padding:24px 32px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:28px;letter-spacing:-1px">
              Router<span style="color:${YELLOW}">Kart</span>
            </h1>
            <p style="color:#666;font-size:12px;margin:6px 0 0;letter-spacing:2px">NETWORKING EQUIPMENT</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:white;padding:32px;border-radius:0 0 12px 12px">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:20px 0;text-align:center">
            <p style="color:#aaa;font-size:12px;margin:0">
              © 2026 RouterKart · <a href="https://routerkart.in" style="color:${YELLOW};text-decoration:none">routerkart.in</a>
            </p>
            <p style="color:#bbb;font-size:11px;margin:4px 0 0">
              This is an automated email. Please do not reply directly.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

/* ─── OTP email ─────────────────────────────────────── */
const sendOtpEmail = async (email, otp, purpose = "signup") => {
  const purposeText = {
    signup:      "verify your email and complete registration",
    emailChange: "verify your new email address",
    phoneChange: "verify your phone number change"
  }[purpose] || "verify your identity";

  const html = emailWrapper(`
    <h2 style="color:#111;font-size:22px;margin:0 0 8px;letter-spacing:-0.5px">Email Verification</h2>
    <p style="color:#666;font-size:15px;margin:0 0 24px">
      Use the code below to ${purposeText}:
    </p>
    <div style="background:${LIGHT};border:2px solid ${YELLOW};border-radius:12px;padding:24px;text-align:center;margin:0 0 24px">
      <p style="color:#aaa;font-size:12px;font-weight:700;letter-spacing:2px;margin:0 0 8px;text-transform:uppercase">Your OTP</p>
      <p style="font-size:42px;font-weight:900;color:#111;letter-spacing:12px;margin:0;font-family:monospace">${otp}</p>
    </div>
    <div style="background:#FFF9E6;border:1px solid ${YELLOW};border-radius:8px;padding:14px 18px;margin:0 0 20px">
      <p style="color:#666;font-size:13px;margin:0">
        ⏰ This OTP expires in <strong>10 minutes</strong>.
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `);
  return sendEmail({ to: email, subject: "Your RouterKart OTP — " + otp, html });
};

/* ─── Order confirmation email (to customer) ─────── */
const sendOrderConfirmationEmail = async (order, userEmail, userName) => {
  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333">
        ${item.name}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;text-align:center;color:#666">
        ×${item.qty}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;text-align:right;font-weight:700;color:#111">
        ₹${(item.price * item.qty).toLocaleString("en-IN")}
      </td>
    </tr>`).join("");

  const deliveryInfo = order.paymentMode === "cod"
    ? `<p style="color:#cc8800;font-size:13px;margin:8px 0 0"><strong>COD:</strong> ₹${order.advancePaid} paid online · ₹${order.amountDueOnDelivery?.toLocaleString("en-IN")} due on delivery</p>`
    : "";

  const html = emailWrapper(`
    <h2 style="color:#111;font-size:22px;margin:0 0 6px;letter-spacing:-0.5px">Order Confirmed! 🎉</h2>
    <p style="color:#666;font-size:15px;margin:0 0 24px">
      Hi <strong>${userName}</strong>, thank you for shopping with RouterKart.<br>
      Your order has been placed successfully.
    </p>

    <!-- ORDER ID BADGE -->
    <div style="background:${BG};border-radius:10px;padding:16px 20px;margin:0 0 24px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <p style="color:#aaa;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 4px">Order ID</p>
        <p style="color:white;font-size:16px;font-weight:900;margin:0;font-family:monospace">#${String(order._id).slice(-8).toUpperCase()}</p>
      </div>
      <div style="background:${YELLOW};color:#111;padding:6px 14px;border-radius:6px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px">
        ${order.paymentMode === "cod" ? "Cash on Delivery" : "Paid Online"}
      </div>
    </div>

    <!-- ITEMS -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px">
      <tr>
        <th style="text-align:left;font-size:11px;color:#aaa;letter-spacing:1px;text-transform:uppercase;padding:0 0 8px;border-bottom:2px solid #111">Item</th>
        <th style="text-align:center;font-size:11px;color:#aaa;letter-spacing:1px;text-transform:uppercase;padding:0 0 8px;border-bottom:2px solid #111">Qty</th>
        <th style="text-align:right;font-size:11px;color:#aaa;letter-spacing:1px;text-transform:uppercase;padding:0 0 8px;border-bottom:2px solid #111">Amount</th>
      </tr>
      ${itemsHtml}
    </table>

    <!-- TOTALS -->
    <div style="background:${LIGHT};border-radius:10px;padding:16px 20px;margin:0 0 20px">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span style="color:#666;font-size:13px">Subtotal</span>
        <span style="font-weight:700;font-size:13px">₹${order.subtotal?.toLocaleString("en-IN") || order.totalAmount?.toLocaleString("en-IN")}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:10px">
        <span style="color:#666;font-size:13px">Delivery</span>
        <span style="font-weight:700;font-size:13px;color:${order.delivery === 0 ? "#16a34a" : "#111"}">${order.delivery === 0 ? "FREE" : "₹" + order.delivery}</span>
      </div>
      <div style="border-top:1px solid #e5e5e5;padding-top:10px;display:flex;justify-content:space-between">
        <span style="font-size:16px;font-weight:900;color:#111">Total</span>
        <span style="font-size:20px;font-weight:900;color:#111">₹${order.totalAmount?.toLocaleString("en-IN")}</span>
      </div>
      ${deliveryInfo}
    </div>

    <!-- DELIVERY ADDRESS -->
    <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:16px 20px;margin:0 0 24px">
      <p style="color:#1d4ed8;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin:0 0 6px">🚚 Delivering to</p>
      <p style="color:#1e40af;font-size:14px;font-weight:600;margin:0;line-height:1.6">${order.address || "—"}</p>
      ${order.phone ? `<p style="color:#60a5fa;font-size:12px;margin:4px 0 0">📞 ${order.phone}</p>` : ""}
    </div>

    <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 20px">
      We'll send you an email as soon as your order is shipped. 
      You can track your order status by visiting your 
      <a href="https://routerkart.in/orders" style="color:${YELLOW};font-weight:700;text-decoration:none">Orders page</a>.
    </p>

    <div style="background:${BG};border-radius:10px;padding:16px 20px;text-align:center">
      <p style="color:white;font-size:14px;margin:0">
        Questions? WhatsApp us at 
        <a href="https://wa.me/${process.env.WHATSAPP_NUMBER}" style="color:${YELLOW};font-weight:700;text-decoration:none">
          +${process.env.WHATSAPP_NUMBER}
        </a>
      </p>
    </div>
  `);

  return sendEmail({
    to: userEmail,
    subject: `Order Confirmed #${String(order._id).slice(-8).toUpperCase()} — RouterKart`,
    html
  });
};

/* ─── Delivery completion email (to customer) ──────── */
const sendDeliveryEmail = async (order, userEmail, userName) => {
  const html = emailWrapper(`
    <h2 style="color:#111;font-size:22px;margin:0 0 6px;letter-spacing:-0.5px">Your Order Has Been Delivered! 📦</h2>
    <p style="color:#666;font-size:15px;margin:0 0 24px">
      Hi <strong>${userName}</strong>, great news! Your RouterKart order has been successfully delivered.
    </p>

    <div style="background:#F0FDF4;border:2px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin:0 0 24px;text-align:center">
      <p style="font-size:40px;margin:0 0 8px">✅</p>
      <p style="color:#16a34a;font-size:18px;font-weight:900;margin:0 0 4px">Delivered Successfully</p>
      <p style="color:#166534;font-size:13px;margin:0">Order #${String(order._id).slice(-8).toUpperCase()}</p>
    </div>

    <!-- ITEMS SUMMARY -->
    <div style="background:${LIGHT};border-radius:10px;padding:16px 20px;margin:0 0 24px">
      <p style="font-size:12px;font-weight:800;color:#aaa;letter-spacing:1px;text-transform:uppercase;margin:0 0 12px">Items Delivered</p>
      ${(order.items || []).map(i => `
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:14px;color:#333">${i.name} ×${i.qty}</span>
          <span style="font-size:14px;font-weight:700;color:#111">₹${(i.price * i.qty).toLocaleString("en-IN")}</span>
        </div>`).join("")}
    </div>

    <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 20px">
      We hope you love your new networking gear! If you're happy with your purchase, 
      please take a moment to <strong>leave a review</strong> — it helps other customers 
      make better decisions.
    </p>

    <div style="text-align:center;margin:0 0 24px">
      <a href="https://routerkart.in/product/${order.items?.[0]?.productId}" 
         style="display:inline-block;background:${YELLOW};color:#111;padding:13px 28px;border-radius:8px;font-weight:900;font-size:15px;text-decoration:none">
        ⭐ Write a Review
      </a>
    </div>

    <p style="color:#888;font-size:13px;line-height:1.6;margin:0 0 4px">
      If you have any issues with your order, please contact us within <strong>7 days</strong> for returns/exchanges.
    </p>
    <p style="color:#888;font-size:13px;margin:0">
      WhatsApp: <a href="https://wa.me/${process.env.WHATSAPP_NUMBER}" style="color:${YELLOW};text-decoration:none">+${process.env.WHATSAPP_NUMBER}</a>
    </p>
  `);

  return sendEmail({
    to: userEmail,
    subject: `Your RouterKart order has been delivered! ✅ #${String(order._id).slice(-8).toUpperCase()}`,
    html
  });
};

/* ─── Admin new order notification email ──────────── */
const sendAdminOrderNotificationEmail = async (order, userEmail, userName) => {
  const itemsText = (order.items || []).map(i => `${i.name} ×${i.qty}`).join(", ");
  const html = emailWrapper(`
    <h2 style="color:#111;font-size:22px;margin:0 0 6px">🆕 New Order Received!</h2>
    <p style="color:#666;font-size:15px;margin:0 0 24px">
      A new order has been placed on RouterKart. Login to admin to manage it.
    </p>

    <div style="background:${BG};border-radius:10px;padding:20px;margin:0 0 20px">
      <table width="100%" cellpadding="6">
        <tr><td style="color:#aaa;font-size:12px;width:120px">Order ID</td>
            <td style="color:${YELLOW};font-weight:900;font-family:monospace">#${String(order._id).slice(-8).toUpperCase()}</td></tr>
        <tr><td style="color:#aaa;font-size:12px">Customer</td>
            <td style="color:white;font-weight:700">${userName}</td></tr>
        <tr><td style="color:#aaa;font-size:12px">Email</td>
            <td style="color:white">${userEmail}</td></tr>
        <tr><td style="color:#aaa;font-size:12px">Phone</td>
            <td style="color:white">${order.phone || "—"}</td></tr>
        <tr><td style="color:#aaa;font-size:12px">Items</td>
            <td style="color:white">${itemsText}</td></tr>
        <tr><td style="color:#aaa;font-size:12px">Total</td>
            <td style="color:${YELLOW};font-weight:900;font-size:18px">₹${order.totalAmount?.toLocaleString("en-IN")}</td></tr>
        <tr><td style="color:#aaa;font-size:12px">Payment</td>
            <td style="color:white;text-transform:capitalize">${order.paymentMode} (${order.paymentStatus})</td></tr>
        <tr><td style="color:#aaa;font-size:12px">Address</td>
            <td style="color:white">${order.address}</td></tr>
      </table>
    </div>

    <div style="text-align:center">
      <a href="https://routerkart.in/admin/orders" style="display:inline-block;background:${YELLOW};color:#111;padding:13px 28px;border-radius:8px;font-weight:900;font-size:15px;text-decoration:none">
        ⚙️ Manage Order
      </a>
    </div>
  `);

  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `🆕 New Order ₹${order.totalAmount?.toLocaleString("en-IN")} — ${userName} — RouterKart`,
    html
  });
};

module.exports = {
  sendOtpEmail,
  sendOrderConfirmationEmail,
  sendDeliveryEmail,
  sendAdminOrderNotificationEmail
};