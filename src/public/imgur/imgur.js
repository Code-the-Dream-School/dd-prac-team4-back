const User = require('./models/User');
const fileUploadMiddleware = require('express-fileupload');
const { ImgurClient } = require('imgur');
const imgurClient = new ImgurClient({
  clientId: process.env.IMGUR_CLIENT_ID,
  clientSecret: process.env.IMGUR_CLIENT_SECRET,
  refreshToken: process.env.IMGUR_REFRESH_TOKEN,
});
const express = require('express');
const app = express();
// we are passing in a URL and a middleware to our rate
// For the fileUploadMiddleware we are passing in some options to set a file size limit of 10MB (10 million bytes)
// `abortOnLimit` means that the middleware will fail the request and return a 413 Payload too Large status code if the limit is exceeded
app.post(
  '/api/v1/profile/:userId/uploadDB',
  fileUploadMiddleware({ limits: { fileSize: 10000000 }, abortOnLimit: true }),
  async (req, res) => {
    // The `express-fileupload` middleware will add any files that were sent using a multipart/form-data request,
    // to the req.files property
    // This property will be an **object** where the keys of that object, are the names/properties of the files in the form-data request

    // Doing some error checking to ensure that we have all the info we expected from the request
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
    if (!req.params.userId) {
      return res.status(400).send('No user id was provided.');
    }

    // fetching the user. Keep in mind, this means that the user must have already been created, before we can upload an image.
    // Maybe for the /register endpoint, this won't make sense to do this way necessarily
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(400).send('no user found');
    }

    // Assuming that the request named the file sent to us, `profile`
    // The contents of this variable are outlined here: https://www.npmjs.com/package/express-fileupload#:~:text=The%20req.files,the%20uploaded%20file
    const profile = req.files.profile;

    // We want to make sure in this case that we _only_ accept **images**
    // So we check the mimetype using a Regex test, to see if it starts with the word "image"
    // Common mime types can be found here: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
    if (!/^image/.test(profile.mimetype)) {
      return res.status(400).send('File is not an image.');
    }

    // imgur accepts a base64-encoded string that represents the image we want to upload
    const imgurRes = await imgurClient.upload({
      image: profile.data.toString('base64'),
      type: 'base64',
      title: `${user._id}_profile_pic`,
    });
    if (imgurRes.success) {
      // storing our image in the shape expected by the profileImageSchema embedded schema in User.js
      user.profileImage = {
        url: imgurRes.data.link,
        altText: 'user profile picture',
      };
    }

    // Alternatively, imgur also accepts a ReadableStream, so we could use a Duplex stream like we did for the GridFS approach:

    // Create a stream and write the profile image data to it
    // const imageStream = new stream.Duplex();
    // imageStream.push(profile.data);
    // imageStream.push(null);

    // Send that stream as a readable stream to imgur
    // const imgurRes = await imgurClient.upload({
    //   image: imageStream,
    //   type: 'stream',
    //   title: `${user._id}_profile_pic`,
    // });

    // in the real app you may want to send a more useful message or json object
    res.status(200).send('Updated profile picture');
  }
);
