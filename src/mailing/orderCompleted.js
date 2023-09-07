require('dotenv').config();
const mongoose = require('mongoose');
const { sendOrderCompletedEmail } = require('./sender');
const User = require('../models/User');
const CustomError = require('../errors');

const TEST_RECIPIENT_EMAIL = process.env.TEST_RECIPIENT_EMAIL;

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

async function main() {
  try {
    const user = await User.findOne({
      email: process.env.TEST_RECIPIENT_EMAIL,
    });
    console.log(user);

    if (!user) {
      // Throw a NotFoundError if the user is not found
      throw new CustomError.NotFoundError(`No user was found`);
    }
    const response = await sendOrderCompletedEmail(
      TEST_RECIPIENT_EMAIL,
      user.name
    );
    console.log('Order completed email sent successfully:', response);
  } catch (error) {
    console.error('Error sending order completed email:', error);
  }
}

main();
