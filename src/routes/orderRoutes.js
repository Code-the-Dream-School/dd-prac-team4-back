const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');
const { createOrder } = require('../controllers/orderController');

router.post('/', authenticateUser, createOrder);

module.exports = router;