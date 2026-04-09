const { CartItem, Product } = require("../models");
const { ApiError } = require("../utils/apiError");
const { asyncHandler } = require("../utils/asyncHandler");
const { formatCartSummary } = require("../services/cart.service");

async function getUserCartItems(userId) {
  return CartItem.findAll({
    where: { userId },
    include: [
      {
        model: Product,
        as: "product"
      }
    ],
    order: [["createdAt", "DESC"]]
  });
}

const getCart = asyncHandler(async (req, res) => {
  const cartItems = await getUserCartItems(req.user.id);

  res.json({
    success: true,
    data: formatCartSummary(cartItems)
  });
});

const addCartItem = asyncHandler(async (req, res) => {
  const { productId, size, quantity } = req.validated.body;

  const product = await Product.findOne({
    where: { id: productId, isActive: true }
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (!product.sizes.includes(size)) {
    throw new ApiError(400, "Selected size is not available for this product");
  }

  const existingItem = await CartItem.findOne({
    where: {
      userId: req.user.id,
      productId,
      size
    }
  });

  const nextQuantity = (existingItem?.quantity || 0) + quantity;
  if (nextQuantity > product.stock) {
    throw new ApiError(400, "Not enough stock available");
  }

  if (existingItem) {
    await existingItem.update({ quantity: nextQuantity });
  } else {
    await CartItem.create({
      userId: req.user.id,
      productId,
      size,
      quantity
    });
  }

  const cartItems = await getUserCartItems(req.user.id);

  res.status(201).json({
    success: true,
    message: "Item added to cart",
    data: formatCartSummary(cartItems)
  });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.validated.params;
  const { quantity } = req.validated.body;

  const cartItem = await CartItem.findOne({
    where: {
      id: itemId,
      userId: req.user.id
    },
    include: [
      {
        model: Product,
        as: "product"
      }
    ]
  });

  if (!cartItem) {
    throw new ApiError(404, "Cart item not found");
  }

  if (quantity > cartItem.product.stock) {
    throw new ApiError(400, "Requested quantity exceeds available stock");
  }

  await cartItem.update({ quantity });

  const cartItems = await getUserCartItems(req.user.id);

  res.json({
    success: true,
    message: "Cart updated successfully",
    data: formatCartSummary(cartItems)
  });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const deleted = await CartItem.destroy({
    where: {
      id: itemId,
      userId: req.user.id
    }
  });

  if (!deleted) {
    throw new ApiError(404, "Cart item not found");
  }

  const cartItems = await getUserCartItems(req.user.id);

  res.json({
    success: true,
    message: "Item removed from cart",
    data: formatCartSummary(cartItems)
  });
});

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem
};
