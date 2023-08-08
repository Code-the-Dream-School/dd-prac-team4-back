const mongoose = require('mongoose');

const AlbumSchema = new mongoose.Schema({
  artistName: {
    type: String,
    required:  [true, 'Please provide artist name'],
    maxlength: [100, 'Artist name can not be more than 100 characters'],
    trim: true,
  },
  albumName: {
    type: String,
    required:  [true, 'Please provide album name'],
    maxlength: [100, 'Album name can not be more than 100 characters'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide album price'],
    min: 0,
  },
  image: {
    type: String,
    default: '/uploads/example.jpg',
  },
  releaseDate: {
    type: Date,
    required: false,
  },
  category: {
    type: String,
    required: [false, 'Please provide music category'],
    enum: ['pop', 'rock', 'rap'],
  },
  spotifyUrl: {
    type: String,
    required: false, //CHANGE TO TRUE LATER!!!!!!
    validate: {
      validator: function (v) {
        return /^https:\/\/open\.spotify\.com\/album\/[a-zA-Z0-9]+$/.test(v); //ensures that the URL starts with https://open.spotify.com/album/ followed by alphanumeric characters.
      },
      message: 'Invalid Spotify URL',
    },
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User', // we are referencing the user model . if we don´t provide user- in postman we'll get  "msg": "Path `user` is required."
    required: false,//CHANGE TO TRUE LATER!!!!!!
  },
},
{ timestamps: true } //timestamps provides fields of createdAt , updatedAt... and exact time, 
);

const Album = mongoose.model('Album', AlbumSchema);

module.exports = Album;
