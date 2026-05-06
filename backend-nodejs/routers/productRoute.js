const express = require("express");
const router = express.Router();
const product = require("../controllers/productController");
const { updateItemValidator, createItemValidator } = require("../middleware/middleware");
const { validationResult } = require("express-validator");
const protect = require("../middleware/authmiddleware");


router.get("/search", protect, product.searchItems);
router.post("/", protect, createItemValidator, product.createItem);
router.get("/", protect, product.getItems);
router.get("/:id", protect, product.getItem);
router.put("/:id", protect, updateItemValidator, product.updateItem);
router.delete("/:id", protect, product.deleteItem);

module.exports = router;