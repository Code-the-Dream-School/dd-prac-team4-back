require('dotenv').config();
const mongoose = require('mongoose');
const { sendTestEmail } = require('./sender');
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

// // Call the async function to connect to the database
connectToDatabase();

// //send to all users in a db
// async function sendEmailToAllUsers() {
//   try {
//     // Find all users in the database
//     const users = await User.find({});

//     if (users.length === 0) {
//       // Handle the case when there are no users in the database
//       console.log('No users found in the database.');
//       return;
//     }

//     // Loop through each user and send an email
//     for (const user of users) {
//       const response = await sendTestEmail(user.email, user.name);
//       console.log(`Test email sent to ${user.name} (${user.email}) successfully:`, response);
//     }
//   } catch (error) {
//     console.error('Error sending test emails:', error);
//   }
// }

// //Call the function to send emails to all users
// sendEmailToAllUsers();

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
    const response = await sendTestEmail(TEST_RECIPIENT_EMAIL, user.name);
    console.log('Test email sent successfully:', response);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

main();
