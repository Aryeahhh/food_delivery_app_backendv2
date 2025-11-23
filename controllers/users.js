import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Courier from "../models/courier.model.js";

// POST /api/users/register
export const register = async (req, res) => {
  try {
    const { 
      name, email, password, phone, address, 
      isAdmin = false, isCourier = false, isRestaurant = false,
      // Courier fields
      vehicleMake, vehicleModel, vehicleYear, licensePlate, vehicleColour, city
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      isAdmin: Boolean(isAdmin),
      isCourier: Boolean(isCourier),
      isRestaurant: Boolean(isRestaurant),
    });

    // If registering as courier, create courier profile
    if (isCourier) {
      console.log('Creating courier profile for user:', user.user_id);
      try {
        const courier = await Courier.create({
          user_id: user.user_id,
          name: name,
          email: email,
          phone: phone,
          address: address,
          vehicleMake: vehicleMake || null,
          vehicleModel: vehicleModel || null,
          vehicleYear: vehicleYear || null,
          licensePlate: licensePlate || null,
          vehicleColour: vehicleColour || null,
          city: city || null,
          isActive: false,
          isApproved: false
        });
        console.log('Courier profile created successfully:', courier.courier_id);
      } catch (courierError) {
        console.error('Failed to create courier profile:', courierError);
        throw courierError;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Set HttpOnly cookie with JWT
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        isAdmin: user.isAdmin,
        isCourier: user.isCourier,
        isRestaurant: user.isRestaurant,
      },
      token, // still returning for convenience; frontend can also rely on cookie
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/users/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Set HttpOnly cookie with JWT
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        isAdmin: user.isAdmin,
        isCourier: user.isCourier,
        isRestaurant: user.isRestaurant,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/users/profile/:id
export const getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prepare update data
    const updateData = { name, email, phone, address };

    // If password is being updated, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    res.json({
      message: "User updated successfully",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/users/:id
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.destroy();

    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/users/logout
export const logout = (req, res) => {
  // Clear HttpOnly cookie holding the JWT
  res.cookie("authToken", "", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(0),
  });
  return res.json({ message: "Logged out. Auth cookie cleared." });
};
