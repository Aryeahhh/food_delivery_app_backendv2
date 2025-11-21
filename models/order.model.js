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
  delivery_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 5.00 },
  tip: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
});

// Note: Associations are defined in config/db.config.js to avoid duplicates

export default Order;
