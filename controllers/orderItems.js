import OrderItem from "../models/orderItem.model.js";
import Order from "../models/order.model.js";
import MenuItem from "../models/menuItem.model.js";

// POST /api/order-items
export const createOrderItem = async (req, res) => {
  try {
    const { order_id, menu_item_id, quantity } = req.body;

    // Verify order exists
    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify menu item exists
    const menuItem = await MenuItem.findByPk(menu_item_id);
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    const orderItem = await OrderItem.create({
      order_id,
      menu_item_id,
      quantity,
    });

    const completeOrderItem = await OrderItem.findByPk(orderItem.order_item_id, {
      include: [
        { model: MenuItem, attributes: ["menu_item_id", "item_name", "item_price"] },
        { model: Order, attributes: ["order_id", "status"] },
      ],
    });

    res.status(201).json({
      message: "Order item created successfully",
      orderItem: completeOrderItem,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/order-items/:id
export const getOrderItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const orderItem = await OrderItem.findByPk(id, {
      include: [
        { model: MenuItem, attributes: ["menu_item_id", "item_name", "item_price"] },
        { model: Order, attributes: ["order_id", "status", "order_time"] },
      ],
    });

    if (!orderItem) {
      return res.status(404).json({ error: "Order item not found" });
    }

    res.json(orderItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/order-items/:id
export const updateOrderItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, menu_item_id } = req.body;

    const orderItem = await OrderItem.findByPk(id);
    if (!orderItem) {
      return res.status(404).json({ error: "Order item not found" });
    }

    // If menu_item_id is being updated, verify it exists
    if (menu_item_id && menu_item_id !== orderItem.menu_item_id) {
      const menuItem = await MenuItem.findByPk(menu_item_id);
      if (!menuItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }
    }

    await orderItem.update({
      quantity: quantity !== undefined ? quantity : orderItem.quantity,
      menu_item_id: menu_item_id || orderItem.menu_item_id,
    });

    const updatedOrderItem = await OrderItem.findByPk(id, {
      include: [
        { model: MenuItem, attributes: ["menu_item_id", "item_name", "item_price"] },
        { model: Order, attributes: ["order_id", "status"] },
      ],
    });

    res.json({
      message: "Order item updated successfully",
      orderItem: updatedOrderItem,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/order-items/:id
export const deleteOrderItem = async (req, res) => {
  try {
    const { id } = req.params;

    const orderItem = await OrderItem.findByPk(id);
    if (!orderItem) {
      return res.status(404).json({ error: "Order item not found" });
    }

    await orderItem.destroy();

    res.json({ message: "Order item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
