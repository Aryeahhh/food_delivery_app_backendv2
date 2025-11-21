import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import Restaurant from "./restaurant.model.js";

const MenuItem = sequelize.define("MenuItem", {
  menu_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  item_name: DataTypes.STRING,
  item_price: DataTypes.FLOAT,
  category: { type: DataTypes.STRING, defaultValue: "Main" }, // Restaurant-specific categories
  description: { type: DataTypes.TEXT }, // Optional item description
  is_available: { type: DataTypes.BOOLEAN, defaultValue: true }, // Can be toggled on/off
});

Restaurant.hasMany(MenuItem, { foreignKey: "restaurant_id" });
MenuItem.belongsTo(Restaurant, { foreignKey: "restaurant_id" });

export default MenuItem;
