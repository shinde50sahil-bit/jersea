const { app } = require("./app");
const { env } = require("./config/env");
const { connectDatabase } = require("./config/database");
const { sequelize } = require("./models");

async function startServer() {
  await connectDatabase();

  if (env.autoSync) {
    await sequelize.sync();
  }

  app.listen(env.port, () => {
    console.log(`Backend server running on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start backend:", error.message);
  process.exit(1);
});
