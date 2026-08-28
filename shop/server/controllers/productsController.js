const mongoose = require("mongoose");
const Product = require("../models/Product");
const { sendSuccess, sendError } = require("../utils/response");

async function getAllProducts(req, res, next) {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;
    const filter = {};

    if (search) filter.name = { $regex: search, $options: "i" };
    if (category) filter.category = category.toLowerCase();
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
    };
    const sortOption = sortMap[sort] || sortMap.newest;

    const products = await Product.find(filter).sort(sortOption);
    sendSuccess(res, 200, products, { count: products.length });
  } catch (err) {
    next(err);
  }
}

async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid product id");
    }

    const product = await Product.findById(id);
    if (!product) {
      return sendError(res, 404, `Product ${id} not found`);
    }

    sendSuccess(res, 200, product);
  } catch (err) {
    next(err);
  }
}

// Admin-only from here down (requireAuth + requireAdmin at the route level).

async function createProduct(req, res, next) {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;
    const product = await Product.create({ name, description, price, category, imageUrl, stock });
    sendSuccess(res, 201, product);
  } catch (err) {
    next(err);
  }
}

async function replaceProduct(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid product id");
    }

    const { name, description, price, category, imageUrl, stock } = req.body;
    const updated = await Product.findByIdAndUpdate(
      id,
      { name, description, price, category, imageUrl, stock },
      { new: true, runValidators: true, overwrite: true }
    );

    if (!updated) return sendError(res, 404, `Product ${id} not found`);
    sendSuccess(res, 200, updated);
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid product id");
    }

    const updated = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return sendError(res, 404, `Product ${id} not found`);
    sendSuccess(res, 200, updated);
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid product id");
    }

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return sendError(res, 404, `Product ${id} not found`);

    sendSuccess(res, 200, null, { message: `Product ${id} deleted` });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  replaceProduct,
  updateProduct,
  deleteProduct,
};
