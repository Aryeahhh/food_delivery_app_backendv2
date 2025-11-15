import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Restaurant = sequelize.define("Restaurant", {
  restaurant_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  address: DataTypes.STRING,
  phone: DataTypes.STRING,
  email: DataTypes.STRING,
  isapproved: { type: DataTypes.BOOLEAN, defaultValue: true },
  cuisineType: DataTypes.STRING,
  details: DataTypes.TEXT,
  user_id: { type: DataTypes.INTEGER, allowNull: false },
});

export default Restaurant;
