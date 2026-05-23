const rateLimit = require("express-rate-limit");
const ApiError = require("../utils/ApiError");

/**
 * Factory: creates a rate limiter with custom window/max.
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max      - Max requests per window
 * @param {string} message  - Error message on limit exceeded
 */
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

/** General API limiter — 100 req / 15 min */
const apiLimiter = createLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  "Too many requests. Please try again after 15 minutes."
);

/** Auth limiter — stricter: 10 req / 15 min */
const authLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many login attempts. Please try again after 15 minutes."
);

/** Upload limiter — 20 uploads / hour */
const uploadLimiter = createLimiter(
  60 * 60 * 1000,
  20,
  "Upload limit reached. Please try again after 1 hour."
);

module.exports = { apiLimiter, authLimiter, uploadLimiter };
