require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./db");
const authRouter = require("./routes/auth");
const productsRouter = require("./routes/products");
const cartRouter = require("./routes/cart");
const couponsRouter = require("./routes/coupons");
const ordersRouter = require("./routes/orders");
const requestLogger = require("./middleware/requestLogger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set in .env");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.CORS_ORIGIN || "*").split(",").map((o) => o.trim());
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} is not allowed`));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Commerce Storefront API",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      cart: "/api/cart",
      coupons: "/api/coupons",
      orders: "/api/orders",
    },
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/coupons", couponsRouter);
app.use("/api/orders", ordersRouter);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT} (${process.env.NODE_ENV || "development"} mode)`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB. Server not started.");
    console.error(err.message);
    process.exit(1);
  }
}

start();
