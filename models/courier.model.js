import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Courier = sequelize.define("Courier", {
  courier_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  courier_name: DataTypes.STRING,
  phone: DataTypes.STRING,
});

export default Courier;
