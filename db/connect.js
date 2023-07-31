const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const connectDB = (url) => {
  return mongoose.connect(url);
};

module.exports = connectDB;
