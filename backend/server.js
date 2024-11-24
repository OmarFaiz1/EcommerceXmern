import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import Redis from "ioredis"; // Import ioredis

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

// Set up Redis connection
const redis = new Redis({
  host: process.env.REDIS_HOST, // Set this in your .env file
  port: process.env.REDIS_PORT, // Redis port (default 6379)
  password: process.env.REDIS_PASSWORD, // Redis password from your .env file
  tls: {}, // Enable TLS if required for Upstash or secure Redis server
  maxRetriesPerRequest: 5, // Set max retries per request
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000); // Retry delay
  },
  enableReadyCheck: false, // Disable ready check if not required
  connectionName: "my-redis-client", // Optional: Name your connection
  onError: (err) => console.error("Redis Error:", err), // Log Redis errors
});

// Test Redis connection
redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis error: ", err);
});

// Middleware
app.use(express.json({ limit: "10mb" })); // allows you to parse the body of the request
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});
