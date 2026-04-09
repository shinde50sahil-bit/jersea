const express = require("express");
const authRoutes = require("./auth.routes");
const productRoutes = require("./product.routes");
const cartRoutes = require("./cart.routes");
const addressRoutes = require("./address.routes");
const orderRoutes = require("./order.routes");
const adminRoutes = require("./admin.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  void req;
  res.json({
    success: true,
    message: "Jersea backend is running"
  });
});

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/addresses", addressRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
