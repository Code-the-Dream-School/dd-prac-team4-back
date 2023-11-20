const express = require('express');
const fileUploadMiddleware = require('express-fileupload');
const imgurController = require('../controllers/imgurController');
const router = express.Router();

// Route for rendering the upload page
router.get('/upload', imgurController.renderUploadPage);

router.post(
  '/upload/:userId',
  fileUploadMiddleware({ limits: { fileSize: 10000000 }, abortOnLimit: true }),
  imgurController.uploadProfile
);

module.exports = router;
