const mongoose = require('mongoose');

const PurchasedAlbumSchema = new mongoose.Schema({
  albumId: { type: Schema.Types.ObjectId, ref: 'Album', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const PurchasedAlbum = mongoose.model('AlbumPurchased', PurchasedAlbumSchema);

module.exports = PurchasedAlbum;
