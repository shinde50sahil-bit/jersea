const express = require("express");
const {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem
} = require("../controllers/cart.controller");
const { protect } = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validate");
const {
  addCartItemSchema,
  updateCartItemSchema
} = require("../validators/cart.validator");

const router = express.Router();

router.use(protect);
router.get("/", getCart);
router.post("/items", validate(addCartItemSchema), addCartItem);
router.patch("/items/:itemId", validate(updateCartItemSchema), updateCartItem);
router.delete("/items/:itemId", removeCartItem);

module.exports = router;
