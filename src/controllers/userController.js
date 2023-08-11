const User = require('../models/User');
const jwt = require('jsonwebtoken');

// create token (we use it here after updating user's data )
const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

//returning a regular javascript object that is a subset of the fields of the User model.
const formatUserForFrontend = (user) => {
  return { name: user.name, userId: user._id, role: user.role };
};

const getSingleUser = async (req, res) => {
  // #swagger.tags = ['Users']
  const user = await User.findOne({ _id: req.params.id });
  if (!user) {
    res.status(400).json({ msg: `No user with id : ${req.params.id}` });
  }
  // If the user is found, it calls the formatUserForFrontend function to format the user data before sending it in the response
  const tokenUser = formatUserForFrontend(user);

  res.status(200).json({ user: tokenUser });
};

const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email && !name) {
    res.status(400).json({ msg: 'Please provide all values' });
  }

  const user = await User.findOne({ _id: req.params.id }); //get user
  // Update email if request included a non-null value, otherwise keep the email as-is
  user.email = email || user.email;

  // Update name if request included a non-null value, otherwise keep the name as-is
  user.name = name || user.name;

  await user.save(); // using pre save hook (see user model) to save updated user
  //create tokenUser with data updated
  const createJWT = (user) => {
    return { name: user.name, userId: user._id, role: user.role };
  };

  user = await user.save();
  //After updating the user, it calls the formatUserForFrontend function to format the updated user data before sending it in the response
  const tokenUser = formatUserForFrontend(user);
  res.status(200).json({ user: tokenUser });
};

module.exports = {
  getSingleUser,
  updateUser,
};
