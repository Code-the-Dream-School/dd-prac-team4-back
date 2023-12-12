// listeningHistory.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { generateRecommendations } = require('../utils/recommendationUtility');

const listeningHistorySchema = new Schema({
  userId: String,
});

listeningHistorySchema.post('save', async function (doc, next) {
  try {
    // Call a function to generate recommendations here
    await generateRecommendations(doc.userId);
    next();
  } catch (err) {
    next(err);
  }
});

const ListeningHistory = mongoose.model(
  'ListeningHistory',
  listeningHistorySchema
);
module.exports = ListeningHistory;
