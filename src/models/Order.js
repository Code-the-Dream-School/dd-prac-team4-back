const mongoose = require('mongoose');

// mongoose schema for the individual order items
const orderItemSchema = new mongoose.Schema({
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
const orderSchema = new mongoose.Schema(
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
    orderItems: [orderItemSchema],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

// Create a function to update order statuses
const updateOrderStatus = async () => {
  try {
    // Get the current date and subtract 1 minute
    const oneMinutesAgo = new Date(Date.now() - 1 * 60 * 1000);

    // Update orders with a status of "pending" that were created 1 minute ago or earlier,
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

// Call the updateOrderStatus function every 1 minute (60 * 1000 milliseconds)
setInterval(updateOrderStatus, 1 * 60 * 1000);

// Middleware: Update order statuses before executing a find operation
orderSchema.pre('find', async function (next) {
  console.log('Pre-find started');
  // Call the updateOrderStatus function to update order statuses
  await updateOrderStatus();
  console.log('Pre-find finished');
  next();
});

// Middleware: Update order statuses before executing a findOne operation
orderSchema.pre('findOne', async function (next) {
  console.log('Pre-findOne started');
  // Call the updateOrderStatus function to update order statuses
  await updateOrderStatus();
  console.log('Pre-findOne finished');
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = { Order };
