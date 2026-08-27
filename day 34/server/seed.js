const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Product = require("./models/Product"); // Update this path to your Product model

// Replace with your MongoDB connection URL
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://muhammadshaheerrtx_db_user:OQqkxh7ZVgOkCdBy@ac-6nfv3li-shard-00-00.e3oej8n.mongodb.net:27017,ac-6nfv3li-shard-00-01.e3oej8n.mongodb.net:27017,ac-6nfv3li-shard-00-02.e3oej8n.mongodb.net:27017/?ssl=true&replicaSet=atlas-a5kgtp-shard-0&authSource=admin&appName=Cluster1";

const CATEGORIES = [
  "electronics",
  "clothing",
  "home & kitchen",
  "books",
  "sports",
  "beauty",
  "toys",
];

const generateProducts = (count = 500) => {
  const products = [];

  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(CATEGORIES);

    products.push({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 5, max: 1000, dec: 2 })),
      category: category.toLowerCase(), // Schema requires lowercase
      imageUrl: faker.image.urlLoremFlickr({ category: "product" }),
      stock: faker.number.int({ min: 0, max: 200 }),
    });
  }

  return products;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    // Optional: Clear existing products before seeding
    await Product.deleteMany({});
    console.log("Cleared existing products.");

    // Generate 500 dummy product objects
    const productData = generateProducts(500);

    // Insert into database in bulk
    await Product.insertMany(productData);
    console.log("Successfully seeded 500 products!");

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
