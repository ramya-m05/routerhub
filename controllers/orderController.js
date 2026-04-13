const Order = require("../models/Order");
const Product = require("../models/Product");

/* ───────────────────────────────────────────── */
/* ✅ CHECK STOCK BEFORE PAYMENT */
/* ───────────────────────────────────────────── */
exports.checkStock = async (req, res) => {
  try {
    const { items } = req.body;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product || product.stock < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for ${product?.name || "product"}`
        });
      }
    }

    res.json({ success: true });

  } catch (err) {
    console.error("CHECK STOCK ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ───────────────────────────────────────────── */
/* ✅ CREATE ORDER */
/* ───────────────────────────────────────────── */
exports.createOrder = async (req, res) => {
  try {
    console.log("🔥 CREATE ORDER HIT");

    // ✅ FIXED: handle both id and _id
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    console.log("USER ID:", userId);

    const {
      items,
      address,
      addressDetails,
      phone,
      paymentMode,
      paymentStatus,
      advancePaid,
      amountDueOnDelivery,
      razorpayOrderId,
      razorpayPaymentId
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    // ✅ Calculate totals securely
    let subtotal = 0;

    const normalizedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product || product.stock < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for ${product?.name || "product"}`
        });
      }

      subtotal += item.price * item.qty;

      // ✅ FIXED: normalize schema
      normalizedItems.push({
        product: product._id,
        name: item.name,
        price: item.price,
        qty: item.qty
      });
    }

    const delivery = 0;
    const totalAmount = subtotal + delivery;

    // ✅ CREATE ORDER
    const order = await Order.create({
      user: userId,

      items: normalizedItems,

      address,
      addressDetails,
      phone,

      subtotal,
      delivery,
      totalAmount,

      paymentMode,
      paymentStatus,

      advancePaid,
      amountDueOnDelivery,

      razorpayOrderId,
      razorpayPaymentId,

      status: "pending",
      timeline: {
        pending: new Date()
      }
    });

    console.log("✅ ORDER CREATED:", order._id);

    // ✅ Reduce stock
    for (const item of normalizedItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.qty } }
      );
    }

    res.status(201).json(order);

  } catch (err) {
    console.error("❌ CREATE ORDER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ───────────────────────────────────────────── */
/* ✅ GET USER ORDERS */
/* ───────────────────────────────────────────── */
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const orders = await Order.find({
      $or: [
        { user: userId },
        { userId: userId } // legacy support
      ]
    })
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    console.error("GET MY ORDERS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ───────────────────────────────────────────── */
/* ✅ GET ALL ORDERS (ADMIN) */
/* ───────────────────────────────────────────── */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    console.log("ADMIN FETCH:", orders.length);

    res.json(orders);

  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ───────────────────────────────────────────── */
/* ✅ UPDATE ORDER STATUS (ADMIN) */
/* ───────────────────────────────────────────── */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;

    // ✅ timeline safe update
    order.timeline = order.timeline || {};
    order.timeline[status] = new Date();

    await order.save();

    res.json(order);

  } catch (err) {
    console.error("UPDATE ORDER STATUS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};