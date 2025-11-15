import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Courier = sequelize.define("Courier", {
  courier_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  address: DataTypes.STRING,
  isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
  vehicleMake: DataTypes.STRING,
  vehicleModel: DataTypes.STRING,
  vehicleYear: DataTypes.INTEGER,
  licensePlate: DataTypes.STRING,
  vehicleColour: DataTypes.STRING,
  city: DataTypes.STRING,
  user_id: { type: DataTypes.INTEGER, allowNull: false },
});

export default Courier;
