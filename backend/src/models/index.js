const { sequelize } = require("../config/database");
const { userModel } = require("./user.model");
const { productModel } = require("./product.model");
const { addressModel } = require("./address.model");
const { cartItemModel } = require("./cartItem.model");
const { orderModel } = require("./order.model");
const { orderItemModel } = require("./orderItem.model");

const User = userModel(sequelize);
const Product = productModel(sequelize);
const Address = addressModel(sequelize);
const CartItem = cartItemModel(sequelize);
const Order = orderModel(sequelize);
const OrderItem = orderItemModel(sequelize);

User.hasMany(Address, { foreignKey: "userId", as: "addresses", onDelete: "CASCADE" });
Address.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(CartItem, { foreignKey: "userId", as: "cartItems", onDelete: "CASCADE" });
CartItem.belongsTo(User, { foreignKey: "userId", as: "user" });

Product.hasMany(CartItem, { foreignKey: "productId", as: "cartItems" });
CartItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

User.hasMany(Order, { foreignKey: "userId", as: "orders", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

Address.hasMany(Order, { foreignKey: "addressId", as: "orders" });
Order.belongsTo(Address, { foreignKey: "addressId", as: "address" });

Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items",
  onDelete: "CASCADE"
});
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

Product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

module.exports = {
  sequelize,
  User,
  Product,
  Address,
  CartItem,
  Order,
  OrderItem
};
