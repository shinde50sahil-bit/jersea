const { DataTypes } = require("sequelize");

function orderItemModel(sequelize) {
  return sequelize.define(
    "OrderItem",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      productName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      productImage: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      size: {
        type: DataTypes.STRING,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      lineTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      }
    },
    {
      tableName: "order_items",
      underscored: true
    }
  );
}

module.exports = { orderItemModel };
