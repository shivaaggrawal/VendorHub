





class ApiResponse {






  constructor(statusCode, message, data = null, meta = null) {
    this.statusCode = statusCode;
    this.success = true;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }





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
