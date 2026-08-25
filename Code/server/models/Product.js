const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
    price: {
      type: Number,
      required: [true, "price is required"],
      min: [0, "price must be a positive number"],
    },
    category: {
      type: String,
      required: [true, "category is required"],
      trim: true,
      lowercase: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "stock cannot be negative"],
      default: 0,
    },
  },
  { timestamps: true }
);

// Speeds up the two most common query patterns: filtering by category,
// and text search on name/description (see productsController.js).
productSchema.index({ category: 1 });
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
