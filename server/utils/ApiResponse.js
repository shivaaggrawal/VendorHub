/**
 * Standardized API success response.
 * All successful responses use this class to ensure consistent shape.
 *
 * Shape: { success: true, message, data, meta? }
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code (2xx)
   * @param {string} message    - Human-readable success message
   * @param {*}      data       - Response payload
   * @param {object} [meta]     - Optional pagination or extra metadata
   */
  constructor(statusCode, message, data = null, meta = null) {
    this.statusCode = statusCode;
    this.success = true;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }

  /**
   * Sends the response via Express res object.
   * @param {import("express").Response} res
   */
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      ...(this.meta && { meta: this.meta }),
    });
  }
}

module.exports = ApiResponse;
