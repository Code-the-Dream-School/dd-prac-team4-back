const userRoutes = require('./userRoutes');
const express = require('express');
const fileUploadMiddleware = require('express-fileupload');
const imgurController = require('../controllers/imgurController');
const router = express.Router();

userRoutes.post(
  '/:userId/uploadProfile',
  fileUploadMiddleware({ limits: { fileSize: 10000000 }, abortOnLimit: true }),
  imgurController.uploadProfile
);

module.exports = router;
