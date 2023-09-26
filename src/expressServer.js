require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const cors = require('cors');
const favicon = require('express-favicon');
const { xss } = require('express-xss-sanitizer');
const helmet = require('helmet');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const logger = require('../logs/logger');
const swaggerOutputFile = require('../swagger-output.json');
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath();
const { readFileSync } = require('fs');
const { join } = require('path');
const expressStaticGzip = require('express-static-gzip');

const app = express();
// Express Async Errors must be used before any route is used,
// it will catch any errors that are thrown in the async functions without needing a try/catch
require('express-async-errors');

// Create a health endpoint for Render.com
// This endpoint is used by Render.com to check if the backend is running
// If the backend is not running, Render.com will restart the backend
// No middleware is needed here and no need to document it in Swagger docs
app.get('/health', (req, res) => {
  /* #swagger.ignore = true */
  res.status(200).send('OK');
});

// Base path simple response so that it's clear that the backend is working
app.get('/', (req, res) => {
  /* #swagger.ignore = true */
  res.send('<h1>Music Store API</h1><a href="/api-docs">API Docs</a>');
});

// ====== MIDDLEWARE SETUP ======

//Security middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP to 100 requests per windowMs
});
app.use(helmet());
app.use(limiter);
app.use(xss());
app.use(
  cors({
    origin: [/localhost:3000$/, /beatbazaar\.onrender\.com$/],
    credentials: true,
  })
);

//Logging middleware (using morgan to log each HTTP request)
app.use(
  morgan('dev', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// ====== API DOCUMENTATION SETUP ======
// By default, the swagger-ui-dist package will serve Swagger UI with an example pets API.
// We want to serve our own API documentation, so we need to modify the swagger-ui-dist files:
const swaggerConfig = readFileSync(
  join(pathToSwaggerUi, 'swagger-initializer.js')
)
  .toString()
  .replace(
    'https://petstore.swagger.io/v2/swagger.json',
    '/musicstore-api.json'
  );
// Serve the Swagger JSON document
app.get('/musicstore-api.json', (req, res) => {
  /* #swagger.ignore = true */
  res.json(swaggerOutputFile);
});

// When the HTML requests the swagger-initializer.js file, we will serve our own modified version
app.get('*swagger-initializer.js', (req, res) =>
  res.setHeader('content-type', 'application/javascript').send(swaggerConfig)
);

// Serve Swagger UI API documentation from the static files path
app.use('/api-docs', express.static(pathToSwaggerUi));

// ====== EXPRESS REQUEST MIDDLEWARE SETUP ======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Set up EJS for server-side rendering
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/favicon.ico'));
// Cookie parser middleware with JWT secret
app.use(cookieParser(process.env.JWT_SECRET));

// Configure express-session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Configure passport for request authz
app.use(passport.initialize());
app.use(passport.session());

// ====== IMPORT ROUTERS ======
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const albumRouter = require('./routes/albumRoutes');
const orderRouter = require('./routes/orderRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
// ====== IMPORT ERROR HANDLER MIDDLEWARE ======
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// ====== SETUP ROUTES ======
app.use('/api/v1/auth', authRouter /* #swagger.tags = ['Authentication'] */);
app.use('/api/v1/users', userRouter /* #swagger.tags = ['Users'] */);
app.use('/api/v1/albums', albumRouter /* #swagger.tags = ['Albums'] */);
app.use('/api/v1/orders', orderRouter /* #swagger.tags = ['Orders'] */);
app.use('/api/v1/reviews', reviewRouter /* #swagger.tags = ['Reviews'] */);
app.use('/api/v1/wishlist', wishlistRoutes /* #swagger.tags = ['Wishlist'] */);

// Serve static files from the 'public' folder
app.use('/admin', require('./routes/adminRoutes'));
app.use(express.static(__dirname + '/public'));

// Add this route to serve the order notifications page
app.get('/order-notifications', (req, res) => {
  res.render('orderNotifications'); // Render the EJS template
});

// Serve the static files for the Toastify library for use in EJS templates
app.use(
  '/toastify',
  expressStaticGzip('./node_modules/toastify-js/src', { enableBrotli: true })
);

// Serving the documentation page
app.get('/tests', (req, res) => {
  const documentationFilePath = path.join(__dirname, 'public', 'tests.html');
  res.sendFile(documentationFilePath);
});

// Error handling middleware (**MUST** be defined _after_ all other routes and middleware)
app.use(notFoundMiddleware); // Not found middleware to handle invalid routes
app.use(errorHandlerMiddleware); // Error handler middleware

// ====== WEBSOCKET SETUP ======
// put the express server definitions inside a more generic Node server so that we can reuse it for Socket.io
const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const socketServer = new Server(server, {
  cors: {
    origin: [/localhost:3000$/, /beatbazaar\.onrender\.com$/],
  },
});
const setupSocket = require('./live');
const io = socketServer.of('/'); // Create an instance of Socket.io

// Set up Socket.io connection event
io.on('connection', (socket) => {
  console.log('Connected');
  setupSocket(io, socket); // Call your setupSocket function

  socket.on('chat:album', function (data) {
    const { handleAlbumChat } = require('./live/handleAlbumChat');
    handleAlbumChat(io, socket, data);
  });

  socket.on('msg_from_client', function (from, msg) {
    console.log('Message is ' + from, msg);
  });
  socket.on('disconnect', function () {
    console.log('Disconnected');
  });
});

// add the io instance to the global object so that it can be used in other modules without circular dependency
global.io = io;
// export the database connection function
const connectDB = require('./db/connect');

module.exports = { app: server, connectDB, io };
