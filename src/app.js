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
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const logger = require('../logs/logger');
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath();

const app = express();
require('express-async-errors');

// Serve Swagger UI static files
app.use('/api-docs', express.static(pathToSwaggerUi));

// Serve your generated Swagger specification
app.get('/api-docs.json', (req, res) => {
  res.sendFile(path.join('./src', 'swagger-output.json'));
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

// Express request middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(cookieParser());

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

// Database setup (using Mongoose)
mongoose.set('strictQuery', true);
const connectDB = (url) => {
  return mongoose.connect(url);
};

//routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

// Error handling middleware (must be defined after all other routes and middleware)
//add later

// Start the server
const port = process.env.PORT || 8000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      logger.info(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    logger.error(error);
  }
};

start();
