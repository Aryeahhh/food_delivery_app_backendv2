import Restaurant from "../models/restaurant.model.js";
import MenuItem from "../models/menuItem.model.js";
import Courier from "../models/courier.model.js";

// POST /api/admin/restaurants
export const addRestaurant = async (req, res) => {
  try {
    const { name, address, contact_info, delivery_range } = req.body;

    const restaurant = await Restaurant.create({
      name,
      address,
      contact_info,
      delivery_range,
    });

    res.status(201).json({
      message: "Restaurant added successfully",
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/admin/menu-items
export const addMenuItem = async (req, res) => {
  try {
    const { item_name, item_price, restaurant_id } = req.body;

    // Check if restaurant exists
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const menuItem = await MenuItem.create({
      item_name,
      item_price,
      restaurant_id,
    });

    res.status(201).json({
      message: "Menu item added successfully",
      menuItem,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/admin/couriers
export const addCourier = async (req, res) => {
  try {
    const { courier_name, phone } = req.body;

    const courier = await Courier.create({
      courier_name,
      phone,
    });

    res.status(201).json({
      message: "Courier added successfully",
      courier,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/admin/restaurants/:id
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    await restaurant.destroy();

    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/admin/menu-items/:id
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    await menuItem.destroy();

    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
