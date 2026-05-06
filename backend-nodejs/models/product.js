const mongoose = require("mongoose");


const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Quantity cannot be negative"], 
    },

    price: {
      type: Number,
      required: true,
      min: [1, "Price must be at least 1"], 
    },

    category: {
      type: String,
      default: "Light",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);