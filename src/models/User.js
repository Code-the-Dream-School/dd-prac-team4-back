const mongoose = require('mongoose');
const validator = require('validator');
const argon2 = require('argon2');

// Mongoose schema for profileImage
const profileImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: false,
  },
  altText: {
    type: String,
  },
});

// Mongoose schema for hashed credit card info
const creditCardSchema = new mongoose.Schema({
  hashedNumber: {
    type: String,
    required: true,
  },
  expiry: {
    type: String,
    required: true,
  },
  preferredPaymentOption: {
    type: String,
    enum: ['credit card', 'paypal', 'google pay'],
    required: true,
  },
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true, //checks index; if !index throws mongoose errors
    required: [true, 'Please provide email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide valid email',
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },
  role: {
    type: String,
    // acceptable values for the role property
    enum: ['admin', 'user'],
    default: 'user',
  },
  profileImage: profileImageSchema,
  creditCardInfo: creditCardSchema,
});

UserSchema.methods.comparePassword = async function (password) {
  try {
    return await argon2.verify(this.password, password);
  } catch (error) {
    throw error;
  }
};
module.exports = mongoose.model('User', UserSchema);
