const rateLimit = require("express-rate-limit");
const ApiError = require("../utils/ApiError");







const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new ApiError(429, message));
    },
  });


const apiLimiter = createLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  isDev ? 10000 : parseInt(process.env.RATE_LIMIT_MAX || "500", 10),
  "Too many requests. Please try again after 15 minutes."
);


const authLimiter = createLimiter(
  15 * 60 * 1000,
  isDev ? 1000 : parseInt(process.env.RATE_LIMIT_AUTH_MAX || "30", 10),
  "Too many login attempts. Please try again after 15 minutes."
);


const uploadLimiter = createLimiter(
  60 * 60 * 1000,
  isDev ? 2000 : parseInt(process.env.RATE_LIMIT_UPLOAD_MAX || "100", 10),
  "Upload limit reached. Please try again after 1 hour."
);

module.exports = { apiLimiter, authLimiter, uploadLimiter };
