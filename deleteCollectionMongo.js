const mongoose = require('mongoose');
require('dotenv').config();
const { Order }  = require('./src/models/Order');
//INSERT WHICHEVER COLLECTION IM MONGO DB YOU NEED TO DELETE

// Connect to the MongoDB database
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function deleteCollection() {
  try {
    await Order.deleteMany({}, { wtimeout: 30000000 });
    console.log('Collection deleted successfully.');
  } catch (error) {
    console.error('Error deleting collection:', error);
  } finally {
    mongoose.connection.close();
  }
}

deleteCollection();

