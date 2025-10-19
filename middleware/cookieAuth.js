import jwt from "jsonwebtoken";

export function verifyCookieJWT(req, res, next) {
  try {
    const token = req.cookies?.authToken;
    if (!token) return res.status(401).json({ error: "Missing auth cookie" });

    const secret = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { user_id, email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
