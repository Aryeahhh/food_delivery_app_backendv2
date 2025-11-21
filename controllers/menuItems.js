import MenuItem from "../models/menuItem.model.js";
import Restaurant from "../models/restaurant.model.js";

// GET /api/menu-items
export const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.findAll({
      include: [{ model: Restaurant, attributes: ["restaurant_id", "name"] }],
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/menu-items/:id
export const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByPk(id, {
      include: [{ model: Restaurant, attributes: ["restaurant_id", "name"] }],
    });

    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/menu-items
export const createMenuItem = async (req, res) => {
  try {
    const { item_name, item_price, restaurant_id, category, description } = req.body;

    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const menuItem = await MenuItem.create({
      item_name,
      item_price,
      restaurant_id,
      category: category || "Main",
      description: description || null,
    });

    res.status(201).json({
      message: "Menu item created successfully",
      menuItem,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/menu-items/:id
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, item_price, restaurant_id, category, description } = req.body;

    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    // If restaurant_id is being updated, verify it exists
    if (restaurant_id && restaurant_id !== menuItem.restaurant_id) {
      const restaurant = await Restaurant.findByPk(restaurant_id);
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }
    }

    await menuItem.update({
      item_name,
      item_price,
      restaurant_id,
      category,
      description,
    });

    res.json({
      message: "Menu item updated successfully",
      menuItem,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/menu-items/:id
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
