import { Sequelize } from "sequelize";
import dotenv from "dotenv";
// Explicitly import pg and pg-hstore so Vercel bundles them
import "pg";
import "pg-hstore";

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
  logging: false,
});

export default sequelize;