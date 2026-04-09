const express = require("express");
const {
  createOrder,
  getMyOrders,
  getMyOrderById
} = require("../controllers/order.controller");
const { protect } = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validate");
const { createOrderSchema } = require("../validators/order.validator");

const router = express.Router();

router.use(protect);
router.get("/", getMyOrders);
router.get("/:orderId", getMyOrderById);
router.post("/", validate(createOrderSchema), createOrder);

module.exports = router;
