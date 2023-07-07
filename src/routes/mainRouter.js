const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController.js');

router.get('/', mainController.get);
  
module.exports = router;