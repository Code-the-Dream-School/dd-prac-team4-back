const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide rating'],
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide review title'],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, 'Please provide review text'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    album: {
      type: mongoose.Schema.ObjectId,
      ref: 'Album',
      required: true,
    },
  },
  { timestamps: true }
);

// Create an index on 'album' and 'user' to ensure unique reviews per album-user combination
ReviewSchema.index({ album: 1, user: 1 }, { unique: true });

// Static method to calculate the average rating and number of reviews for a specific album
ReviewSchema.statics.calculateAverageRating = async function (albumId) {
  const result = await this.aggregate([
    { $match: { album: albumId } }, // Match reviews with the specified albumId
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    await this.model('Album').findOneAndUpdate(
      { _id: albumId }, // Find the album by its unique ObjectId.
      {
        // Update the 'averageRating' field of the album document with the rounded
        // value from the aggregation result. If 'averageRating' is undefined, it defaults to 0.
        averageRating: Math.round(result[0]?.averageRating || 0),
        // Update the 'numOfReviews' field of the album document with the value from the
        // aggregation result. If 'numOfReviews' is undefined, it defaults to 0.
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

// Middleware to calculate the average rating and total reviews after saving a review
ReviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.album);
});

// Middleware to calculate the average rating and total reviews before removing a review
ReviewSchema.pre('remove', async function () {
  await this.constructor.calculateAverageRating(this.album);
});

module.exports = mongoose.model('Review', ReviewSchema);
