const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');
const {
  createOrder,
  getAllOrders,
  getSingleOrder,
  deleteOrder,
  handleStripePayment,
} = require('../controllers/orderController');

router
  .route('/')
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermissions('admin'), getAllOrders);

router
  .route('/:id')
  .get(authenticateUser, getSingleOrder)
  .delete(authenticateUser, authorizePermissions('admin'), deleteOrder);

router.route('/payment_status').post(handleStripePayment);
hello
module.exports = router;
