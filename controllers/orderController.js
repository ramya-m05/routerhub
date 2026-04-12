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
    const userId = req.user.id;

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

    // ✅ Calculate totals (never trust frontend)
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product || product.stock < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for ${product?.name || "product"}`
        });
      }

      subtotal += item.price * item.qty;
    }

    const delivery = 0; // you can customize
    const totalAmount = subtotal + delivery;

    // ✅ Create order
    const order = await Order.create({
      user: userId,

      items,
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
      razorpayPaymentId
    });

    // ✅ Reduce stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.qty } }
      );
    }

    res.status(201).json(order);

  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


/* ───────────────────────────────────────────── */
/* ✅ GET USER ORDERS */
/* ───────────────────────────────────────────── */
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({
      $or: [
        { user: userId },   // new schema
        { userId: userId }  // old data support
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
      .populate("user userId", "name email")
      .sort({ createdAt: -1 });

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

    // ✅ update timeline automatically
    order.timeline[status] = new Date();

    await order.save();

    res.json(order);

  } catch (err) {
    console.error("UPDATE ORDER STATUS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};