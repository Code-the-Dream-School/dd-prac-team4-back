const mongoose = require('mongoose');
const validator = require('validator');
const argon2 = require('argon2');

// Must be required to ensure that the model is created before we try to use it
require('./PurchasedAlbum');

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

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide name'],
      minlength: 2,
      maxlength: 50,
    },
    username: {
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

    // New properties for password reset
    passwordResetToken: { type: String, default: null },
    passwordResetExpiresOn: { type: Date, default: null },
  },
  // when converting from a model to JSON (eg: when we return it in `res.json(...)`) we want to include virtual properties (eg: purchasedAlbums)
  { toJSON: { virtuals: true } }
);

// using this virtual we want to return all the albums this single user has purchased
UserSchema.virtual('purchasedAlbums', {
  ref: 'PurchasedAlbum',
  localField: '_id',
  foreignField: 'user',
});

UserSchema.methods.comparePassword = async function (password) {
  return await argon2.verify(this.password, password);
};

UserSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const hashedPassword = await argon2.hash(this.password);
    this.password = hashedPassword;
  }
});

module.exports = mongoose.model('User', UserSchema);
