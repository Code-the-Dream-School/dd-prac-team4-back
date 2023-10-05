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
    const user = req.user; //contains user object
    console.log(user);

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
    await order.save({ session });

    await session.commitTransaction();

    //Frontend will pass the clientSecret (he gets from here)to Stripe. This is how Stripe authenticates and knows that this frontend is legitimately handling a Stripe payment for the user
    res
      .status(StatusCodes.CREATED)
      .json({ clientSecret: paymentIntent.client_secret, order });
  } catch (error) {
    // Handle errors and rollback the transaction if any part of the try/catch fails
    await session.abortTransaction();

    console.error('Error while processing the order:', error);

    res.status(500).json({ error: 'Internal server error' });
  } finally {
    session.endSession();
  }

  /*
  #swagger.summary = 'Create a new order and process payment'
  #swagger.description = 'Creates a new order and processes payment using Stripe.'
  #swagger.tags = ['Orders']
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Order information including order items, subtotal, tax, and total',
    required: true,
    schema: {
      $ref: '#/definitions/NewOrder' 
    },
  }
  #swagger.responses[201] = {
    description: 'Order created successfully',
    schema: { order: { $ref: '#/definitions/Order' } }
  }
  */
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
  /*
  #swagger.summary = 'Fetch all orders in a database'
  #swagger.description = '**ROLE REQUIRED:** admin'
  #swagger.responses[200] = {
    description: 'Orders successfully fetched.',
    schema: { $ref: '#/definitions/OrderList' } 
  }
  */
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

  checkPermissions(req.user, order.user._id);

  res.status(StatusCodes.OK).json({ order });
  /*
  #swagger.summary = 'Fetch an order by id'
  #swagger.parameters['id'] = {
    description: 'Mongo ObjectID of the order to fetch',
  }
  #swagger.responses[200] = {
    description: 'Order successfully fetched.',
    schema: { order: { $ref: '#/definitions/Order' } }
  }
  #swagger.responses[404] = { description: 'No order with id found.' }
  */
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
  /*
  #swagger.summary = 'Delete an order by id'
  #swagger.description = '**ROLE REQUIRED:** user or admin'
  #swagger.parameters['id'] = {
    description: 'Mongo ObjectID of the order to delete',
  }
  #swagger.responses[200] = {
    description: 'The order was successfully deleted.',
    schema: { msg: 'Success! Order was deleted' }
  }
  #swagger.responses[404] = { description: 'No order with id found.' }
  */
};

const handleStripePayment = async (req) => {
  try {
    // Receive Stripe Signature
    const stripeSignature = req.headers['stripe-signature'];

    //  Construct the Webhook Event
    const event = stripe.webhooks.constructEvent(
      req.rawBody, // Raw text body payload received from Stripe
      stripeSignature, // Value of the `stripe-signature` header from Stripe
      process.env.STRIPE_CLI_WEBHOOK_SECRET // Webhook Signing Secret
    );

    //  Retrieve Payment Intent and Order Information
    const paymentIntent = event.data.object; // Payment intent information
    const orderId = paymentIntent.metadata.orderId; // Order ID passed in metadata
    const amountPaid = paymentIntent.amount; // Amount paid
    // Additional order-related info if needed

    //  Update Order Status
    const order = await Order.findById(orderId);

    if (event.type === 'payment_intent.succeeded') {
      // Update order status to successful
      order.status = 'payment_successful';
    } else if (event.type === 'payment_intent.payment_failed') {
      // Update order status to failed
      order.status = 'payment_failed';
    }

    // Save the updated order
    await order.save();

    // Handle other actions based on the event type if needed

    return { success: true };
  } catch (error) {
    console.error('Error handling Stripe payment:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  deleteOrder,
  handleStripePayment,
};
