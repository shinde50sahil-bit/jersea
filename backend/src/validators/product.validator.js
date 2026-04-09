const { z } = require("zod");
const { isStoredImagePath } = require("../utils/imagePaths");

const sizeEnum = z.enum([
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "4XL",
  "16",
  "18",
  "20",
  "22",
  "24",
  "26",
  "28"
]);
const optionalDescriptionSchema = z.preprocess((value) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }

  return value;
}, z.string().min(20).optional());
const imageUrlSchema = z.string().trim().refine((value) => {
  if (isStoredImagePath(value)) {
    return true;
  }

  try {
    const parsedUrl = new URL(value);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch (error) {
    void error;
    return false;
  }
}, "Image must be a valid URL or an uploaded file path");

const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(160),
    shortDescription: z.string().min(10).max(220),
    description: optionalDescriptionSchema,
    category: z.string().min(2).max(60),
    price: z.coerce.number().positive(),
    compareAtPrice: z.coerce.number().positive().optional(),
    imageUrl: imageUrlSchema,
    gallery: z.array(imageUrlSchema).optional().default([]),
    sizes: z.array(sizeEnum).min(1),
    stock: z.coerce.number().int().min(0),
    sku: z.string().min(3).max(60).optional(),
    isFeatured: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true)
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid()
  })
});

const productIdParamsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid()
  })
});

const listProductsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    featured: z.enum(["true", "false"]).optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    size: sizeEnum.optional(),
    sort: z
      .enum(["newest", "price_asc", "price_desc", "name_asc", "name_desc"])
      .optional(),
    page: z.string().optional(),
    limit: z.string().optional()
  })
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
  productIdParamsSchema
};
