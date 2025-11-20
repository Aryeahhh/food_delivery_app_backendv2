import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import sequelize from "./config/db.config.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import { verifyCookieJWT, requireAdmin, requireRestaurant, requireAdminOrRestaurant } from "./middleware/cookieAuth.js";

// Import all models
import "./models/user.model.js";
import "./models/restaurant.model.js";
import "./models/menuItem.model.js";
import "./models/courier.model.js";
import "./models/order.model.js";
import "./models/orderItem.model.js";

// Import controllers
import * as userController from "./controllers/users.js";
import * as adminController from "./controllers/admin.js";
import * as restaurantController from "./controllers/restaurants.js";
import * as menuItemController from "./controllers/menuItems.js";
import * as courierController from "./controllers/couriers.js";
import * as orderController from "./controllers/orders.js";
import * as orderItemController from "./controllers/orderItems.js";

dotenv.config();
const app = express();

// in-memory upload for small images (stored as bytea)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

// Connect + Sync Database
sequelize.sync({ alter: true })
  .then(() => console.log("✅ PostgreSQL connected and models synced"))
  .catch(err => console.error("❌ DB connection error:", err));

// Simple test route
app.get("/", (req, res) => {
  res.send("🍽️ GourmAI backend is running!");
});

// User Routes
app.post("/api/users/register", userController.register);
app.post("/api/users/login", userController.login);
app.post("/api/users/logout", userController.logout);
app.get("/api/users/profile/:id", userController.getProfile);
app.put("/api/users/:id", userController.updateUser);
app.delete("/api/users/:id", userController.deleteAccount);

// Admin Routes (protected)
app.post("/api/admin/restaurants", verifyCookieJWT, requireAdmin, adminController.addRestaurant);
app.post("/api/admin/menu-items", verifyCookieJWT, requireAdmin, adminController.addMenuItem);
app.post("/api/admin/couriers", verifyCookieJWT, requireAdmin, adminController.addCourier);
app.delete("/api/admin/restaurants/:id", verifyCookieJWT, requireAdmin, adminController.deleteRestaurant);
app.delete("/api/admin/menu-items/:id", verifyCookieJWT, requireAdmin, adminController.deleteMenuItem);
app.get("/api/admin/restaurants/pending", verifyCookieJWT, requireAdmin, adminController.listPendingRestaurants);
app.put("/api/admin/restaurants/:id/approve", verifyCookieJWT, requireAdmin, adminController.approveRestaurant);
app.put("/api/admin/restaurants/:id", verifyCookieJWT, requireAdmin, adminController.updateRestaurant);

// Restaurant Routes
app.get("/api/restaurants", restaurantController.getAllRestaurants);
app.get("/api/restaurants/:id", restaurantController.getRestaurantById);
app.get("/api/restaurants/:id/menu", restaurantController.getRestaurantMenu);
app.get("/api/restaurants/:id/image", restaurantController.getRestaurantImage);
app.put("/api/restaurants/:id/orders/:orderId", restaurantController.acceptOrder);
app.post("/api/restaurants", verifyCookieJWT, requireRestaurant, restaurantController.createOwnRestaurant);
app.post("/api/restaurants/:id/menu-items", verifyCookieJWT, requireRestaurant, restaurantController.addMenuItemForOwnRestaurant);
app.put("/api/restaurants/:id/image", verifyCookieJWT, requireAdminOrRestaurant, upload.single("image"), restaurantController.uploadRestaurantImage);

// MenuItem Routes
app.get("/api/menu-items", menuItemController.getAllMenuItems);
app.get("/api/menu-items/:id", menuItemController.getMenuItemById);
app.post("/api/menu-items", menuItemController.createMenuItem);
app.put("/api/menu-items/:id", menuItemController.updateMenuItem);
app.delete("/api/menu-items/:id", menuItemController.deleteMenuItem);

// Courier Routes
app.get("/api/couriers", courierController.getAllCouriers);
app.get("/api/couriers/:id/orders", courierController.viewAssignedOrders);
app.put("/api/couriers/:id/orders/:orderId/status", courierController.updateOrderStatus);

// Order Routes
app.post("/api/orders", orderController.createOrder);
app.get("/api/orders/:id", orderController.getOrderById);
app.put("/api/orders/:id/status", orderController.updateOrderStatus);
app.delete("/api/orders/:id", orderController.deleteOrder);
app.get("/api/orders/user/:userId", orderController.getOrdersByUser);

// OrderItem Routes
app.post("/api/order-items", orderItemController.createOrderItem);
app.get("/api/order-items/:id", orderItemController.getOrderItemById);
app.put("/api/order-items/:id", orderItemController.updateOrderItem);
app.delete("/api/order-items/:id", orderItemController.deleteOrderItem);


app.use(express.json());

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
