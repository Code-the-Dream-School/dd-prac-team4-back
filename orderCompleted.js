require('dotenv').config();
const mongoose = require('mongoose');
const { sendOrderCompletedEmail } = require('./src/mailing/sender');
const User = require('./src/models/User');
const { Order } = require('./src/models/Order');
const CustomError = require('./src/errors');
const Album = require('./src/models/Album');
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

async function sendOrderCompletedEmailToUser(userId) {
  try {
    await connectToDatabase();
    // Find the user by their user ID
    const user = await User.findById(userId);

    if (!user) {
      // Throw a NotFoundError if the user is not found
      throw new CustomError.NotFoundError(`No user was found`);
    }
    const username = user.username;
    console.log('User ID:', user._id);
    // Check if the user has an order with the 'payment_successful' status
    const order = await Order.findOne({
      user: user._id,
      orderStatus: 'payment_successful',
    });

    if (!order) {
      // If no 'payment_successful' order is found for the user, do nothing
      console.log(`No 'payment_successful' order found for user: ${user.name}`);
      return;
    }
    console.log('ORDER:', order._id);
    // Define order items
    const orderItemsWithFullAlbum = await order.populate([
      'user',
      { path: 'orderItems.album' },
    ]); //populate the user field in the order document.

    console.log('CHECK IT OUT, ITS POPULATED ORDER:', orderItemsWithFullAlbum);
    console.log('CHECK ORDER items:', orderItemsWithFullAlbum.orderItems);

    const orderArray = orderItemsWithFullAlbum.orderItems; // array of albums in one order
    const albumNames = orderArray.map((item) =>
      item.album ? item.album.albumName : null
    );

    //got album names
    console.log('CHECK ORDER items album nameS:', albumNames);
    const total = order.total;
    console.log('TOTAL OF ORDER:', total);
    // Send the order completed email to the user
    const response = await sendOrderCompletedEmail(
      orderItemsWithFullAlbum.user.email,
      username, // Use the appropriate field for the username
      orderArray,
      orderItemsWithFullAlbum.total
    );
    console.log('Order completed email sent successfully:', response);
  } catch (error) {
    console.error('Error sending order completed email:', error);
  }
}

//for manual testing run : node -r dotenv/config src/mailing/orderCompleted.js in terminal + check process.env.TEST_USER_ID in .env/mongodb
// Call the function with the user's ID as an argument
sendOrderCompletedEmailToUser(process.env.TEST_USER_ID);
