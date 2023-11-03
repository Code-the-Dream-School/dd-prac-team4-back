// models/playHistory.js
const mongoose = require('mongoose');

const playHistorySchema = new mongoose.Schema({
  userId: String,
  songId: String,
});

const PlayHistory = mongoose.model('PlayHistory', playHistorySchema);

module.exports = PlayHistory;
