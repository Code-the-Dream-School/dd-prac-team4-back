const { Order } = require('../models/Order');
const { StatusCodes } = require('http-status-codes');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { BadRequestError } = require('../errors');
const PurchasedAlbum = require('../models/PurchasedAlbum');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const { sendOrderCompletedEmail } = require('../mailing/sender');
const mongoose = require('mongoose');


const createOrder = async (req, res) => {
  try {
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
      orderItems,
      subtotal,
      tax,
      total,
    });

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100, // Stripe requires amount in cents
      currency: 'usd',
      description: `Order #${order._id}`,
      metadata: {
        userId: req.user.userId,
        orderId: order._id, // key-values
        totalQuantity: orderItems.reduce(
          (total, item) => total + item.quantity,
          0
        ), // the total number of items in the order
        totalAlbums: orderItems.length, // the total number of albums purchased in order
      },
    });

    // Save the paymentIntent to the Order model
    order.paymentIntentId = paymentIntent.id;
    

    // Create PurchasedAlbum entries for each album in orderItems
    for (const orderItem of orderItems) {
      await PurchasedAlbum.create({
        album: orderItem.album, // album ID from orderItem
        user: req.user.userId, // user ID from the request
      });
    }



    // Start a database transaction Using Mongoose's default connection
const session = await mongoose.startSession(); 

    // Save the order to the database
    const savedOrder = await db.saveOrder(orderData);

    // Send the order completion email
    await sendOrderCompletedEmail(user.email, user.name);

    // Commit the database transaction
/////////////////////////////////////////

    // Send the payment intent client secret and order information to the client
    res
      .status(StatusCodes.CREATED)
      .json({ clientSecret: paymentIntent.client_secret, order });
  } catch (error) {
    // Handle errors and rollback the transaction if it fails
 //////////////////////////////

    // Handle and log the error
    console.error('Error while processing order:', error);

    // Return an error response to the frontend
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  // Fetch the order using the provided orderId and populate user information
  const order = await Order.findById(orderId).populate({
    path: 'user',
    options: { select: { password: 0 } },
  });

  if (!order) {
    throw new CustomError.NotFoundError(`No order with id ${orderId}`);
  }

  checkPermissions(req.user, order.user);

  res.status(StatusCodes.OK).json({ order });
};

const deleteOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findById(orderId);
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id ${orderId}`);
  }
  checkPermissions(req.user, order.user);

  await Order.findByIdAndDelete(orderId); // or more simply can just call delete on the documnent we've already fetched:  await order.remove()

  res.status(StatusCodes.OK).json({ msg: 'Success! Order was deleted' });
};

module.exports = { createOrder, getAllOrders, getSingleOrder, deleteOrder };
