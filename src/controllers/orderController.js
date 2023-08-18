const { Order, OrderItem } = require('../models/Order');
const { StatusCodes } = require('http-status-codes');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { BadRequestError } = require('../errors');

const createOrder = async (req, res) => {
  const { orderItems, subtotal, tax } = req.body;

  try {
    // Create an array of OrderItem objects
    const orderItemObjects = orderItems.map(item => new OrderItem(item));
    // Calculate the total price including tax
    const total = subtotal + (subtotal * tax);

    // Perform necessary checks and validations
    if (orderItems.length === 0) {
      throw new BadRequestError('Unable to create order because the order items are missing.'); 
    }

    // Create an Order document in the database
    const order = await Order.create({
      user: req.user.userId,
      orderItems: orderItemObjects,
      subtotal,
      tax,
      total,
      orderStatus: 'pending', // Set initial order status as pending
    });

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100, // Stripe requires amount in cents
      currency: 'usd',
      description: `Order #${order._id}`,
    });

    // Send the payment intent client secret and order information to the client
    res.status(StatusCodes.CREATED).json({ clientSecret: paymentIntent.client_secret, order });
  } catch (error) {
    if (error instanceof BadRequestError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  }
};

module.exports = { createOrder };