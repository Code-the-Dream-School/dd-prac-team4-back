const mongoose = require('mongoose');

const { sendOrderCompletedEmail } = require('../mailing/sender');
const { sendOrderCancelledEvent } = require('../live/emitters');


// mongoose schema for the individual order items
const OrderItemSchema = new mongoose.Schema({
  // The album field references the Album model and is required
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album', // Referencing the Album model
    required: true,
  },
  // The quantity field specifies the number of items in the order
  quantity: {
    type: Number,
    required: true, // Quantity is required
    min: 1, // Minimum quantity allowed is 1
  },
});

// Schema for the main Order model
const OrderSchema = new mongoose.Schema(
  {
    // The user field references the User model and is required
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Referencing the User model
      required: [true, 'Please provide user'],
    },
    // The orderStatus field indicates the current status of the order
    orderStatus: {
      type: String,
      enum: ['pending', 'payment_successful', 'payment_failed', 'cancelled'],
      default: 'pending',
      required: [true, 'Please provide an order status'], // Order status is required
    },
    // The tax field represents the tax percentage applied to the order
    tax: {
      type: Number,
      required: [true, 'Please provide a tax percentage'], // Tax percentage is required
      min: [0, 'Tax percentage must be at least 0'], // Tax percentage must be at least 0
      max: [1, 'Tax percentage must be at most 1'], // Tax percentage must be at most 1
    },
    // The subtotal field represents the total price before taxes
    subtotal: {
      type: Number,
      required: [true, 'Please provide a subtotal'],
      min: [0, 'Subtotal must be at least 0'],
    },
    // The total field represents the total price after taxes
    total: {
      type: Number,
      required: [true, 'Please provide a total'],
      min: [0, 'Total must be at least 0'],
    },
    // The paymentIntentId field stores the Stripe state of the purchase
    paymentIntentId: String, // Payment intent ID is a string
    orderItems: [OrderItemSchema],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

//defining time duration for prod and dev modes
let isDevelopment = process.env.NODE_ENV !== 'production';
const timeDuration = isDevelopment
  ? parseInt(process.env.DEV_ORDER_EXPIRY_DURATION)
  : parseInt(process.env.PROD_ORDER_EXPIRY_DURATION);

// Create a function to update order statuses
const updateOrderStatus = async () => {
  try {
    const expiryTimeSinceCreation = new Date(Date.now() - timeDuration);

    const ordersToUpdate = await Order.aggregate([
      {
        $match: {
          orderStatus: 'pending',
          createdAt: { $lte: expiryTimeSinceCreation },
        },
      },
      { $group: { _id: '$user', orders: { $push: '$$ROOT' } } },
    ]);
    console.log('ordersToUpdate:', ordersToUpdate);

    for (const userOrders of ordersToUpdate) {
      console.log('Attempting to update orders for user:', userOrders._id);

      // Update orders for each user
      await Order.updateMany(
        { _id: { $in: userOrders.orders.map((order) => order._id) } },
        { $set: { orderStatus: 'cancelled' } }
      );

      sendOrderCancelledEvent(userOrders);
      console.log('Orders updated for user:', userOrders._id);
    }

    console.log('Update result:', ordersToUpdate);
  } catch (error) {
    console.error('Error updating orders:', error);
  }
};

// Call the updateOrderStatus function every .... x time
let intervalId;
if (
  process.env.NODE_ENV !== 'test' ||
  process.env.START_ORDER_INTERVAL === 'true'
) {
  intervalId = setInterval(
    updateOrderStatus,
    timeDuration // in prod 1hr, in dev 20hrs
  );
}

// Middleware: Update order statuses before executing a find operation
OrderSchema.pre('find', async function (next) {
  console.log('Pre-find started');
  // Call the updateOrderStatus function to update order statuses
  await updateOrderStatus();
  console.log('Pre-find finished');
  next();
});

// Middleware: Update order statuses before executing a findOne operation
OrderSchema.pre('findOne', async function (next) {
  console.log('Pre-findOne started');
  // Call the updateOrderStatus function to update order statuses
  await updateOrderStatus();
  console.log('Pre-findOne finished');
  next();
});

// send order completion email when the order status changes to "payment_successful"
OrderSchema.post('findOneAndUpdate', async function (doc) {
  try {
    if (this.getUpdate().$set.orderStatus === 'payment_successful') {
      //   populate by calling await + populate(...) and we can chain populate calls by using an array. This allows us to populate both the full user object and the full orderItems.album objects
      const orderItemsWithFullAlbum = await doc.populate([
        'user',
        { path: 'orderItems.album' },
      ]);
      // Send the order completion email
      await sendOrderCompletedEmail(
        orderItemsWithFullAlbum.user.email,
        orderItemsWithFullAlbum.user.username, // Use the appropriate field for the username
        orderItemsWithFullAlbum.orderItems,
        orderItemsWithFullAlbum.total
      );
    }
  } catch (error) {
    console.error('Error sending order completion email:', error);
  }
});

// TTL (Time To Live) index to automatically delete orders with "cancelled" status after 2 hours
OrderSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 7200, // Expire after 2 hours
    partialFilterExpression: { orderStatus: 'cancelled' },
  }
);

const Order = mongoose.model('Order', OrderSchema);

// Export intervalId as well, so that we can clear the interval when the server is stopped
module.exports = { Order, intervalId };
