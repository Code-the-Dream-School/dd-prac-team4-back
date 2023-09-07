// const { MongoClient } = require('mongodb').default;
// const { ObjectId } = require('mongodb');

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

//const agg = [
//  {
//    // Filters reviews associated with the album using its ObjectId.
//    $match: {
//      album: new ObjectId('64d2a94c793389a43fc5a8d6'),
//    },
//  },
//  {
//    $group: {
//      // Groups the reviews into a single common group (null) since we want to compute values for the entire album
//      _id: null,
//      // Uses the $avg aggregation to calculate the average rating of the reviews.
//      averageRating: {
//        $avg: '$rating',
//      },
//      // Uses the $sum aggregation to count the total number of reviews.
//      numberOfReviews: {
//        $sum: 1,
//      },
//    },
//  },
//];

//  const client = await MongoClient.connect('', {
//  useNewUrlParser: true,
//  useUnifiedTopology: true,
//});
//  const coll = client.db('test').collection('reviews');
//  const cursor = coll.aggregate(agg);
//  const result = await cursor.toArray();
// await client.close();
