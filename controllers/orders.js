import Order from "../models/order.model.js";
import OrderItem from "../models/orderItem.model.js";
import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import Courier from "../models/courier.model.js";
import MenuItem from "../models/menuItem.model.js";

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const { user_id, restaurant_id, courier_id, order_address, order_items, tip, delivery_fee } = req.body;

    // Verify user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Create order
    const order = await Order.create({
      user_id,
      restaurant_id,
      courier_id: courier_id || null,
      order_address: order_address || user.address,
      status: "Pending",
      tip: tip || 0.00,
      delivery_fee: delivery_fee || 5.00,
    });

    // Create order items if provided
    if (order_items && Array.isArray(order_items)) {
      for (const item of order_items) {
        await OrderItem.create({
          order_id: order.order_id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
        });
      }
    }

    // Fetch complete order with items
    const completeOrder = await Order.findByPk(order.order_id, {
      include: [
        { model: User, as: "customer", attributes: ["user_id", "name", "phone"] },
        { model: Restaurant, attributes: ["restaurant_id", "name", "address"] },
        { model: Courier, as: "courier", attributes: ["courier_id", "name", "phone"] },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: MenuItem, attributes: ["menu_item_id", "item_name", "item_price"] }],
        },
      ],
    });

    res.status(201).json({
      message: "Order created successfully",
      order: completeOrder,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        { model: User, attributes: ["user_id", "name", "phone", "address"] },
        { model: Restaurant, attributes: ["restaurant_id", "name", "address"] },
        { model: Courier, attributes: ["courier_id", "name", "phone"] },
        {
          model: OrderItem,
          include: [{ model: MenuItem, attributes: ["menu_item_id", "item_name", "item_price"] }],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Calculate total
    let total = 0;
    if (order.OrderItems) {
      total = order.OrderItems.reduce((sum, item) => {
        return sum + (item.MenuItem.item_price * item.quantity);
      }, 0);
    }

    res.json({
      ...order.toJSON(),
      total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, courier_id, estimated_delivery_time } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (courier_id) updateData.courier_id = courier_id;
    if (estimated_delivery_time) updateData.estimated_delivery_time = estimated_delivery_time;

    await order.update(updateData);

    const updatedOrder = await Order.findByPk(id, {
      include: [
        { model: User, attributes: ["user_id", "name", "phone"] },
        { model: Restaurant, attributes: ["restaurant_id", "name"] },
        { model: Courier, attributes: ["courier_id", "name", "phone"] },
      ],
    });

    res.json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/orders/:id
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Delete associated order items first
    await OrderItem.destroy({ where: { order_id: id } });

    // Delete the order
    await order.destroy();

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/orders/user/:userId
export const getOrdersByUser = async (req, res) => {
  console.log("getOrdersByUser called");
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        { model: Restaurant, attributes: ["restaurant_id", "name", "address"] },
        { model: Courier, as: "courier", attributes: ["courier_id", "name", "phone"] },
        {
          model: OrderItem,
          include: [{ model: MenuItem, attributes: ["menu_item_id", "item_name", "item_price"] }],
        },
      ],
      order: [["order_time", "DESC"]],
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
