require('dotenv').config();
const mongoose = require('mongoose');
const { sendOrderCompletedEmail } = require('./sender');
const User = require('../models/User');
const Order = require('../models/Order');
const CustomError = require('../errors');

// Connect to the MongoDB database
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
}

connectToDatabase();


//not sure how this fn is triggered- here it is because  we pass userId but in production it should listen to changes in mongo for order to have status: complete and send it automatically?
async function sendOrderCompletedEmailToUser(userId) {
  try {
    // Find the user by their user ID
    const user = await User.findById(userId);

    if (!user) {
      // Throw a NotFoundError if the user is not found
      throw new CustomError.NotFoundError(`No user was found`);
    }

    // Check if the user has an order with the 'complete' status
    const order = await Order.findOne({
      userId: user._id,
      orderStatus: 'complete',
    });

    if (!order) {
      // If no 'complete' order is found for the user, do nothing
      console.log(`No 'complete' order found for user: ${user.name}`);
      return;
    }

    // Send the order completed email to the user
    const response = await sendOrderCompletedEmail(user.email, user.name);

    console.log('Order completed email sent successfully:', response);
  } catch (error) {
    console.error('Error sending order completed email:', error);
  }
}

// Call the function with the user's ID as an argument
sendOrderCompletedEmailToUser(process.env.TEST_USER_ID);
