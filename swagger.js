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
    UserWithAlbums: {
      $id: '64d6ca92a15d2e18ab96a2a3',
        $name: 'John Doe',
        $username: 'johndoe',
        $email: 'john@example.com',
        $role: { '@enum': ['user', 'admin'] },
        profileImage: {
          url: 'https://example.com/profile-image.jpg',
        creditCardInfo: {
          hashedNumber: '1234567890',
          expiry: '12/24',
          preferredPaymentOption: {
            '@enum': ['credit card', 'paypal', 'google pay'],
          },
        },
        },
        
        $artistName: 'Britney Spears',
        $albumName: '...Baby one more time',
        price: 20,
        image: '/uploads/example.jpg',
        releaseDate: '2023-07-28 T00:00:00.000+00:00',
        category: 'pop',
        spotifyUrl: 'https://api.spotify.com/v1/albums/6r1lh7fHMB499vGKtIyJLy',
        averageRating: 4,
        numOfReviews: 2,
      
    },
  },
};

const outputFile = './swagger-output.json';
const routes = ['./src/expressServer.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);
