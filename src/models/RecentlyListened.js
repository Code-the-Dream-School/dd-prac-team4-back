const mongoose = require('mongoose');

const recentlyListenedSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  artistName: {
    type: String,
    required: true,
    //AKOS: should i delete this field because we have no artist model and we can't  reference it here  ?
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
    required: true,
  },
  timeListened: {
    type: Date,
    default: Date.now,
  },
});

//  to add an index on user and timeListened for better query performance
// This is specifying the fields on which the index is created. In this case, it's a compound index on the user field in ascending order (1), and the timeListened field in descending order (-1).
// Indexing on user is useful for quickly retrieving records for a specific user.
// Indexing on timeListened in descending order is often used when you want to retrieve records in a time-based order, such as fetching the most recently listened albums.
//Indexes help MongoDB efficiently retrieve and filter data. In this case, the compound index can speed up queries that involve filtering by both user and sorting by timeListened, which is common when retrieving recently listened items for a particular user.
recentlyListenedSchema.index({ user: 1, timeListened: -1 });

const RecentlyListened = mongoose.model(
  'RecentlyListened',
  recentlyListenedSchema
);

module.exports = RecentlyListened;
