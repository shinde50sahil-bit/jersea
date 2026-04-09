const { DataTypes } = require("sequelize");

function addressModel(sequelize) {
  return sequelize.define(
    "Address",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Home"
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false
      },
      line1: {
        type: DataTypes.STRING,
        allowNull: false
      },
      line2: {
        type: DataTypes.STRING,
        allowNull: true
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false
      },
      postalCode: {
        type: DataTypes.STRING,
        allowNull: false
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "India"
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      tableName: "addresses",
      underscored: true
    }
  );
}

module.exports = { addressModel };
