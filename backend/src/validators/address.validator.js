const { z } = require("zod");

const addressBody = z.object({
  label: z.string().min(2).max(40),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(10).max(20),
  line1: z.string().min(5).max(120),
  line2: z.string().max(120).optional().or(z.literal("")),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  postalCode: z.string().min(4).max(12),
  country: z.string().min(2).max(80).optional().default("India"),
  isDefault: z.boolean().optional().default(false)
});

const createAddressSchema = z.object({
  body: addressBody,
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

const updateAddressSchema = z.object({
  body: addressBody.partial(),
  query: z.object({}).optional(),
  params: z.object({
    addressId: z.string().uuid()
  })
});

module.exports = {
  createAddressSchema,
  updateAddressSchema
};
