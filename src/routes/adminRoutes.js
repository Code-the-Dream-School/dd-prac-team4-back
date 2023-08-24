const express = require('express');
const router = express.Router();
const expressBasicAuth = require('express-basic-auth');
const adminController = require('../controllers/adminController');

router.get('/', adminController.adminHomePage);

router.use(expressBasicAuth({
  users: { [process.env.ADMIN_USERNAME]: process.env.ADMIN_PASSWORD },
  challenge: true,
  realm: 'admin site'
}));

module.exports = router;