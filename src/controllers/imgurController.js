const { ImgurClient } = require('imgur');
const User = require('../models/User');

const imgurClient = new ImgurClient({
  clientId: process.env.IMGUR_CLIENT_ID,
  clientSecret: process.env.IMGUR_CLIENT_SECRET,
  refreshToken: process.env.IMGUR_REFRESH_TOKEN,
});

const renderUploadPage = (req, res) => {
  const userId = req.params.userId;
  res.render('imgur', { userId });
};

async function uploadProfile(req, res) {
  console.log('Received request for /api/v1/user/:userId/uploadProfile');
  const userId = req.params.userId;
  console.log('User ID:', userId);

  if (!userId) {
    return res.status(400).send('No user id was provided.');
  }

  if (!req.files || Object.keys(req.files).length === 0) {
    console.log('No files were uploaded.');
    return res.status(400).send('No files were uploaded.');
  }

  const user = await User.findById(userId);
  console.log('User:', user);
  if (!user) {
    return res.status(400).send('No user found');
  }

  const profile = req.files.profile;
  console.log('File Details:', profile);

  if (!profile) {
    console.log('No profile file in the request.');
    return res.status(400).send('No profile file in the request.');
  }
  console.log('File MIME Type:', profile.mimetype);
  console.log('File Size:', profile.size);

  if (!/^image/.test(profile.mimetype)) {
    return res.status(400).send('File is not an image.');
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
    await user.save();
  }

  res.render('imgur', { userId: req.params.userId });
}

module.exports = {
  uploadProfile,
  renderUploadPage,
};
