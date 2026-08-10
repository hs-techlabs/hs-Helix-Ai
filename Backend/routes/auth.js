import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "helix_jwt_secret_key_default_2026";

// Helper: generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please provide a valid email address." });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ error: "An account with this email already exists." });
        }

        // Create new user
        const user = new User({ name, email, password });
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Registration error:", err);

        // Handle Mongoose validation errors
        if (err.name === "ValidationError") {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ error: messages.join(". ") });
        }

        res.status(500).json({ error: "Registration failed. Please try again." });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        // Find user and explicitly select password (since it's select: false)
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Login failed. Please try again." });
    }
});

// GET /api/auth/me — get current user profile (protected)
router.get("/me", authMiddleware, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (err) {
        console.error("Get profile error:", err);
        res.status(500).json({ error: "Failed to fetch profile." });
    }
});

export default router;
