const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
// const { Order } = require('../models/Order');
// const Wishlist = require('../models/Wishlist');

const register = async (req, res) => {
  console.log(req.body);
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const [user] = await User.create([req.body], { session });
    // const [album] = await Album.create([req.body], { session });
    // const [order] = await Order.create([req.body], { session });
    // const [wishlist] = await Wishlist.create([req.body], { session });
    await session.commitTransaction();

    res.status(StatusCodes.CREATED).json({ user: user.name });
  } catch (error) {
    console.error('ERROR: ', error);
    await session.abortTransaction();

    throw error;
  } finally {
    await session.endSession();
  }
};

module.exports = { register };
