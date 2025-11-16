import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export function verifyCookieJWT(req, res, next) {
  try {
    let token = req.cookies?.authToken;
    if (!token && typeof req.headers?.authorization === "string") {
      const auth = req.headers.authorization;
      if (auth.startsWith("Bearer ")) token = auth.slice(7);
    }
    if (!token) return res.status(401).json({ error: "Missing auth token" });

    const secret = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { user_id, email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export async function requireAdmin(req, res, next) {
  try {
    if (!req.user?.user_id) return res.status(401).json({ error: "Unauthenticated" });
    const user = await User.findByPk(req.user.user_id);
    if (!user) return res.status(401).json({ error: "User not found" });
    if (!user.isAdmin) return res.status(403).json({ error: "Admin access required" });
    next();
  } catch (err) {
    return res.status(500).json({ error: "Role check failed" });
  }
}

export async function requireCourier(req, res, next) {
  try {
    if (!req.user?.user_id) return res.status(401).json({ error: "Unauthenticated" });
    const user = await User.findByPk(req.user.user_id);
    if (!user) return res.status(401).json({ error: "User not found" });
    if (!user.isCourier) return res.status(403).json({ error: "Courier access required" });
    next();
  } catch (err) {
    return res.status(500).json({ error: "Role check failed" });
  }
}

export async function requireRestaurant(req, res, next) {
  try {
    if (!req.user?.user_id) return res.status(401).json({ error: "Unauthenticated" });
    const user = await User.findByPk(req.user.user_id);
    if (!user) return res.status(401).json({ error: "User not found" });
    if (!user.isRestaurant) return res.status(403).json({ error: "Restaurant access required" });
    next();
  } catch (err) {
    return res.status(500).json({ error: "Role check failed" });
  }
}
