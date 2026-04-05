// controllers/orderController.js
const Order   = require("../models/Order");
const User    = require("../models/User");
const Product = require("../models/Product");
const {
  sendOrderConfirmationEmail,
  sendDeliveryEmail,
  sendAdminOrderNotificationEmail
} = require("../services/emailService");
const { notifyAdminNewOrder, notifyAdminStatusChange } = require("../services/notificationService");

/* ═══════════════════════════════════════════════════
   CREATE ORDER
   POST /api/orders
══════════════════════════════════════════════════ */
exports.createOrder = async (req, res) => {
  try {
    console.log("CREATE ORDER HIT");
    console.log("BODY:", req.body);
    const {
      items, address, addressDetails, phone,
      paymentMode, paymentStatus,
      advancePaid, amountDueOnDelivery,
      razorpayOrderId, razorpayPaymentId
    } = req.body;

    if (!items?.length) return res.status(400).json({ message: "No items in order" });

    // Calculate totals server-side from DB prices (security: don't trust client prices)
    let subtotal = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;
      if (product.stock < item.qty) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      const lineTotal = product.price * item.qty;
      subtotal += lineTotal;
      enrichedItems.push({
        productId: product._id,
        name:      product.name,
        price:     product.price,
        qty:       item.qty,
        image:     product.image
      });
      // Decrement stock
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.qty } });
    }

    const delivery    = subtotal >= 999 ? 0 : 49;
    const totalAmount = subtotal + delivery;

    const order = await Order.create({
      userId:          req.user.id,
      items:           enrichedItems,
      address,
      addressDetails,
      phone,
      subtotal,
      delivery,
      totalAmount,
      paymentMode:     paymentMode || "online",
      paymentStatus:   paymentStatus || "paid",
      advancePaid:     advancePaid     || 0,
      amountDueOnDelivery: amountDueOnDelivery || 0,
      razorpayOrderId: razorpayOrderId || "",
      razorpayPaymentId: razorpayPaymentId || "",
      status:          "confirmed",
      "timeline.confirmed": new Date()
    });

    // ── Increment user order count ──
    await User.findByIdAndUpdate(req.user.id, { $inc: { orderCount: 1 } });

    // ── Send emails + notifications (non-blocking) ──
    const user = await User.findById(req.user.id).select("name email");
    if (user) {
      Promise.allSettled([
        sendOrderConfirmationEmail(order, user.email, user.name)
          .then(() => Order.findByIdAndUpdate(order._id, { confirmationEmailSent: true })),

        sendAdminOrderNotificationEmail(order, user.email, user.name),

        notifyAdminNewOrder(order, user.name, user.email)
          .then(() => Order.findByIdAndUpdate(order._id, { adminNotified: true }))
      ]).then(results => {
        results.forEach((r, i) => {
          if (r.status === "rejected") console.error(`Notification ${i} failed:`, r.reason);
        });
      });
    }

    res.status(201).json(order);
  } catch (err) {
    console.error("createOrder:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

/* ═══════════════════════════════════════════════════
   GET MY ORDERS (user)
   GET /api/orders/my
══════════════════════════════════════════════════ */
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch { res.status(500).json({ message: "Failed to fetch orders" }); }
};

/* ═══════════════════════════════════════════════════
   GET ALL ORDERS (admin)
   GET /api/orders
══════════════════════════════════════════════════ */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch { res.status(500).json({ message: "Failed to fetch orders" }); }
};

/* ═══════════════════════════════════════════════════
   UPDATE ORDER STATUS (admin)
   PUT /api/orders/:id
   Body: { status }
══════════════════════════════════════════════════ */
const VALID_STATUSES = [
  "pending", "confirmed", "processing",
  "shipped", "out_for_delivery", "delivered",
  "cancelled", "returned"
];

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status))
      return res.status(400).json({ message: "Invalid status value" });

    const timelineUpdate = {};
    timelineUpdate[`timeline.${status.replace(/ /g, "_")}`] = new Date();

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, ...timelineUpdate },
      { new: true }
    ).populate("userId", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // ── If delivered — send delivery email (once only) ──
    if (status === "delivered" && !order.deliveryEmailSent && order.userId?.email) {
      sendDeliveryEmail(order, order.userId.email, order.userId.name)
        .then(() => Order.findByIdAndUpdate(order._id, { deliveryEmailSent: true }))
        .catch(err => console.error("Delivery email failed:", err));
    }

    // ── Notify admin on every status change ──
    if (order.userId?.name) {
      notifyAdminStatusChange(order._id, status, order.userId.name).catch(() => {});
    }

    res.json(order);
  } catch (err) {
    console.error("updateOrderStatus:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

/* ═══════════════════════════════════════════════════
   GET SINGLE ORDER
   GET /api/orders/:id
══════════════════════════════════════════════════ */
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("userId", "name email phone");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Security: user can only see their own order (admin sees all)
    if (!req.user.isAdmin && order.userId._id.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorised" });

    res.json(order);
  } catch { res.status(500).json({ message: "Failed to fetch order" }); }
};