const { body } = require("express-validator");




const createProductValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Product title is required")
    .isLength({ max: 200 }).withMessage("Title cannot exceed 200 characters"),

  body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ max: 3000 }).withMessage("Description cannot exceed 3000 characters"),

  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("stock")
    .notEmpty().withMessage("Stock is required")
    .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),

  body("category")
    .notEmpty().withMessage("Category is required")
    .isMongoId().withMessage("Invalid category ID"),

  body("tags")
    .optional()
    .isArray().withMessage("Tags must be an array"),
];




const updateProductValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage("Title cannot exceed 200 characters"),

  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("stock")
    .optional()
    .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
];




const reviewValidator = [
  body("rating")
    .notEmpty().withMessage("Rating is required")
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),

  body("comment")
    .optional()
    .isLength({ max: 1000 }).withMessage("Comment cannot exceed 1000 characters"),
];

module.exports = { createProductValidator, updateProductValidator, reviewValidator };
