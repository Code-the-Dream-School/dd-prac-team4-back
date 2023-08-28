const { Order } = require('../models/Order');
const { StatusCodes } = require('http-status-codes');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { BadRequestError } = require('../errors');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const createOrder = async (req, res) => {
  //process order
  const processOrder = async (resultsMap, item) => {
    // Each iteration, item will be the next item in the array.  resultsMap represents the accumulator, which will hold the intermediate results during the reduction process. item represents the current item being processed from the cartItems array.
    //resultsMap will be whatever we return at the end of the reduce function, and the first time it will be equal to `initialValue` (because we pass that to reduce as the second argument )
    const dbAlbum = await Album.findOne({ _id: item.album});
    console.log(
      `looping through: resultsMap=${JSON.stringify(
        await resultsMap
      )} | item=${JSON.stringify(item)} | dbAlbum=${dbAlbum}`
    );

    if (!dbAlbum) {
      throw new CustomError.NotFoundError(`No album with id ${item.album}`);
    }

    
    const { artistName, albumName , price, image, _id } = dbAlbum; //properties (artistName, ... , price, image, _id) are extracted from the dbAlbum.
    const singleOrderItem = {
      quantity: item.quantity,
      artistName,
      albumName,
      price,
      image,
      album: _id,
    }; //singleOrderItem: It is created using the extracted properties from dbAlbum and the amount from the current item.

    // Because resultsMap was returned in an async function; it is wrapped in a Promise; so we need to await before we can edit its fields. Node is working on each item in the cartItems array, in _parallel_ to save time
    resultsMap = await resultsMap; //is used to ensure that any previous asynchronous operations are completed before modifying it.

    resultsMap.orderItems = [...resultsMap.orderItems, singleOrderItem]; //with each iteration add new  singleOrderItem //The singleOrderItem is added to the orderItems array in resultsMap.
    resultsMap.subtotal += item.quantity * price; // The subtotal in resultsMap is updated by adding the product of item.amount and price.

    // We have to return resultsMap so that the reduce function knows to use the updated values for the next item in the list
    return resultsMap; //The updated resultsMap is returned so that it can be used as the accumulator for the next iteration of the reduce() function.
  };

  const { orderItems: cartItems , subtotal, tax} = req.body;

  // Perform necessary checks and validations
  if (!cartItems?.length) {
    throw new BadRequestError(
      'Unable to create order because the order items are missing.'
    );
  }

  
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError('No cart items provided');
  }
  
  // initial accumulator value. For each iteration through cartItems, we will do some processing in `processOrder` function to update this object
  const initialValue = { subtotal: 0, orderItems: [] };

  // Now we execute the `reduce` function, telling it to run the `processOrder` function for each item in cartItems
  // We also give it the `initialValue` so that for the first iteration, it will use subtotal=0, and orderItems=[]
  // At the end, the `reduce` function returns the updated accumulator value, which we destrucure to get the subtotal and the orderItems variables
  const { subtotal, orderItems } = await cartItems.reduce(
    processOrder,
    initialValue
  );

 
  // Create an Order document in the database
  const order = await Order.create({
    user: req.user.userId,
    email: req.user.email,
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
