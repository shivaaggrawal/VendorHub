const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");









const errorMiddleware = (err, req, res, next) => {
  let error = err;


  if (err.name === "CastError") {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }


  if (err.name === "MulterError") {
    let message = "File upload failure occurred.";
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File is too large. Maximum size allowed is 5 MB.";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "Too many files uploaded. Maximum is 5 images.";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected upload field name or file format.";
    } else {
      message = `Upload constraint violated: ${err.message}`;
    }
    error = new ApiError(400, message);
  }


  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new ApiError(409, `Duplicate value for '${field}'. Please use another.`);
  }


  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(422, "Validation failed", messages);
  }


  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token. Please login again.");
  }
  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Token expired. Please login again.");
  }


  if (!(error instanceof ApiError)) {
    error = new ApiError(
      err.statusCode || 500,
      err.message || "Internal Server Error"
    );
  }


  if (error.statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} → ${error.message}`, {
      stack: error.stack,
    });
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

module.exports = errorMiddleware;
