const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB database"))
  .catch((error) => console.error("Failed to connect to MongoDB:", error));

module.exports = mongoose.connection;