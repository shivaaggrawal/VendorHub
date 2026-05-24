require("dotenv").config();
const express       = require("express");
const cors          = require("cors");
const helmet        = require("helmet");
const morgan        = require("morgan");
const cookieParser  = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

// ── Config & DB ───────────────────────────────────────────────────────────
const connectDB        = require("./config/db");
require("./config/cloudinary");    // initialise Cloudinary

// ── Middleware ────────────────────────────────────────────────────────────
const errorMiddleware = require("./middleware/error.middleware");
const { apiLimiter }  = require("./middleware/rateLimiter.middleware");

// ── Routes ────────────────────────────────────────────────────────────────
const authRoutes           = require("./routes/auth.routes");
const productRoutes        = require("./routes/product.routes");
const cartRoutes           = require("./routes/cart.routes");
const orderRoutes          = require("./routes/order.routes");
const paymentRoutes        = require("./routes/payment.routes");
const sellerRoutes         = require("./routes/seller.routes");
const adminRoutes          = require("./routes/admin.routes");
const recommendationRoutes = require("./routes/recommendation.routes");
const settingsRoutes       = require("./routes/settings.routes");
// ── Logger ────────────────────────────────────────────────────────────────
const logger = require("./utils/logger");

// ─────────────────────────────────────────────────────────────────────────
const app = express();

// ── Security headers ──────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server calls)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.includes(origin) || 
                        origin.startsWith("http://localhost:") || 
                        origin.startsWith("http://127.0.0.1:") ||
                        origin === process.env.CLIENT_URL;

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy blocks request from origin ${origin}`));
      }
    },
    credentials: true,
    methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Cookie parsing ────────────────────────────────────────────────────────
app.use(cookieParser());

// ── Mongo query injection sanitization ───────────────────────────────────
app.use(mongoSanitize());

// ── HTTP request logger (dev only) ───────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Global rate limiter ───────────────────────────────────────────────────
app.use("/api", apiLimiter);

// ─────────────────────────────────────────────────────────────────────────
// ── API Routes ────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────
app.use("/api/auth",            authRoutes);
app.use("/api/products",        productRoutes);
app.use("/api/cart",            cartRoutes);
app.use("/api/orders",          orderRoutes);
app.use("/api/payment",         paymentRoutes);
app.use("/api/seller",          sellerRoutes);
app.use("/api/admin",           adminRoutes);
app.use("/api/settings",        settingsRoutes);
app.use("/api/recommendations", recommendationRoutes);

// ── Health check ──────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Vendor Marketplace API is running 🚀",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VendorHub APIs Running 🚀"
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Centralised error handler (must be last) ──────────────────────────────
app.use(errorMiddleware);

// ─────────────────────────────────────────────────────────────────────────
// ── Bootstrap ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Bind the port FIRST so Render always detects an open port,
  // then connect to the database in the background.
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    logger.info(`📡 Health check: http://localhost:${PORT}/health`);
  });
  await connectDB();
};

// Unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});

// Uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

startServer();

module.exports = app; // exported for testing
