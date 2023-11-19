const express = require('express');
const fileUploadMiddleware = require('express-fileupload');
const { ImgurClient } = require('imgur');
const User = require('../models/User');

const router = express.Router();
const imgurClient = new ImgurClient({
  clientId: process.env.IMGUR_CLIENT_ID,
  clientSecret: process.env.IMGUR_CLIENT_SECRET,
  refreshToken: process.env.IMGUR_REFRESH_TOKEN,
});

router.post(
  '/:userId/uploadDB',
  fileUploadMiddleware({ limits: { fileSize: 10000000 }, abortOnLimit: true }),
  async (req, res) => {
    console.log('Received request for /api/v1/profile/:userId/uploadDB');
    const userId = req.params.userId;
    console.log('User ID:', userId);
    console.log('Entire req object:', req);
    if (!userId) {
      return res.status(400).send('No user id was provided.');
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      console.log('No files were uploaded.');
      return res.status(400).send('No files were uploaded.');
    }
    if (!req.params.userId) {
      return res.status(400).send('No user id was provided.');
    }

    const user = await User.findById(userId);
    console.log('User:', user);
    if (!user) {
      return res.status(400).send('no user found');
    }
    const profile = req.files.profile;
    console.log('File Details:', profile);

    if (!profile) {
      console.log('No profile file in the request.');
      return res.status(400).send('No profile file in the request.');
    }
    console.log('File MIME Type:', profile.mimetype);
    console.log('File Size:', profile.size);

    if (!profile || !/^image/.test(profile.mimetype)) {
      return res.status(400).send('File is not an image.');
    }
    if (!req.files || !req.files.profile) {
      console.log('No profile file in the request.');
      return res.status(400).send('No profile file in the request.');
    }

    const imgurRes = await imgurClient.upload({
      image: profile.data.toString('base64'),
      type: 'base64',
      title: `${user._id}_profile_pic`,
    });
    if (imgurRes.success) {
      user.profileImage = {
        url: imgurRes.data.link,
        altText: 'user profile picture',
      };
    }
    res.status(200).send('Updated profile picture');
    res.render('../views/imgur', { userId: req.params.userId });
  }
);

module.exports = router;
