import Restaurant from "../models/restaurant.model.js";
import MenuItem from "../models/menuItem.model.js";
import Order from "../models/order.model.js";

// GET /api/restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
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
    if (restaurant.user_id !== userId) return res.status(403).json({ error: "Not your restaurant" });

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
