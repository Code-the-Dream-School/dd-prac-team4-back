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
    definitions: {
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
        type: 'object',
        properties: {
          album: {
            type: 'string',
            example: 'Album ID or Name',
          },
          quantity: {
            type: 'integer',
            example: 2,
          },
        },
      },
    },

    OrderList: {
      $id: '789012',
      orders: [
        {
          user: 'Jane Smith',
          orderItems: [
            {
              album: '5f7f1f7a5c3f2b2d9c1b0b9d',
              quantity: 1,
            },
          ],
          subtotal: 14.99,
          tax: 1.25,
          total: 16.24,
        },
        {
          user: 'Bob Johnson',
          orderItems: [
            {
              album: '5f7f1f7a5c3f2b2d9c1b0b9e',
              quantity: 3,
            },
          ],
          subtotal: 29.97,
          tax: 2.5,
          total: 32.47,
        },
      ],
      count: 2,
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
  },
};

const outputFile = './swagger-output.json';
const routes = ['./src/expressServer.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);
