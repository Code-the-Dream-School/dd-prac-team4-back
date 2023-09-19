const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot_password', forgotPassword);
router.post('/resetPassword', resetPassword);

module.exports = router;
