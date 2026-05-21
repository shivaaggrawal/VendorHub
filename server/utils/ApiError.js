/**
 * Custom API Error class.
 * Extends the built-in Error so it carries HTTP status + structured info.
 *
 * Shape: { success: false, message, errors[], stack? }
 */
class ApiError extends Error {
  /**
   * @param {number}   statusCode - HTTP status code (4xx / 5xx)
   * @param {string}   message    - Human-readable error message
   * @param {Array}    [errors]   - Validation / field-level errors
   * @param {string}   [stack]    - Optional custom stack trace
   */
  constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.message = message;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
