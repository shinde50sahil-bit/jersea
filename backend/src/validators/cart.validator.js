const { z } = require("zod");

const addCartItemSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    size: z.enum([
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
    ]),
    quantity: z.coerce.number().int().min(1).max(10)
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.coerce.number().int().min(1).max(10)
  }),
  query: z.object({}).optional(),
  params: z.object({
    itemId: z.string().uuid()
  })
});

module.exports = {
  addCartItemSchema,
  updateCartItemSchema
};
