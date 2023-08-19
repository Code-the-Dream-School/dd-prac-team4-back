const mongoose = require('mongoose');

const PurchasedAlbumsSchema = new mongoose.Schema({
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const PurchasedAlbum = mongoose.model('PurchasedAlbum', PurchasedAlbumsSchema);

module.exports = PurchasedAlbum;
