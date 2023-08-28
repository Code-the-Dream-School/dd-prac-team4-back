const { Order } = require('../models/Order');
const { StatusCodes } = require('http-status-codes');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { BadRequestError } = require('../errors');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

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
    orderItems: orderItems,
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

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id ${orderId}`);
  }

  checkPermissions(req.user, order.user);

  res.status(StatusCodes.OK).json({ order });
};

const deleteOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOneAndDelete({ _id: orderId });

  if (!order) {
    throw new CustomError.NotFoundError(`No order with id ${orderId}`);
  }
  checkPermissions(req.user, order.user);

  res.status(StatusCodes.OK).json({ msg: 'Success! Order was deleted' });
};

module.exports = { createOrder, getAllOrders, getSingleOrder, deleteOrder };
