const { body } = require("express-validator");




const placeOrderValidator = [
  body("items")
    .isArray({ min: 1 }).withMessage("Order must contain at least one item"),

  body("items.*.product")
    .notEmpty().withMessage("Product ID is required")
    .isMongoId().withMessage("Invalid product ID"),

  body("items.*.quantity")
    .notEmpty().withMessage("Quantity is required")
    .isInt({ min: 1 }).withMessage("Quantity must be at least 1"),

  body("shippingAddress.name")
    .trim()
    .notEmpty().withMessage("Recipient name is required"),

  body("shippingAddress.street")
    .trim()
    .notEmpty().withMessage("Street address is required"),

  body("shippingAddress.city")
    .trim()
    .notEmpty().withMessage("City is required"),

  body("shippingAddress.state")
    .trim()
    .notEmpty().withMessage("State is required"),

  body("shippingAddress.pincode")
    .trim()
    .notEmpty().withMessage("Pincode is required")
    .matches(/^\d{6}$/).withMessage("Pincode must be a 6-digit number"),

  body("shippingAddress.phone")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^[6-9]\d{9}$/).withMessage("Enter a valid 10-digit Indian phone number"),
];

module.exports = { placeOrderValidator };
