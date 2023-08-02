const mongoose = require('mongoose');
const validator = require('validator');
const argon2 = require('argon2');

// Mongoose schema for profileImage
const profileImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: false,
  },
});

// Mongoose schema for hashed credit card info
const creditCardSchema = new mongoose.Schema({
  hashedNumber: {
    type: String,
    required: false,
  },
  expiry: {
    type: String,
    required: false,
  },
  preferredPaymentOption: {
    type: String,
    enum: ["credit card", "paypal", "google pay"],
    required: false,
  },
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true, //checks index; if !index throws mongoose errors
    required: [true, "Please provide email"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user"], // acceptable values for the role property
    default: "user",
  },
  profileImage: profileImageSchema,
  creditCardInfo: creditCardSchema,
});

//before we save the document we hash password; this points to the user (this= user)
UserSchema.pre('save', async function () {
  console.log(this.modifiedPaths()); //to see which properties were modified
   console.log(this.isModified('name')); // in console we get false if we are not modifying name, and true if we do
  
  if (!this.isModified('password')) return; //if the password is not modified then stop
  });


module.exports = mongoose.model('User', UserSchema);
