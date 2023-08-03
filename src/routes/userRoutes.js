const express = require('express');
const router = express.Router();

const {
  getSingleUser,

  updateUser,
} = require('../controllers/userController');

router.route('/:id').patch(updateUser);
router.route('/:id').get(getSingleUser);

module.exports = router;
