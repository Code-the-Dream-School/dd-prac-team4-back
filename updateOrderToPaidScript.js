// <backend repo>/updateOrderToPaidScript.js

require('dotenv').config();
const { Order } = require('./src/models/Order');
const { connectDB } = require('./src/expressServer');

async function run() {
  try {
    // get arguments from command line
    const args = process.argv.slice(2); //In Node.js, process.argv is an array that contains the command-line arguments passed when invoking the Node.js process + The slice(2) method is used on process.argv to extract elements starting from index 2
    // script should be run by calling this file with order id as the first argument, eg: `node payOrderScript.js <orderId>`
    const orderId = args[0];

    if (!orderId) {
      console.error('Please provide an order id as an argument.');
      process.exit(1); //indicating an unsuccessful or erroneous execution of the script
    }

    await connectDB(process.env.MONGO_URL);

    // update order status to payment_successful
    // this should also result in an email being sent due to the post-save middleware in Order.js
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: 'payment_successful' },
      { new: true }
    );

    console.log('Order updated successfully.\n', updatedOrder);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();

//run the script by calling node updateOrderToPaidScript paste-some-order-id-from-the-database-here command in  terminal
