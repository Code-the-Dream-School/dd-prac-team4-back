const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');
const { getSingleUser, updateUser } = require('../controllers/userController');

router.route('/updateUser').patch(authenticateUser, updateUser);
// - PATCH /updateUser: Update the currently authenticated user's information

router.route('/:id').get(authenticateUser, getSingleUser);
// - GET /:id: Retrieve a single user's information by their ID (requires authentication)

module.exports = router;
