const { app, connectDB } = require('../src/expressServer'); // Import your Express app here
const { StatusCodes } = require('http-status-codes');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Review = require('../src/models/Review');
const User = require('../src/models/User');
const Album = require('../src/models/Album');
const { loginAndReturnCookie } = require('./test_helper');
const closeAllConnections = require('./testHelpers');
let server;
let mongooseConnection;
let mongodb;

beforeAll(async () => {
  mongodb = await MongoMemoryServer.create();
  const url = mongodb.getUri();
  process.env.MONGO_URL = url;
  mongooseConnection = await connectDB(url);
  server = await app.listen(8001);
});

afterAll(async () => {
  await closeAllConnections({ server, mongooseConnection, mongodb });
});

describe('ReviewController API Tests', () => {
  let user;
  let album;
  let review;
  let userCredentials;

  beforeAll(async () => {
    //create a user
    user = await User.create({
      email: 'Emily@google.com',
      password: 'secret',
      name: 'Emily',
      username: 'emily123',
      role: 'user',
    });
    // Create a unique album and user for each test
    album = await Album.create({
      albumName: 'Unique Album',
      artistName: 'Unique Artist',
      spotifyUrl: 'https://api.spotify.com/v1/albums/unique',
    });
  });

  beforeEach(async () => {
    await Review.deleteMany({});

    const mockReviewData = {
      rating: 5,
      title: 'Loved this review',
      comment: 'Recommend it"',
      user: user._id,
      album: album._id,
    };

    review = await Review.create(mockReviewData);
    userCredentials = {
      email: 'Emily@google.com',
      password: 'secret',
    };
  });
  describe('test the getAllReviews endpoint', () => {
    //get all reviews

    it('should test the getAllReviews endpoint - Success Case', async () => {
      const response = await request(app).get('/api/v1/reviews');
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('reviews');
      expect(response.body.reviews).toHaveLength(1);
      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBe(1);
    });
    it('should return an empty list if there are no reviews in the database', async () => {
      await Review.deleteMany({});
      // Make a GET request to the /api/v1/reviews endpoint
      const response = await request(app).get('/api/v1/reviews');

      // Assert that the response status is OK (200)
      expect(response.status).toBe(StatusCodes.OK);

      // Assert that the response body is an object with "reviews" and "count" keys
      expect(response.body).toHaveProperty('reviews');
      expect(response.body).toHaveProperty('count');

      // Assert that "reviews" is an empty array since there are no reviews in the database
      expect(response.body.reviews).toEqual([]);

      // Assert that the "count" field reflects the actual count of reviews (which is 0 in this case)
      expect(response.body.count).toBe(0);
    });
  });
  describe('test the getSingleReview endpoint', () => {
    //get single review
    it('should test the getSingleReview endpoint - Success Case', async () => {
      const { _id: reviewId } = await Review.findOne({});

      const response = await request(app).get(`/api/v1/reviews/${reviewId}`);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('review');
      //expect(response.body.review._id.toString()).toBe(reviewId.toString());//check if the response.body.review._id value matches what we expect // or
      expect(response.body.review).toMatchObject(
        JSON.parse(JSON.stringify(review))
      ); //checks if the object on the right is a subset (ie: has at least some of the same fields and values) as the object on the left.
    });

    it('should test the getSingleReview endpoint - Error Case (Not Found)', async () => {
      const response = await request(app).get('/api/v1/reviews/errorReviewId');
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });
  describe('test the get All Reviews for the particular album endpoint', () => {
    //get all reviews for this particular album
    it('should get reviews for a specific album', async () => {
      const response = await request(app).get(
        `/api/v1/reviews/album/${album._id}`
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('allProductReviews');
      expect(response.body.allProductReviews).toHaveLength(1);
      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBe(1);
    });
  });
  describe('test the get All Reviews for the particular album endpoint - no reviews found', () => {
    it('should NOT get reviews for a specific album- no reviews were created for this album', async () => {
      // Create a second album with no reviews
      const secondAlbum = await Album.create({
        albumName: 'Another  Album',
        artistName: 'Another  Artist',
        spotifyUrl: 'https://api.spotify.com/v1/albums/anotheralbum',
      });

      const response = await request(app).get(
        `/api/v1/reviews/album/${secondAlbum._id}`
      );
      expect(response.status).toBe(StatusCodes.OK);

      //  response body is an object with "allProductReviews" and "count" keys
      expect(response.body).toHaveProperty('allProductReviews');
      expect(response.body).toHaveProperty('count');

      //  "allProductReviews" is an empty array since there are no reviews for this album
      expect(response.body.allProductReviews).toEqual([]);

      // "count" field reflects the actual count of reviews (which is 0 in this case)
      expect(response.body.count).toBe(0);
    });
  });
  describe('test the create review endpoint', () => {
    //create a review
    it('should create a review successfully', async () => {
      await Review.deleteMany({});

      const signedCookie = await loginAndReturnCookie(userCredentials);

      const newReviewData = {
        rating: 4,
        title: 'Loved this review',
        comment: 'Recommend it"',
        user: user._id,
        album: album._id,
      };
      const response = await request(app)
        .post(`/api/v1/reviews/album/${album._id}`)
        .set('Cookie', signedCookie)
        .send(newReviewData);

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toHaveProperty('review');

      //create second review by the same user for the same album
      const secondReviewData = {
        rating: 4,
        title: 'Loved this review',
        comment: 'Recommend it"',
        user: user._id,
        album: album._id,
      };
      const res = await request(app)
        .post(`/api/v1/reviews/album/${album._id}`)
        .set('Cookie', signedCookie)
        .send(secondReviewData);
      // this user already submitted a review for this album
      expect(res.status).toBe(StatusCodes.CONFLICT);
    });

    //when album was not found
    it('should not create a review and return a 404 if the album is not found ', async () => {
      const signedCookie = await loginAndReturnCookie(userCredentials);

      album = await Album.findOneAndDelete({ albumName: 'Unique Album' });

      const newReviewData = {
        rating: 4,
        title: 'Loved this review',
        comment: 'Recommend it"',
        user: user._id,
        album: album._id,
      };
      const response = await request(app)
        .post(`/api/v1/reviews/album/${album._id}`)
        .set('Cookie', signedCookie)
        .send(newReviewData);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });
  describe('test the update review endpoint', () => {
    //  update a review
    it('should update a review successfully', async () => {
      const signedCookie = await loginAndReturnCookie(userCredentials);

      const existingReview = await Review.findOne({});

      const updatedReviewData = {
        rating: 1,
        title: 'Don not buy this album',
        comment: 'Awful"',
      };

      const response = await request(app)
        .patch(`/api/v1/reviews/${existingReview._id}`)
        .set('Cookie', signedCookie)
        .send(updatedReviewData);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('review');

      const updatedReview = await Review.findById(existingReview._id);
      expect(updatedReview).not.toBeNull();
      expect(updatedReview.rating).toBe(updatedReviewData.rating);
      expect(updatedReview.title).toBe(updatedReviewData.title);
      expect(updatedReview.comment).toBe(updatedReviewData.comment);
    });

    it('should NOT sucessfully update a review - Error case - no existing  review was found', async () => {
      const signedCookie = await loginAndReturnCookie(userCredentials);

      const nonExistingReview = await Review.findOneAndDelete({});

      const updatedReviewData = {
        rating: 2,
        title: 'Bad album',
        comment: 'Not recommended"',
      };

      const response = await request(app)
        .patch(`/api/v1/reviews/${nonExistingReview._id}`)
        .set('Cookie', signedCookie)
        .send(updatedReviewData);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should update a review - Error case - updating the review of another user will result in a 403 forbidden error', async () => {
      //create second user
      await User.create({
        email: 'Alex@google.com',
        password: 'secret',
        name: 'Alex',
        username: 'alex123',
        role: 'user',
      });

      userCredentials = {
        email: 'Alex@google.com',
        password: 'secret',
      };
      const signedCookie = await loginAndReturnCookie(userCredentials);

      const existingReview = await Review.findOne({});

      const updatedReviewData = {
        rating: 5,
        title: 'Buy this album',
        comment: 'Excellent"',
      };

      const response = await request(app)
        .patch(`/api/v1/reviews/${existingReview._id}`)
        .set('Cookie', signedCookie)
        .send(updatedReviewData);
      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });
  });
});
