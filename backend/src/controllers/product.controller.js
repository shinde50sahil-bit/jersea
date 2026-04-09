const { Op } = require("sequelize");
const { CartItem, Product } = require("../models");
const { ApiError } = require("../utils/apiError");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  buildProductFilters,
  getProductOrder,
  generateUniqueSlug
} = require("../services/product.service");

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

const listProducts = asyncHandler(async (req, res) => {
  const { query } = req.validated;
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 12);
  const offset = (page - 1) * limit;

  const where = buildProductFilters(query);
  const order = getProductOrder(query.sort);

  const { rows, count } = await Product.findAndCountAll({
    where,
    order,
    limit,
    offset
  });

  res.json({
    success: true,
    data: {
      products: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    }
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const { slugOrId } = req.params;
  const orConditions = [{ slug: slugOrId }];

  if (isUuid(slugOrId)) {
    orConditions.push({ id: slugOrId });
  }

  const product = await Product.findOne({
    where: {
      isActive: true,
      [Op.or]: orConditions
    }
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.json({
    success: true,
    data: { product }
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const payload = req.validated.body;
  const slug = await generateUniqueSlug(payload.name);
  const description = payload.description?.trim() || payload.shortDescription;

  const product = await Product.create({
    ...payload,
    description,
    slug,
    sku: payload.sku || null,
    gallery: payload.gallery || []
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: { product }
  });
});

const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please choose an image to upload");
  }

  res.status(201).json({
    success: true,
    message: "Image uploaded successfully",
    data: {
      imageUrl: `/uploads/products/${req.file.filename}`
    }
  });
});

const uploadProductImages = asyncHandler(async (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];

  if (files.length === 0) {
    throw new ApiError(400, "Please choose at least one image to upload");
  }

  res.status(201).json({
    success: true,
    message: "Images uploaded successfully",
    data: {
      imageUrls: files.map((file) => `/uploads/products/${file.filename}`)
    }
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const payload = req.validated.body;

  const product = await Product.findByPk(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const updates = { ...payload };
  if (payload.name && payload.name !== product.name) {
    updates.slug = await generateUniqueSlug(payload.name, product.id);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "description")) {
    updates.description =
      payload.description?.trim() ||
      payload.shortDescription?.trim() ||
      product.description ||
      product.shortDescription;
  }

  await product.update(updates);

  res.json({
    success: true,
    message: "Product updated successfully",
    data: { product }
  });
});

const archiveProduct = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;

  const product = await Product.findByPk(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  await product.update({ isActive: false });

  res.json({
    success: true,
    message: "Product archived successfully"
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;

  const product = await Product.findByPk(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  await CartItem.destroy({
    where: { productId: id }
  });

  await product.destroy();

  res.json({
    success: true,
    message: "Product deleted permanently"
  });
});

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  uploadProductImage,
  uploadProductImages,
  updateProduct,
  archiveProduct,
  deleteProduct
};
