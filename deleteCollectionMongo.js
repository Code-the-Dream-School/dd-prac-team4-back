const mongoose = require('mongoose');
require('dotenv').config();
const Review = require('./src/models/Review');
//INSERT WHICHEVER COLLECTION IM MONGO DB YOU NEED TO DELETE

// Connect to the MongoDB database
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function deleteCollection() {
  try {
    await Review.deleteMany({}, { wtimeout: 30000000 });
    console.log('Collection deleted successfully.');
  } catch (error) {
    console.error('Error deleting collection:', error);
  } finally {
    mongoose.connection.close();
  }
}

deleteCollection();
