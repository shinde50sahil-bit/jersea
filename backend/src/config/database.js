const { Sequelize } = require("sequelize");
const { env } = require("./env");

const sequelize = new Sequelize(env.databaseUrl, {
  dialect: "postgres",
  logging: false,
  dialectOptions:
    env.nodeEnv === "production"
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      : {}
});

async function connectDatabase() {
  if (!env.databaseUrl) {
    throw new Error("Missing DATABASE_URL in backend environment");
  }

  await sequelize.authenticate();
}

module.exports = {
  sequelize,
  connectDatabase
};
