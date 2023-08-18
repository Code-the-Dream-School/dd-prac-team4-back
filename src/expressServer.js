require('dotenv').config();

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
  res.status(200).send('OK');
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
  res.json(swaggerOutputFile);
});

// Express request middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
const reviewRouter = require('./routes/reviewRoutes');
// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/albums', albumRouter);
app.use('/api/v1/reviews', reviewRouter);

// Error handling middleware (must be defined after all other routes and middleware)
app.use(notFoundMiddleware); // Not found middleware to handle invalid routes
app.use(errorHandlerMiddleware); // Error handler middleware

module.exports = { app, connectDB };
