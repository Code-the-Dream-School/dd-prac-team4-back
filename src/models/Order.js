const mongoose = require('mongoose');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

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
      enum: [
        'pending',
        'payment_successful',
        'payment_failed',
        'cancelled',
        'complete',
      ],
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

// Create a function to update order statuses
const updateOrderStatus = async () => {
  try {
    
let isDevelopment = process.env.NODE_ENV !== 'production';
const timeDuration = isDevelopment
  ? parseInt(process.env.DEV_TIME_DURATION)
  : parseInt(process.env.PROD_TIME_DURATION);
// Get the current date and subtract __x   minutes
const oneMinutesAgo = new Date(Date.now() - timeDuration);

    // Update orders with a status of "pending" that were created x time ago or earlier,
    // and set the order status to "cancelled"
    const result = await Order.updateMany(
      { orderStatus: 'pending', createdAt: { $lte: oneMinutesAgo } },
      { $set: { orderStatus: 'cancelled' } }
    );
    console.log('Update result:', result);
  } catch (error) {
    console.error('Error updating orders:', error);
  }
};

// Call the updateOrderStatus function every .... x time

//const intervalId = setInterval(updateOrderStatus, process.env.PROD_TIME_DURATION); //prod 1h
const intervalId = setInterval(updateOrderStatus, process.env.DEV_TIME_DURATION); // dev 20h

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
// TTL (Time To Live) index to automatically delete orders with "cancelled" status after 2 hours
OrderSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 7200,
    partialFilterExpression: { orderStatus: 'cancelled' },
  }
);

const Order = mongoose.model('Order', OrderSchema);

// Export intervalId as well, so that we can clear the interval when the server is stopped
module.exports = { Order, intervalId };
