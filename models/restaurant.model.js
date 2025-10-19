import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Restaurant = sequelize.define("Restaurant", {
  restaurant_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  address: DataTypes.STRING,
  contact_info: DataTypes.STRING,
  delivery_range: DataTypes.INTEGER,
});

export default Restaurant;
