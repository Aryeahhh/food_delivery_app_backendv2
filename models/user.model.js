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

/**
 * Associate Rating model with User
 * This allows querying ratings given by a user
 */
User.associate = (models) => {
  User.hasMany(models.Rating, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
  });
};

export default User;
