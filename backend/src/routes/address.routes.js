const express = require("express");
const {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} = require("../controllers/address.controller");
const { protect } = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validate");
const {
  createAddressSchema,
  updateAddressSchema
} = require("../validators/address.validator");

const router = express.Router();

router.use(protect);
router.get("/", getAddresses);
router.post("/", validate(createAddressSchema), createAddress);
router.patch("/:addressId", validate(updateAddressSchema), updateAddress);
router.delete("/:addressId", deleteAddress);

module.exports = router;
