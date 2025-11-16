import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const User = sequelize.define("User", {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  phone: DataTypes.STRING,
  address: DataTypes.STRING,
  isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
  isRestaurant: { type: DataTypes.BOOLEAN, defaultValue: false },
  isCourier: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export default User;
