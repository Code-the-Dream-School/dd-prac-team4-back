const Album = require('../models/Album');

const adminHomePage = async (req, res) => {
  const allAlbums = await Album.find({}).sort({ price: 1 }); // Fetch all albums from the database and sort them by price in ascending order
  res.render('adminPage', { albums: allAlbums });
  /*
   #swagger.tags = ['Admin']
   #swagger.summary = 'Admin Home Page'
   #swagger.description = 'Fetch and render the admin home page.'
   #swagger.responses[200] = {
     description: 'Admin home page fetched successfully.',
     content: { 'text/html': {} }
   }
   */
};

const {
  updatePriceOfAlbums: originalUpdatePrice,
} = require('../controllers/albumController');
const updatePriceOfAlbums = async (req, res) => {
  /*#swagger.summary = 'Update prices of albums passed in req.body'
#swagger.parameters['albums to update prices'] = {
  in: 'body',
  description: 'Array of information to use to update album prices',
  required: true,
  type: 'array',
  schema: [
  {
    "id": "64d2ae2308a725b72bd5c0dc",
    "price": 9.99
  },
  {
    "id": "another_album_id",
    "price": 19.99
  }
]
}
#swagger.responses[200] = {
  description: 'Album prices were successfully updated.',
  content: { 'text/html': {} }
}*/
  await originalUpdatePrice(req, res);
};

module.exports = {
  adminHomePage,
  updatePriceOfAlbums,
};
