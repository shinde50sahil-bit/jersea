const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  clientUrls: (process.env.CLIENT_URLS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "replace-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  autoSync: process.env.AUTO_SYNC !== "false",
  seedAdminName: process.env.SEED_ADMIN_NAME || "Admin User",
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL || "admin@jersea.com",
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!"
};

module.exports = { env };
