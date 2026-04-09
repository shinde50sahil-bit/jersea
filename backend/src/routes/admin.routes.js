const express = require("express");
const {
  getStats,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/admin.controller");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validate");
const { updateOrderStatusSchema } = require("../validators/order.validator");

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/stats", getStats);
router.get("/orders", getAllOrders);
router.patch("/orders/:orderId/status", validate(updateOrderStatusSchema), updateOrderStatus);

module.exports = router;
