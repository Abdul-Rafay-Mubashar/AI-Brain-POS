const Product = require("../models/product");
const axios = require("axios");
// Create Item
exports.createItem = async (req, res) => {
  try {
    const existingItem = await Product.findOne({ name: req.body.name });

    if (existingItem) {
      return res.status(400).json({
        error: "Product with this name already exists",
      });
    }

    const item = await Product.create(req.body);

    try {
      await axios.post(`${process.env.FASTAPI_BASE_URL}/api/product/add-product`, {
        id: item._id.toString(),
        name: item.name,

      });
    } catch (aiErr) {
      console.error("AI Sync Failed:", aiErr.message);
    }
    res.status(201).json(item);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Items
exports.getItems = async (req, res) => {
  try {
    const items = await Product.find().lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single Item
exports.getItem = async (req, res) => {
  try {
    const item = await Product.findById(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {

    const existingItem = await Product.findById(req.params.id);

    if (!existingItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    let updatedQuantity;
    if (req.body.stock >= 1) {
      updatedQuantity = existingItem.quantity + req.body.stock;
    } else if (req.body.stock === 0 && req.body.quantity > 0) {
      updatedQuantity = req.body.quantity;
    }
    const item = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        quantity: updatedQuantity,
      },
      { returnDocument: "after" }
    );
    try {
      await axios.put(`${process.env.FASTAPI_BASE_URL}/api/product/update-product`, {
        product_id: item._id.toString(),
        new_name: item.name,

      });
    } catch (aiErr) {
      console.error("AI Sync Failed:", aiErr.message);
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Item
exports.deleteItem = async (req, res) => {
  try {

    await Product.findByIdAndDelete(req.params.id);
    try {
      await axios.delete(`${process.env.FASTAPI_BASE_URL}/api/product/delete-product`, {
        data: {
          product_id: req.params.id.toString()
        }
      });
    } catch (aiErr) {
      console.error("AI Sync Failed:", aiErr.message);
    }
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchItems = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      const items = await Product.find();
      return res.json(items);
    }

    const items = await Product.find({
      name: { $regex: q, $options: "i" }
    });

    res.json(items);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};