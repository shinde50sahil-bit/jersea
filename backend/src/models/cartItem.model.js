const { DataTypes } = require("sequelize");

function cartItemModel(sequelize) {
  return sequelize.define(
    "CartItem",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      size: {
        type: DataTypes.STRING,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    },
    {
      tableName: "cart_items",
      underscored: true
    }
  );
}

module.exports = { cartItemModel };
