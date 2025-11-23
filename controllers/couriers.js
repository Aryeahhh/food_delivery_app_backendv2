import Courier from "../models/courier.model.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/orderItem.model.js";
import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import MenuItem from "../models/menuItem.model.js";

// GET /api/orders/available - Get all pending orders (no courier assigned)
export const getAvailableOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { 
        status: "Pending",
        courier_id: null 
      },
      include: [
        { 
          model: User, 
          as: "customer",
          attributes: ["user_id", "name", "phone", "address"] 
        },
        { 
          model: Restaurant, 
          attributes: ["restaurant_id", "name", "address", "phone"] 
        },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: MenuItem, attributes: ["item_name", "item_price"] }]
        }
      ],
      order: [["order_time", "ASC"]]
    });

    res.json({ orders });
  } catch (error) {
    console.error('getAvailableOrders error:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/orders/:id/accept - Courier accepts an order
export const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { courier_id } = req.body;

    // Verify courier exists and is active
    const courier = await Courier.findByPk(courier_id);
    if (!courier) {
      return res.status(404).json({ error: "Courier not found" });
    }

    if (!courier.isApproved) {
      return res.status(403).json({ error: "Courier account is pending approval" });
    }

    if (!courier.isActive) {
      return res.status(400).json({ error: "Courier is not active/available" });
    }

    // Find the pending order
    const order = await Order.findOne({
      where: { 
        order_id: id,
        status: "Pending",
        courier_id: null
      }
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found or already assigned" });
    }

    // Assign courier and update status
    await order.update({ 
      courier_id,
      status: "Accepted"
    });

    // Return updated order with details
    const updatedOrder = await Order.findByPk(id, {
      include: [
        { model: User, as: "customer", attributes: ["user_id", "name", "phone"] },
        { model: Restaurant, attributes: ["restaurant_id", "name", "address"] },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: MenuItem, attributes: ["item_name", "item_price"] }]
        }
      ]
    });

    res.json({ 
      message: "Order status updated successfully",
      order: updatedOrder 
    });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/couriers/:id/current-order - Get courier's active order
export const getCurrentOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const courier = await Courier.findByPk(id);
    if (!courier) {
      return res.status(404).json({ error: "Courier not found" });
    }

    if (!courier.isApproved) {
      return res.status(403).json({ error: "Courier account is pending approval" });
    }

    const order = await Order.findOne({
      where: { 
        courier_id: id,
        status: ["Accepted", "Picked Up"]
      },
      include: [
        { model: User, as: "customer", attributes: ["user_id", "name", "phone", "address"] },
        { model: Restaurant, attributes: ["restaurant_id", "name", "address", "phone"] },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: MenuItem, attributes: ["item_name", "item_price"] }]
        }
      ]
    });

    res.json({ order: order || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/couriers/:id/past-orders - Get courier's completed orders
export const getPastOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const courier = await Courier.findByPk(id);
    if (!courier) {
      return res.status(404).json({ error: "Courier not found" });
    }

    if (!courier.isApproved) {
      return res.status(403).json({ error: "Courier account is pending approval" });
    }

    const orders = await Order.findAll({
      where: { 
        courier_id: id,
        status: "Delivered"
      },
      include: [
        { model: User, as: "customer", attributes: ["user_id", "name", "phone"] },
        { model: Restaurant, attributes: ["restaurant_id", "name", "address"] },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: MenuItem, attributes: ["item_name", "item_price"] }]
        }
      ],
      order: [["updatedAt", "DESC"]],
      limit: limit
    });

    res.json({ orders });
  } catch (error) {
    console.error('getPastOrders error:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/couriers/:id/availability - Toggle courier availability
export const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const courier = await Courier.findByPk(id);
    if (!courier) {
      return res.status(404).json({ error: "Courier not found" });
    }

    if (!courier.isApproved) {
      return res.status(403).json({ error: "Courier account is pending approval" });
    }

    await courier.update({ isActive });

    res.json({ 
      message: `Courier is now ${isActive ? 'available' : 'offline'}`,
      courier 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/couriers
export const getAllCouriers = async (req, res) => {
  try {
    const couriers = await Courier.findAll();
    res.json(couriers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/couriers/user/:userId - Get courier by user_id
export const getCourierByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const courier = await Courier.findOne({ where: { user_id: userId } });
    
    if (!courier) {
      return res.status(404).json({ error: "Courier profile not found" });
    }
    
    res.json(courier);
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

// PUT /api/orders/:id/status - Update order status (Picked Up, Delivered)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, courier_id } = req.body;

    // Validate status
    const validStatuses = ["Accepted", "Picked Up", "Delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be: Accepted, Picked Up, or Delivered" });
    }

    // Find order assigned to this courier
    const order = await Order.findOne({
      where: {
        order_id: id,
        courier_id
      }
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found or not assigned to this courier" });
    }

    // Update status
    await order.update({ status });

    // Return updated order with details
    const updatedOrder = await Order.findByPk(id, {
      include: [
        { model: User, as: "customer", attributes: ["user_id", "name", "phone", "address"] },
        { model: Restaurant, attributes: ["restaurant_id", "name", "address", "phone"] },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: MenuItem, attributes: ["item_name", "item_price"] }]
        }
      ]
    });

    res.json({
      message: `Order status updated to ${status}`,
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/couriers/:id - Update courier profile
export const updateCourierProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      address,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      licensePlate,
      vehicleColour,
      city
    } = req.body;

    const courier = await Courier.findByPk(id);
    if (!courier) {
      return res.status(404).json({ error: "Courier not found" });
    }

    const updates = {};
    if (typeof name !== 'undefined') updates.name = name;
    if (typeof email !== 'undefined') updates.email = email;
    if (typeof phone !== 'undefined') updates.phone = phone;
    if (typeof address !== 'undefined') updates.address = address;
    if (typeof vehicleMake !== 'undefined') updates.vehicleMake = vehicleMake;
    if (typeof vehicleModel !== 'undefined') updates.vehicleModel = vehicleModel;
    if (typeof vehicleYear !== 'undefined') updates.vehicleYear = vehicleYear;
    if (typeof licensePlate !== 'undefined') updates.licensePlate = licensePlate;
    if (typeof vehicleColour !== 'undefined') updates.vehicleColour = vehicleColour;
    if (typeof city !== 'undefined') updates.city = city;

    await courier.update(updates);

    res.json({
      message: "Courier profile updated successfully",
      courier
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
