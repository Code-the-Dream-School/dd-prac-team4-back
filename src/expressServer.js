require('dotenv').config();
const { Server } = require('socket.io');
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

const app = express();
require('express-async-errors');

// Create a health endpoint for Render.com
app.get('/health', (req, res) => {
  /* #swagger.ignore = true */
  res.status(200).send('OK');
});

// Base path simple response so that it's clear that the backend is working
app.get('/', (req, res) => {
  /* #swagger.ignore = true */
  res.send('<h1>Music Store API</h1><a href="/api-docs">API Docs</a>');
});

// ====== Middleware setup ======

//Security middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // limit each IP to 100 requests per windowMs
});
app.use(helmet());
app.use(limiter);
app.use(xss());
app.use(cors({ origin: [/localhost:3000$/], credentials: true }));

//Logging middleware (using morgan to log each HTTP request)
app.use(
  morgan('dev', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// API Docs
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
// When the HTML requests the swagger-initializer.js file, we will serve our own modified version
app.get('*swagger-initializer.js', (req, res) =>
  res.setHeader('content-type', 'application/javascript').send(swaggerConfig)
);

// Serve Swagger UI API documentation from the static files path
app.use('/api-docs', express.static(pathToSwaggerUi));

// Serve the Swagger JSON document
app.get('/musicstore-api.json', (req, res) => {
  /* #swagger.ignore = true */
  res.json(swaggerOutputFile);
});

// Express request middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', `${__dirname}/views`); // Set up EJS for server-side rendering
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(cookieParser(process.env.JWT_SECRET)); // Cookie parser middleware with JWT secret

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

// database
const connectDB = require('./db/connect');

//routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const albumRouter = require('./routes/albumRoutes');
const orderRouter = require('./routes/orderRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter /* #swagger.tags = ['Users'] */);
app.use('/api/v1/albums', albumRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/wishlist', wishlistRoutes);

// Serve static files from the 'public' folder
app.use('/admin', require('./routes/adminRoutes'));
app.use(express.static(__dirname + '/public'));

// Error handling middleware (must be defined after all other routes and middleware)
app.use(notFoundMiddleware); // Not found middleware to handle invalid routes
app.use(errorHandlerMiddleware); // Error handler middleware

// Setup websocket
// put the express server definitions inside a more generic Node server so that we can reuse it for Socket.io
const http = require('http');
const server = http.createServer(app);
const socketServer = new Server(server);
const setupSocket = require('./live');
const io = socketServer.of('http://localhost:8000'); // Create an instance of Socket.io

// Set up Socket.io connection event
io.on('connection', (socket) => {
  setupSocket(io, socket); // Call your setupSocket function
});

module.exports = { app: socketServer, connectDB };
