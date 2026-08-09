import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

// Auth routes (public: login/register, protected: /me)
app.use("/api/auth", authRoutes);

// Chat routes (all protected by auth middleware inside chat.js)
app.use("/api", chatRoutes);

// Connect to DB first, then start server
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected with Database!");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to connect with DB:", err);
        process.exit(1);
    }
};

startServer();
