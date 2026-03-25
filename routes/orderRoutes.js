const Order = require("../models/Order");

// CREATE ORDER
const createOrder = async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      userId: req.user.id
    });

    const saved = await order.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET USER ORDERS
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id });
    res.json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET ALL ORDERS (ADMIN)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
};

// UPDATE ORDER STATUS
const updateOrderStatus = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
};

// ✅ CRITICAL EXPORT
module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus
};