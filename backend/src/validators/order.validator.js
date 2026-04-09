const { z } = require("zod");

const createOrderSchema = z.object({
  body: z.object({
    addressId: z.string().uuid(),
    paymentMethod: z.enum(["cod", "online"]).optional().default("cod"),
    notes: z.string().max(500).optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled"
    ]),
    paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional()
  }),
  query: z.object({}).optional(),
  params: z.object({
    orderId: z.string().uuid()
  })
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema
};
