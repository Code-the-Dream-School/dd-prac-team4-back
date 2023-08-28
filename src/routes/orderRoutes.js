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
} = require('../controllers/orderController');

router
  .route('/')
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermissions('admin'), getAllOrders);

router
  .route('/:id')
  .get(authenticateUser, authorizePermissions('admin'), getSingleOrder)
  .delete(authenticateUser, authorizePermissions('admin'), deleteOrder);

module.exports = router;
