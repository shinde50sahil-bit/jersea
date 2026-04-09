const { sequelize, Address, CartItem, Product, Order, OrderItem } = require("../models");
const { ApiError } = require("../utils/apiError");
const { asyncHandler } = require("../utils/asyncHandler");

function createOrderNumber() {
  return `JER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

const createOrder = asyncHandler(async (req, res) => {
  const { addressId, paymentMethod, notes } = req.validated.body;

  const address = await Address.findOne({
    where: {
      id: addressId,
      userId: req.user.id
    }
  });

  if (!address) {
    throw new ApiError(404, "Shipping address not found");
  }

  const cartItems = await CartItem.findAll({
    where: { userId: req.user.id },
    include: [{ model: Product, as: "product" }]
  });

  if (!cartItems.length) {
    throw new ApiError(400, "Cart is empty");
  }

  for (const item of cartItems) {
    if (!item.product || !item.product.isActive) {
      throw new ApiError(400, "One or more cart items are no longer available");
    }

    if (item.quantity > item.product.stock) {
      throw new ApiError(400, `Insufficient stock for ${item.product.name}`);
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  const shippingFee = subtotal >= 999 ? 0 : 99;
  const totalAmount = subtotal + shippingFee;

  const order = await sequelize.transaction(async (transaction) => {
    const createdOrder = await Order.create(
      {
        userId: req.user.id,
        addressId,
        orderNumber: createOrderNumber(),
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
        subtotal,
        shippingFee,
        totalAmount,
        notes: notes || null,
        shippingAddress: {
          id: address.id,
          label: address.label,
          fullName: address.fullName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country
        }
      },
      { transaction }
    );

    for (const item of cartItems) {
      const unitPrice = Number(item.product.price);
      await OrderItem.create(
        {
          orderId: createdOrder.id,
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.imageUrl,
          size: item.size,
          quantity: item.quantity,
          unitPrice,
          lineTotal: unitPrice * item.quantity
        },
        { transaction }
      );

      await item.product.update(
        {
          stock: item.product.stock - item.quantity
        },
        { transaction }
      );
    }

    await CartItem.destroy({
      where: { userId: req.user.id },
      transaction
    });

    return createdOrder;
  });

  const fullOrder = await Order.findByPk(order.id, {
    include: [{ model: OrderItem, as: "items" }]
  });

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: { order: fullOrder }
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: [{ model: OrderItem, as: "items" }],
    order: [["createdAt", "DESC"]]
  });

  res.json({
    success: true,
    data: { orders }
  });
});

const getMyOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    where: {
      id: req.params.orderId,
      userId: req.user.id
    },
    include: [{ model: OrderItem, as: "items" }]
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  res.json({
    success: true,
    data: { order }
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById
};
