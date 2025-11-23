import Restaurant from "../models/restaurant.model.js";
import MenuItem from "../models/menuItem.model.js";
import Courier from "../models/courier.model.js";
import User from "../models/user.model.js";
import { Op } from "sequelize";

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
      owner_email,
    } = req.body;

    let ownerId = user_id;
    if (!ownerId && owner_email) {
      const owner = await User.findOne({ where: { email: owner_email } });
      if (!owner) {
        return res.status(404).json({ error: "Owner not found for provided email" });
      }
      ownerId = owner.user_id;
    }

    if (!ownerId) {
      return res.status(400).json({ error: "Provide either user_id or owner_email" });
    }

    const restaurant = await Restaurant.create({
      name,
      address,
      phone,
      email,
      isapproved,
      cuisineType,
      details,
      user_id: ownerId,
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
    const pending = await Restaurant.findAll({ 
      where: { isapproved: false },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['user_id', 'name', 'email']
      }]
    });
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

// PUT /api/admin/restaurants/:id - update basic fields (admin only)
export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

    const {
      name,
      address,
      phone,
      email,
      cuisineType,
      details,
      // optional: owner changes
      user_id,
      owner_email,
    } = req.body || {};

    const updates = {};
    if (typeof name !== 'undefined') updates.name = name;
    if (typeof address !== 'undefined') updates.address = address;
    if (typeof phone !== 'undefined') updates.phone = phone;
    if (typeof email !== 'undefined') updates.email = email;
    if (typeof cuisineType !== 'undefined') updates.cuisineType = cuisineType;
    if (typeof details !== 'undefined') updates.details = details;

    // Handle owner change if provided
    let newOwnerId = user_id;
    if (!newOwnerId && owner_email) {
      const owner = await User.findOne({ where: { email: owner_email } });
      if (!owner) return res.status(404).json({ error: "Owner not found for provided email" });
      newOwnerId = owner.user_id;
    }
    if (typeof newOwnerId !== 'undefined' && newOwnerId !== null) {
      updates.user_id = newOwnerId;
    }

    await restaurant.update(updates);
    res.json({ message: "Restaurant updated", restaurant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/admin/couriers/pending - list couriers needing approval
export const listPendingCouriers = async (req, res) => {
  try {
    console.log('Fetching pending couriers...');
    const pending = await Courier.findAll({ 
      where: { 
        [Op.or]: [
          { isApproved: false },
          { isApproved: null }
        ]
      }
    });
    console.log(`Found ${pending.length} pending couriers`);
    res.json({ count: pending.length, couriers: pending });
  } catch (error) {
    console.error('Error fetching pending couriers:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/admin/couriers/:id/approve - mark a courier as approved
export const approveCourier = async (req, res) => {
  try {
    const { id } = req.params;
    const courier = await Courier.findByPk(id);
    if (!courier) return res.status(404).json({ error: "Courier not found" });
    await courier.update({ isApproved: true });
    res.json({ message: "Courier approved", courier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
