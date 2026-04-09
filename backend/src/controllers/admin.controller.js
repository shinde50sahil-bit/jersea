const { Op } = require("sequelize");
const { Order, OrderItem, Product, User } = require("../models");
const { ApiError } = require("../utils/apiError");
const { asyncHandler } = require("../utils/asyncHandler");

const getStats = asyncHandler(async (req, res) => {
  void req;

  const [users, products, orders] = await Promise.all([
    User.count(),
    Product.count({ where: { isActive: true } }),
    Order.findAll({
      include: [{ model: OrderItem, as: "items" }]
    })
  ]);

  const revenue = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  );

  const lowStockProducts = await Product.findAll({
    where: {
      isActive: true,
      stock: { [Op.lte]: 5 }
    },
    limit: 5,
    order: [["stock", "ASC"]]
  });

  res.json({
    success: true,
    data: {
      stats: {
        users,
        products,
        orders: orders.length,
        revenue
      },
      lowStockProducts
    }
  });
});

const getAllOrders = asyncHandler(async (req, res) => {
  void req;

  const orders = await Order.findAll({
    include: [
      {
        model: OrderItem,
        as: "items"
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "fullName", "email", "phone"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  res.json({
    success: true,
    data: { orders }
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.validated.params;
  const { status, paymentStatus } = req.validated.body;

  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  await order.update({
    status,
    ...(paymentStatus ? { paymentStatus } : {})
  });

  res.json({
    success: true,
    message: "Order status updated successfully",
    data: { order }
  });
});

module.exports = {
  getStats,
  getAllOrders,
  updateOrderStatus
};
