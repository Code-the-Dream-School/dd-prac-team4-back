const { Order } = require('../models/Order');
const { StatusCodes } = require('http-status-codes');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { BadRequestError } = require('../errors');

const createOrder = async (req, res) => {
  const { orderItems, subtotal, tax, total } = req.body;

  // Perform necessary checks and validations
  if (!orderItems?.length) {
    throw new BadRequestError(
      'Unable to create order because the order items are missing.'
    );
  }

  // Create an Order document in the database
  const order = await Order.create({
    user: req.user.userId,
    orderItems: orderItemObjects,
    subtotal,
    tax,
    total,
  });

  // Create a payment intent with Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: total * 100, // Stripe requires amount in cents
    currency: 'usd',
    description: `Order #${order._id}`,
  });

  // Save the paymentIntent to the Order model
  order.paymentIntentId = paymentIntent.id;
  await order.save();

  // Send the payment intent client secret and order information to the client
  res
    .status(StatusCodes.CREATED)
    .json({ clientSecret: paymentIntent.client_secret, order });
};

module.exports = { createOrder };
