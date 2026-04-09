const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().min(10).max(20).optional(),
    password: z.string().min(8).max(64)
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(64)
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

module.exports = {
  registerSchema,
  loginSchema
};
