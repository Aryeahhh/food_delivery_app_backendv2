import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Restaurant = sequelize.define("Restaurant", {
  restaurant_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  address: DataTypes.STRING,
  phone: DataTypes.STRING,
  email: DataTypes.STRING,
  isapproved: { type: DataTypes.BOOLEAN, defaultValue: false },
  cuisineType: DataTypes.STRING,
  details: DataTypes.TEXT,
  image: { type: DataTypes.BLOB("long"), allowNull: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  rating_sum: { type: DataTypes.INTEGER, defaultValue: 0 },
  rating_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  avg_rating: { type: DataTypes.DECIMAL(3, 2) },
});

/**
 * Associate Rating model with Restaurant
 * This allows querying ratings associated with a restaurant
 */
Restaurant.associate = (models) => {
  Restaurant.hasMany(models.Rating, {
    foreignKey: "restaurant_id",
    onDelete: "CASCADE",
  });
};

export default Restaurant;
