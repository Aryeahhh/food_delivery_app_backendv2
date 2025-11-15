import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
  logging: false,
});

// Import models
import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import Courier from "../models/courier.model.js";
import MenuItem from "../models/menuItem.model.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/orderItem.model.js";

// Define associations
Restaurant.belongsTo(User, { foreignKey: "user_id", as: "owner" });
User.hasMany(Restaurant, { foreignKey: "user_id", as: "restaurants" });

Courier.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Courier, { foreignKey: "user_id", as: "couriers" });

MenuItem.belongsTo(Restaurant, { foreignKey: "restaurant_id" });
Restaurant.hasMany(MenuItem, { foreignKey: "restaurant_id", as: "menuItems" });

Order.belongsTo(User, { foreignKey: "user_id", as: "customer" });
User.hasMany(Order, { foreignKey: "user_id", as: "orders" });

Order.belongsTo(Courier, { foreignKey: "courier_id", as: "courier" });
Courier.hasMany(Order, { foreignKey: "courier_id", as: "deliveries" });

Order.belongsTo(Restaurant, { foreignKey: "restaurant_id" });
Restaurant.hasMany(Order, { foreignKey: "restaurant_id", as: "orders" });

OrderItem.belongsTo(Order, { foreignKey: "order_id" });
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });

OrderItem.belongsTo(MenuItem, { foreignKey: "menu_item_id" });
MenuItem.hasMany(OrderItem, { foreignKey: "menu_item_id" });

export default sequelize;
