import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Rating = sequelize.define(
  "Rating",
  {
    rating_id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true,},
    restaurant_id: {type: DataTypes.INTEGER, allowNull: false, references: {model: "Restaurants", key: "restaurant_id"}, onDelete: "CASCADE"},
    user_id: {type: DataTypes.INTEGER, allowNull: false, references: {model: "Users", key: "user_id"}, onDelete: "CASCADE"},
    rating: {type: DataTypes.SMALLINT, allowNull: false, validate: {min: 1, max: 5}},
  },
  {
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["restaurant_id", "user_id"],
      },
    ],
  }
);

export default Rating;
