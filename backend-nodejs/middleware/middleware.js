const { body } = require("express-validator");

exports.updateItemValidator = [
  body("quantity")
    .exists().withMessage("Quantity is required")
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative number"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative number"),
];


exports.createItemValidator = [
  body("quantity")
    .exists().withMessage("Quantity is required")
    .isInt({ min: 0 })
    .withMessage("Quantity must be 0 or greater"),

  body("price")
    .exists().withMessage("Cost price is required")
    .isFloat({ min: 1 })
    .withMessage("Cost price must be at least 1"),
];

