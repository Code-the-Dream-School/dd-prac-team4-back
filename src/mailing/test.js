require('dotenv').config();
const mongoose = require('mongoose');
const { sendTestEmail } = require('./sender');
const User = require('../models/User'); 
const CustomError = require('../errors');

const TEST_RECIPIENT_EMAIL = process.env.TEST_RECIPIENT_EMAIL;

// Connect to the MongoDB database
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function main() {
  try {
    //was trying to add a custom user name from db to the email -needs changes on line 19->  User.findOne({ _id: id })
    const id = '64d44bc8337399ccf9ad7e4d'
    const user = await User.findOne({ _id: id }).select('-password');
    console.log(user);
    
  if (!user) {
    // Throw a NotFoundError if the user is not found
    throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`);
  }
    const response = await sendTestEmail(TEST_RECIPIENT_EMAIL, user.name);
        console.log('Test email sent successfully:', response);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

main();
