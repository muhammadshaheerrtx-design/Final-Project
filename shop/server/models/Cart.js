const mongoose = require("mongoose");

// A cart item doesn't need its own model — it's a subdocument, embedded
// directly inside the Cart. It only stores a reference to the Product
// (not a copy of its data), so price/name are always looked up fresh.
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "quantity must be at least 1"],
    },
  },
  { _id: false } // subdocuments here don't need their own _id
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // enforces exactly one cart per user at the DB level
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
