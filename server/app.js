require("dotenv").config();
const express       = require("express");
const cors          = require("cors");
const helmet        = require("helmet");
const morgan        = require("morgan");
const cookieParser  = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");


const connectDB        = require("./config/db");
require("./config/cloudinary");


const errorMiddleware = require("./middleware/error.middleware");
const { apiLimiter }  = require("./middleware/rateLimiter.middleware");


const authRoutes           = require("./routes/auth.routes");
const productRoutes        = require("./routes/product.routes");
const cartRoutes           = require("./routes/cart.routes");
const orderRoutes          = require("./routes/order.routes");
const paymentRoutes        = require("./routes/payment.routes");
const sellerRoutes         = require("./routes/seller.routes");
const adminRoutes          = require("./routes/admin.routes");
const recommendationRoutes = require("./routes/recommendation.routes");
const settingsRoutes       = require("./routes/settings.routes");

const logger = require("./utils/logger");


const app = express();


app.use(helmet());


const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {

      if (!origin) return callback(null, true);

      let hostname = "";
      try {
        hostname = new URL(origin).hostname;
      } catch (e) {

      }

      const isAllowed = allowedOrigins.includes(origin) ||
                        origin.startsWith("http://localhost:") ||
                        origin.startsWith("http://127.0.0.1:") ||
                        origin === process.env.CLIENT_URL ||
                        (hostname && (
                          hostname.endsWith(".vercel.app") ||
                          hostname.endsWith(".onrender.com") ||
                          hostname === "vercel.app" ||
                          hostname === "onrender.com"
                        ));

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


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


app.use(cookieParser());


app.use(mongoSanitize());


if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}


app.use("/api", apiLimiter);




app.use("/api/auth",            authRoutes);
app.use("/api/products",        productRoutes);
app.use("/api/cart",            cartRoutes);
app.use("/api/orders",          orderRoutes);
app.use("/api/payment",         paymentRoutes);
app.use("/api/seller",          sellerRoutes);
app.use("/api/admin",           adminRoutes);
app.use("/api/settings",        settingsRoutes);
app.use("/api/recommendations", recommendationRoutes);


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


app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});


app.use(errorMiddleware);




const PORT = process.env.PORT || 5000;

const startServer = async () => {


  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    logger.info(`📡 Health check: http://localhost:${PORT}/health`);
  });
  await connectDB();
};


process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});


process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

startServer();

module.exports = app;
