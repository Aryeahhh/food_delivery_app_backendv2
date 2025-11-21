import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Courier = sequelize.define("Courier", {
  courier_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
  vehicleMake: { type: DataTypes.STRING, allowNull: true },
  vehicleModel: { type: DataTypes.STRING, allowNull: true },
  vehicleYear: { type: DataTypes.INTEGER, allowNull: true },
  licensePlate: { type: DataTypes.STRING, allowNull: true },
  vehicleColour: { type: DataTypes.STRING, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
});

export default Courier;
