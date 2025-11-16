import Restaurant from "../models/restaurant.model.js";
import MenuItem from "../models/menuItem.model.js";
import Courier from "../models/courier.model.js";

// POST /api/admin/restaurants
export const addRestaurant = async (req, res) => {
  try {
    const {
      name,
      address,
      phone,
      email,
      isapproved = true,
      cuisineType,
      details,
      user_id,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required (owner user id)" });
    }

    const restaurant = await Restaurant.create({
      name,
      address,
      phone,
      email,
      isapproved,
      cuisineType,
      details,
      user_id,
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
    const {
      name,
      email,
      phone,
      address,
      isActive = false,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      licensePlate,
      vehicleColour,
      city,
      user_id,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required (courier's user id)" });
    }

    const courier = await Courier.create({
      name,
      email,
      phone,
      address,
      isActive,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      licensePlate,
      vehicleColour,
      city,
      user_id,
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

// GET /api/admin/restaurants/pending - list restaurants needing approval
export const listPendingRestaurants = async (req, res) => {
  try {
    const pending = await Restaurant.findAll({ where: { isapproved: false } });
    res.json({ count: pending.length, restaurants: pending });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/admin/restaurants/:id/approve - mark a restaurant as approved
export const approveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    await restaurant.update({ isapproved: true });
    res.json({ message: "Restaurant approved", restaurant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
