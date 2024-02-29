const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { generateRecommendations } = require('../utils/recommendationUtility');

const listeningHistorySchema = new Schema({
  userId: String,
});

listeningHistorySchema.post('save', async function (doc, next) {
  try {
    // Access the model to fetch ListeningHistory documents
    const ListeningHistory = this.constructor;

    // Fetch the top 5 listened to artists from the user's listening history
    const listeningHistory = await ListeningHistory.find({
      userId: doc.userId,
    }).limit(5);
    // Check if listeningHistory is not empty before generating recommendations
    if (listeningHistory.length > 0) {
      // Call a function to generate recommendations with the fetched documents
      await generateRecommendations(doc.userId, listeningHistory);
    }

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
