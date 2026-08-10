import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];
        const JWT_SECRET = process.env.JWT_SECRET || "helix_jwt_secret_key_default_2026";

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Find user by ID from token payload (exclude password)
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: "Invalid token. User not found." });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token." });
        }
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired. Please login again." });
        }
        console.error("Auth middleware error:", err);
        return res.status(500).json({ error: "Authentication failed." });
    }
};

export default authMiddleware;
