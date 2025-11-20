import Restaurant from "../models/restaurant.model.js";
import MenuItem from "../models/menuItem.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";

// Detect common image MIME types from magic numbers
function detectImageMime(buf) {
  if (!buf || buf.length < 4) return "application/octet-stream";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  // GIF: GIF87a or GIF89a
  if (buf.length >= 6) {
    const sig = Buffer.from(buf.subarray(0, 6)).toString("ascii");
    if (sig === "GIF87a" || sig === "GIF89a") return "image/gif";
  }
  // WEBP: RIFF....WEBP
  if (buf.length >= 12) {
    const riff = Buffer.from(buf.subarray(0, 4)).toString("ascii");
    const webp = Buffer.from(buf.subarray(8, 12)).toString("ascii");
    if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  }
  // BMP: 42 4D
  if (buf[0] === 0x42 && buf[1] === 0x4d) return "image/bmp";
  return "application/octet-stream";
}

// GET /api/restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    // Ensure deterministic ordering; without ORDER BY, Postgres can return rows in any order
    const restaurants = await Restaurant.findAll({ order: [["restaurant_id", "ASC"]] });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/restaurants/:id
export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/restaurants/:id/menu
export const getRestaurantMenu = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const menuItems = await MenuItem.findAll({
      where: { restaurant_id: id },
    });

    res.json({
      restaurant,
      menuItems,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/restaurants/:id/image
export const getRestaurantImage = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    if (!restaurant.image) return res.status(404).json({ error: "Image not found" });

    const mime = detectImageMime(restaurant.image);
    res.setHeader("Content-Type", mime);
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(200).send(restaurant.image);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/restaurants/:id/orders/:orderId
export const acceptOrder = async (req, res) => {
  try {
    const { id, orderId } = req.params;
    const { status } = req.body;

    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Find and update order
    const order = await Order.findOne({
      where: {
        order_id: orderId,
        restaurant_id: id,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found for this restaurant" });
    }

    await order.update({ status: status || "Accepted" });

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/restaurants (owner creates their restaurant)
export const createOwnRestaurant = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const { name, address, phone, email, cuisineType, details, imageBase64 } = req.body;
    if (!name || !address) {
      return res.status(400).json({ error: "name and address are required" });
    }

    const image = imageBase64 ? Buffer.from(imageBase64, "base64") : null;

    const restaurant = await Restaurant.create({
      name,
      address,
      phone,
      email,
      cuisineType,
      details,
      image,
      user_id: userId,
      // isapproved is default false; admin must approve
    });

    res.status(201).json({
      message: "Restaurant submitted for approval",
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/restaurants/:id/menu-items (owner adds menu items to their restaurant)
export const addMenuItemForOwnRestaurant = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const { id } = req.params;
    const { item_name, item_price } = req.body;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    // Allow owner or admin
    const user = await User.findByPk(userId);
    if (!user) return res.status(401).json({ error: "User not found" });
    if (!user.isAdmin && restaurant.user_id !== userId) {
      return res.status(403).json({ error: "Not your restaurant" });
    }

    const menuItem = await MenuItem.create({
      item_name,
      item_price,
      restaurant_id: restaurant.restaurant_id,
    });

    res.status(201).json({
      message: "Menu item added",
      menuItem,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/restaurants/:id/image (owner or admin uploads image via multipart/form-data field 'image')
export const uploadRestaurantImage = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: "No file uploaded (field name should be 'image')." });

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

    // Allow owner or admin
    const user = await User.findByPk(userId);
    if (!user) return res.status(401).json({ error: "User not found" });
    if (!user.isAdmin && restaurant.user_id !== userId) {
      return res.status(403).json({ error: "Not your restaurant" });
    }

    await restaurant.update({ image: req.file.buffer });

    return res.json({ message: "Image uploaded" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
