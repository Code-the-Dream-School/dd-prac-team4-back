const { Order } = require('../models/Order');
const { StatusCodes } = require('http-status-codes');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { BadRequestError } = require('../errors');
const PurchasedAlbum = require('../models/PurchasedAlbum');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const mongoose = require('mongoose');

const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { orderItems, subtotal, tax, total } = req.body;

    if (!orderItems?.length) {
      throw new BadRequestError(
        'Unable to create an order because the order items are missing.'
      );
    }
    // Fetch user information from the request object
    const user = req.user;

    const order = new Order({
      user: req.user.userId,
      orderItems, // Use the array with full album data
      subtotal,
      tax,
      total,
    });

    await order.save({ session });

    for (const orderItem of orderItems) {
      const purchasedAlbum = new PurchasedAlbum({
        album: orderItem.album,
        user: req.user.userId,
      });

      await purchasedAlbum.save({ session });
    }
    //Server  tells Stripe that an order is being made (creating a "paymentIntent" object in Stripe)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100,
      currency: 'usd',
      description: `Order #${order._id}`,
      metadata: {
        userId: req.user.userId,
        orderId: order._id,
        totalQuantity: orderItems.reduce(
          (total, item) => total + item.quantity,
          0
        ),
        totalAlbums: orderItems.length,
      },
    });
//Stripe  gives the server the paymentIntent object. The server will save the id of this object in the Order document so that we can easily associate the two. 
    order.paymentIntentId = paymentIntent.id;
    //this is where the payment happens? so if it's successful -we change orderStatus to'complete'? then we should save this new status is a db - that triggers a save middleware in Order.js that sends email of order being paid?
    await order.save({ session });

    await session.commitTransaction();
//Frontend will pass the clientSecret (he gets from here)to Stripe. This is how Stripe authenticates and knows that this frontend is legitimately handling a Stripe payment for the user
    res
      .status(StatusCodes.CREATED)
      .json({ clientSecret: paymentIntent.client_secret, order });
  } catch (error) {
    // Handle errors and rollback the transaction if it fails
    await session.abortTransaction();

    console.error('Error while processing the order:', error);

    res.status(500).json({ error: 'Internal server error' });
  } finally {
    session.endSession();
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
