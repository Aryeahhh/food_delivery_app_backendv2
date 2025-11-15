import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import User from "./user.model.js";
import Restaurant from "./restaurant.model.js";
import Courier from "./courier.model.js";

const Order = sequelize.define("Order", {
  order_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_address: DataTypes.STRING,
  order_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING, defaultValue: "Pending" },
  estimated_delivery_time: DataTypes.DATE,
});

User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

Restaurant.hasMany(Order, { foreignKey: "restaurant_id" });
Order.belongsTo(Restaurant, { foreignKey: "restaurant_id" });

Courier.hasMany(Order, { foreignKey: "courier_id" });
Order.belongsTo(Courier, { foreignKey: "courier_id" });

export default Order;
