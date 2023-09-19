const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  forgotPassword,
  reset_password,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot_password', forgotPassword);
router.post('/reset_password', reset_password);

module.exports = router;
