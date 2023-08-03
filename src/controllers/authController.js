const User = require('../models/User');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');

//SET up CUSTOM ERRORs later

// create token
const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email });

  if (emailAlreadyExists) {
    res.status(400).json({ msg: 'This email already exists in a database' });
  }

  //first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0; //get all users, and if there are no users assign role to admin
  const role = isFirstAccount ? 'admin' : 'user';

  const hashedPassword = await argon2.hash(password);

  //create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  //create token for the user
  const createJWT = (user) => {
    return { name: user.name, userId: user._id, role: user.role };
  };

  const tokenUser = createJWT(user);

  res.status(200).json({ user: tokenUser }); //sends as response 'tokenUser' with 3 properties { name: user.name, userId: user._id, role: user.role }; and calls it 'user' object
};

module.exports = {
  register,
};
