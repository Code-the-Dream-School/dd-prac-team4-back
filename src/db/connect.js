const mongoose = require('mongoose');

const connectDB = (url) => {
  // Function to connect to the MongoDB database
  mongoose.set('strictQuery', true);
  return mongoose.connect(url); // Establish a connection to the specified URL
};

module.exports = connectDB;
