import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import MenuItem from "./menuItem.model.js";
import Order from "./order.model.js";

const OrderItem = sequelize.define("OrderItem", {
  order_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: DataTypes.INTEGER,
});

Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

MenuItem.hasMany(OrderItem, { foreignKey: "menu_item_id" });
OrderItem.belongsTo(MenuItem, { foreignKey: "menu_item_id" });

export default OrderItem;
