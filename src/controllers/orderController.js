const { Order } = require('../models/Order');
const { StatusCodes } = require('http-status-codes');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { BadRequestError } = require('../errors');
const PurchasedAlbum = require('../models/PurchasedAlbum');
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
  await order.save();

  // Create PurchasedAlbum entries for each album in orderItems
  for (const orderItem of orderItems) {
    await PurchasedAlbum.create({
      album: orderItem.album, // album ID from orderItem
      user: req.user.userId, // user ID from the request
    });
  }

  // Send the payment intent client secret and order information to the client
  res
    .status(StatusCodes.CREATED)
    .json({ clientSecret: paymentIntent.client_secret, order });
  /*
#swagger.summary = 'Create a new order and process payment'
#swagger.description = 'Creates a new order and processes payment using Stripe.'
#swagger.tags = ['Orders']
#swagger.parameters['body'] = {
  in: 'body',
  description: 'Order information including order items, subtotal, tax, and total',
  required: true,
  schema: {
    type: 'object',
    properties: {
      orderItems: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            album: {
              type: 'string',
              description: 'ID of the album',
            },
            quantity: {
              type: 'integer',
              description: 'Quantity of the album',
            },
          },
        },
      },
      subtotal: {
        type: 'number',
        description: 'Subtotal amount',
      },
      tax: {
        type: 'number',
        description: 'Tax amount',
      },
      total: {
        type: 'number',
        description: 'Total amount',
      },
    },
  },
}
#swagger.responses[201] = {
  description: 'Order created successfully',
  schema: { $ref: '#/definitions/Order' }
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
        schema: { $ref: '#/definitions/Order' }
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

  checkPermissions(req.user, order.user);

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
#swagger.description = '**ROLE REQUIRED:** user'
#swagger.parameters['id'] = {
  description: 'Mongo ObjectID of the order to delete',
}
#swagger.responses[200] = {
  description: 'The order was successfully deleted.',
}
#swagger.responses[404] = { description: 'No order with id found.' }
*/
};

module.exports = { createOrder, getAllOrders, getSingleOrder, deleteOrder };
