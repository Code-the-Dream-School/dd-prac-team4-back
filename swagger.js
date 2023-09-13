// This script is meant to be run by calling the `npm run generate-api-docs` command
// This script will update the swagger-output.json file with the latest API documentation
// The swagger-output.json file is used by the Swagger UI to display the API documentation
// You can view the API Docs by navigating to localhost:8000/api-docs
// Then in the "Explore" search bar in that UI type in /api.json

const swaggerAutogen = require('swagger-autogen');

const doc = {
  info: {
    title: 'My API',
    description: 'Description',
  },
  host: 'localhost:8000',
  definitions: {
    // Here we can define objects to use in our swagger documentation
    // These can be used as examples for request bodies, response bodies, etc
    PasswordlessUser: {
      $id: '64d6ca92a15d2e18ab96a2a3',
      $name: 'John Doe',
      $username: 'johndoe',
      $email: 'john@example.com',
      $role: { '@enum': ['user', 'admin'] },
      profileImage: {
        url: 'https://example.com/profile-image.jpg',
      },
      creditCardInfo: {
        hashedNumber: '1234567890',
        expiry: '12/24',
        preferredPaymentOption: {
          '@enum': ['credit card', 'paypal', 'google pay'],
        },
      },
    },

    Order: {
      $_id: 'idabc123456',
      $user: {
        $id: 'idabc123456',
        $name: 'John Doe',
        $username: 'johndoe',
        $email: 'john@example.com',
        $role: { '@enum': ['user', 'admin'] },
      },

      $orderStatus: {
        '@enum': [
          'pending',
          'payment_successful',
          'payment_failed',
          'cancelled',
          'complete',
        ],
        default: 'pending',
      },
      orderItems: [
        {
          $album: '5f7f1f7a5c3f2b2d9c1b0b9d',
          $quantity: 2,
          $_id: 'idabc12345',
        },
      ],
      $subtotal: 9.99,
      $tax: 0.75,
      $total: 10.74,
      $createdAt: '2023-08-08T20:45:00.942Z',
      $updatedAt: '2023-08-08T20:45:00.942Z',
      paymentIntentId: 'pi_abc123456',
    },

    NewOrder: {
      $subtotal: 100,
      $tax: 0.15,
      $total: 115,
      $orderItems: [{ album: 'abcdef12345', quantity: 2 }],
    },

    OrderList: {
      count: 1,
      orders: [
        {
          user: '64d44bc8337399ccf9ad7e4d',
          orderItems: [
            {
              album: '5f7f1f7a5c3f2b2d9c1b0b9d',
              quantity: 1,
            },
          ],
          subtotal: 14.99,
          tax: 1.25,
          total: 16.24,
          createdAt: '2023-08-08T20:45:00.942Z',
          updatedAt: '2023-08-08T20:45:00.942Z',
          _id: '64ef50c8c5551074444547bc',
          orderStatus: { '@enum': ['pending', 'payment_successful', 'payment_failed', 'cancelled', 'complete'] },
          paymentIntentId: 'pi_abc123456',
        },
      ],
    },
    UserWithAlbums: {
      $id: '64d6ca92a15d2e18ab96a2a3',
      $name: 'John Doe',
      $username: 'johndoe',
      $email: 'john@example.com',
      $role: { '@enum': ['user', 'admin'] },
      profileImage: {
        url: 'https://example.com/profile-image.jpg',
      },
      creditCardInfo: {
        hashedNumber: '1234567890',
        expiry: '12/24',
        preferredPaymentOption: {
          '@enum': ['credit card', 'paypal', 'google pay'],
        },
      },
      $purchasedAlbums: [
        {
          $_id: '64ef50c8c5551074444547bc',
          $user: '64d6ca92a15d2e18ab96a2a3',
          $album: {
            $id: '64d2a94c793389a43fc5a8d6',
            $albumName: '...Baby one more time',
            $artistName: 'Britney Spears',
            $createdAt: '2023-08-08T20:45:00.942Z',
            $updatedAt: '2023-08-17T10:10:42.861Z',
            $price: 20.99,
            image:
              'https://i.scdn.co/image/ab67616d0000b27371cae34ad5a39bdab78af13e',
            spotifyUrl:
              'https://api.spotify.com/v1/albums/6r1lh7fHMB499vGKtIyJLy',
            releaseDate: '2023-07-28T00:00:00.000Z',
            averageRating: 0,
            numOfReviews: 0,
          },
        },
      ],
    },
    Album: {
      $albumName: 'The Dark Side of the Moon',
      $artistName: 'Pink Floyd',
      price: 9.99,
      image: '/uploads/example.jpg',
      releaseDate: '2022-03-01T00:00:00.000Z',
      createdAt: '2022-03-01T00:00:00.000Z',
      updatedAt: '2022-03-01T00:00:00.000Z',
      category: 'rock',
      $spotifyUrl: 'https://open.spotify.com/album/4LH4d3cOWNNsVw41Gqt2kv',
      averageRating: 4.5,
      numOfReviews: 2,
    },
    NewAlbum: {
      $albumName: 'The Dark Side of the Moon',
      $artistName: 'Pink Floyd',
      price: 9.99,
      image: '/uploads/example.jpg',
      releaseDate: '2022-03-01T00:00:00.000Z',
      category: 'rock',
      $spotifyUrl: 'https://open.spotify.com/album/4LH4d3cOWNNsVw41Gqt2kv',
    },
    AlbumWithUsers: {
      $_id: '64d2a94c793389a43fc5a8d6',
      $artistName: 'F',
      $albumName: 'AUSTIN',
      price: 0,
      image: 'https://i.scdn.co/image/ab67616d0000b27371cae34ad5a39bdab78af13e',
      releaseDate: '2023-07-28T00:00:00.000Z',
      $spotifyUrl: 'https://api.spotify.com/v1/albums/6r1lh7fHMB499vGKtIyJLy',
      averageRating: 0,
      numOfReviews: 0,
      $createdAt: '2023-08-08T20:45:00.942Z',
      $updatedAt: '2023-08-17T10:10:42.861Z',
      $purchasedByUsers: [
        {
          $_id: '64ef50c8c5551074444547bc',
          $album: '64d2a94c793389a43fc5a8d6',
          $user: {
            $_id: '64d6ca92a15d2e18ab96a2a3',
            $name: 'Akos123123',
            $email: 'akos123@example.com',
            role: 'user',
            $username: 'akos92',
          },
        },
      ],
      purchasingUsersCount: 1,
    },
  },
};
const outputFile = './swagger-output.json';
const routes = ['./src/expressServer.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */
swaggerAutogen({ openapi: '3.1.0' })(outputFile, routes, doc);
