const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    logger.error("MONGO_URI environment variable is not set!");
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    logger.info(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(` MongoDB Connection Error: ${error.message}`);


    setTimeout(() => process.exit(1), 3000);
  }
};

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  logger.info("MongoDB connection closed due to app termination.");
  process.exit(0);
});

module.exports = connectDB;
