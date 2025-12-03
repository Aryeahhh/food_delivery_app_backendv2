import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import sequelize from "./config/db.config.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import { verifyCookieJWT, requireAdmin, requireRestaurant, requireAdminOrRestaurant } from "./middleware/cookieAuth.js";

// Import all models
import "./models/user.model.js";
import "./models/restaurant.model.js";
import "./models/menuItem.model.js";
import "./models/courier.model.js";
import "./models/order.model.js";
import "./models/orderItem.model.js";
import "./models/rating.model.js";

// Import controllers
import * as userController from "./controllers/users.js";
import * as adminController from "./controllers/admin.js";
import * as restaurantController from "./controllers/restaurants.js";
import * as menuItemController from "./controllers/menuItems.js";
import * as courierController from "./controllers/couriers.js";
import * as orderController from "./controllers/orders.js";
import * as orderItemController from "./controllers/orderItems.js";
import * as chatbotController from "./controllers/chatbot.js";

dotenv.config();
const app = express();

// in-memory upload for small images (stored as bytea)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

app.use(
  cors({
    origin: "https://food-delivery-app-backendv2-three.vercel.app",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

// Connect to Database (no auto-sync for production)
sequelize.authenticate()
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch(err => console.error("❌ DB connection error:", err));

// serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Serve Angular frontend (built assets) from backend/public
const publicDir = path.join(process.cwd(), "public");
app.use(express.static(publicDir));
// SPA fallback: let Angular handle client routes
app.get(["/home", "/login", "/register", "/cart", "/checkout", "/courier", "/admin", "/restaurants", "/user", "/user-orders", "/account"], (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
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
app.get("/api/admin/couriers/pending", verifyCookieJWT, requireAdmin, adminController.listPendingCouriers);
app.put("/api/admin/couriers/:id/approve", verifyCookieJWT, requireAdmin, adminController.approveCourier);

// Restaurant Routes
app.get("/api/restaurants", restaurantController.getAllRestaurants);
app.get("/api/restaurants/:id", restaurantController.getRestaurantById);
app.get("/api/restaurants/:id/menu", restaurantController.getRestaurantMenu);
app.get("/api/restaurants/:id/image", restaurantController.getRestaurantImage);
app.put("/api/restaurants/:id/orders/:orderId", restaurantController.acceptOrder);
app.post("/api/restaurants", verifyCookieJWT, requireRestaurant, restaurantController.createOwnRestaurant);
app.post("/api/restaurants/:id/menu-items", verifyCookieJWT, requireRestaurant, restaurantController.addMenuItemForOwnRestaurant);
app.put("/api/restaurants/:id/image", verifyCookieJWT, requireAdminOrRestaurant, upload.single("image"), restaurantController.uploadRestaurantImage);
app.put("/api/restaurants/:id", verifyCookieJWT, requireAdminOrRestaurant, restaurantController.updateRestaurantInfo);


// Route to add a rating to the rating table
app.post("/api/restaurants/rating", restaurantController.addRestaurantRating);
// Route to update the restaurant rating
app.put("/api/restaurants/review", restaurantController.addRestaurantReview);
  
// Route to get ratings by user id
app.get("/api/ratings/user/:userId", userController.getRatingsByUser);

// MenuItem Routes
app.get("/api/menu-items", menuItemController.getAllMenuItems);
app.get("/api/menu-items/:id", menuItemController.getMenuItemById);
app.post("/api/menu-items", menuItemController.createMenuItem);
app.put("/api/menu-items/:id", menuItemController.updateMenuItem);
app.delete("/api/menu-items/:id", menuItemController.deleteMenuItem);

// Courier Routes
app.get("/api/couriers", courierController.getAllCouriers);
app.get("/api/couriers/user/:userId", courierController.getCourierByUserId);
app.get("/api/couriers/:id/current-order", courierController.getCurrentOrder);
app.get("/api/couriers/:id/past-orders", courierController.getPastOrders);
app.put("/api/couriers/:id/availability", courierController.toggleAvailability);
app.put("/api/couriers/:id", courierController.updateCourierProfile);

// Order Routes
app.get("/api/orders/available", courierController.getAvailableOrders);
app.put("/api/orders/:id/accept", courierController.acceptOrder);
app.put("/api/orders/:id/status", courierController.updateOrderStatus);
app.post("/api/orders", orderController.createOrder);
app.get("/api/orders/:id", orderController.getOrderById);
app.delete("/api/orders/:id", orderController.deleteOrder);
app.get("/api/orders/user/:userId", orderController.getOrdersByUser);

// OrderItem Routes
app.post("/api/order-items", orderItemController.createOrderItem);
app.get("/api/order-items/:id", orderItemController.getOrderItemById);
app.put("/api/order-items/:id", orderItemController.updateOrderItem);
app.delete("/api/order-items/:id", orderItemController.deleteOrderItem);

// Chatbot Routes
app.post("/api/chat", chatbotController.chat);


app.use(express.json());

// Export app for Vercel serverless
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
app.use('*', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});