const { ImgurClient } = require('imgur');
const User = require('../models/User');

const imgurClient = new ImgurClient({
  clientId: process.env.IMGUR_CLIENT_ID,
  clientSecret: process.env.IMGUR_CLIENT_SECRET,
  refreshToken: process.env.IMGUR_REFRESH_TOKEN,
});

const renderUploadPage = (req, res) => {
  const userId = req.params.userId;
  res.render('imgur', { userId, message: null, imageUrl: null });
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
    return renderUploadPage(req, res, 'No files were uploaded.');
  }

  const user = await User.findById(userId);
  console.log('User:', user);
  if (!user) {
    return renderUploadPage(req, res, 'No user found.');
  }

  const profile = req.files.profile;
  console.log('File Details:', profile);

  if (!profile) {
    console.log('No profile file in the request.');
    return renderUploadPage(req, res, 'No profile file in the request.');
  }
  console.log('File MIME Type:', profile.mimetype);
  console.log('File Size:', profile.size);

  if (!/^image/.test(profile.mimetype)) {
    return renderUploadPage(req, res, 'File is not an image.');
  }

  try {
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

      // Render with success message and image link
      renderUploadPage(
        req,
        res,
        'Image uploaded successfully!',
        imgurRes.data.link
      );
    } else {
      // Render with error message
      renderUploadPage(req, res, 'Error uploading image. Please try again.');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = {
  uploadProfile,
  renderUploadPage,
};
