const { Address } = require("../models");
const { ApiError } = require("../utils/apiError");
const { asyncHandler } = require("../utils/asyncHandler");

async function clearDefaultAddress(userId) {
  await Address.update(
    { isDefault: false },
    {
      where: { userId }
    }
  );
}

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.findAll({
    where: { userId: req.user.id },
    order: [
      ["isDefault", "DESC"],
      ["createdAt", "DESC"]
    ]
  });

  res.json({
    success: true,
    data: { addresses }
  });
});

const createAddress = asyncHandler(async (req, res) => {
  const payload = req.validated.body;

  if (payload.isDefault) {
    await clearDefaultAddress(req.user.id);
  }

  const address = await Address.create({
    ...payload,
    userId: req.user.id,
    line2: payload.line2 || null
  });

  res.status(201).json({
    success: true,
    message: "Address saved successfully",
    data: { address }
  });
});

const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.validated.params;
  const payload = req.validated.body;

  const address = await Address.findOne({
    where: {
      id: addressId,
      userId: req.user.id
    }
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  if (payload.isDefault) {
    await clearDefaultAddress(req.user.id);
  }

  await address.update({
    ...payload,
    ...(Object.prototype.hasOwnProperty.call(payload, "line2")
      ? { line2: payload.line2 || null }
      : {})
  });

  res.json({
    success: true,
    message: "Address updated successfully",
    data: { address }
  });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const deleted = await Address.destroy({
    where: {
      id: addressId,
      userId: req.user.id
    }
  });

  if (!deleted) {
    throw new ApiError(404, "Address not found");
  }

  res.json({
    success: true,
    message: "Address deleted successfully"
  });
});

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress
};
