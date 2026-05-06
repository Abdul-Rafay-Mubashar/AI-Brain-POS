const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema({

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },

    nameSnapshot: String,
    priceSnapshot: Number,
    salePriceSnapshot: Number,

    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
});

const billSchema = new mongoose.Schema(
    {
        billNo: {
            type: String,
            unique: true,
            required: true
        },
        items: [billItemSchema],

        totalCost: Number,
        totalSale: Number,
        totalProfit: Number,

        billDate: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);