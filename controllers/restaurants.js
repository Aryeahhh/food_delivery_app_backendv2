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
