import Courier from "../models/courier.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";

// GET /api/couriers
export const getAllCouriers = async (req, res) => {
  try {
    const couriers = await Courier.findAll();
    res.json(couriers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/couriers/:id/orders
export const viewAssignedOrders = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify courier exists
    const courier = await Courier.findByPk(id);
    if (!courier) {
      return res.status(404).json({ error: "Courier not found" });
    }

    // Get all orders assigned to this courier
    const orders = await Order.findAll({
      where: { courier_id: id },
      include: [
        { model: User, attributes: ["user_id", "name", "phone", "address"] },
        { model: Restaurant, attributes: ["restaurant_id", "name", "address"] },
      ],
    });

    res.json({
      courier,
      orders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/couriers/:id/orders/:orderId/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id, orderId } = req.params;
    const { status } = req.body;

    // Verify courier exists
    const courier = await Courier.findByPk(id);
    if (!courier) {
      return res.status(404).json({ error: "Courier not found" });
    }

    // Find order assigned to this courier
    const order = await Order.findOne({
      where: {
        order_id: orderId,
        courier_id: id,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found or not assigned to this courier" });
    }

    await order.update({ status });

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
