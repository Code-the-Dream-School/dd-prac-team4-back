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

// Create the OrderItem model using the defined schema
const OrderItem = mongoose.model('OrderItem', orderItemSchema);

// Schema for the main Order model
const orderSchema = new mongoose.Schema(
  {
    // The user field references the User model and is required
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Referencing the User model
      required: true,
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
      required: true, // Order status is required
    },
    // The tax field represents the tax percentage applied to the order
    tax: {
      type: Number,
      required: true, // Tax percentage is required
      min: 0, // Tax percentage must be at least 0
      max: 1, // Tax percentage must be at most 1
    },
    // The subtotal field represents the total price before taxes
    subtotal: {
      type: Number,
      required: true,
    },
    // The total field represents the total price after taxes
    total: {
      type: Number,
      required: true,
    },
    // The paymentIntentId field stores the Stripe state of the purchase
    paymentIntentId: String, // Payment intent ID is a string
    orderItems: [orderItemSchema],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

// Middleware: Update order status for pending orders older than 10 minutes
orderSchema.pre('find', async function (next) {
  // Create a date object representing the time 10 minutes ago
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  // Update all orders with a "pending" status and that were created before or equal to 10 minutes ago
  await this.updateMany(
    { orderStatus: 'pending', createdAt: { $lte: tenMinutesAgo } },
    { $set: { orderStatus: 'cancelled' } } // Set the order status to "cancelled"
  );
  next();
});

// updates the status of orders with a "pending" status that were created more
// than 10 minutes ago to "cancelled". This happens before executing a findOne operation.
orderSchema.pre('findOne', async function (next) {
  // Get the current date and subtract 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  // Find orders with "pending" status created more than 10 minutes ago
  // and change their status to "cancelled"
  await this.updateMany(
    { orderStatus: 'pending', createdAt: { $lte: tenMinutesAgo } },
    { $set: { orderStatus: 'cancelled' } }
  );
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = { OrderItem, Order };
