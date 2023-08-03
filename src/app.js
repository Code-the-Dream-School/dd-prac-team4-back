require('dotenv').config();

const express = require('express');
const session = require('express-session');
const app = express();

const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const favicon = require('express-favicon');
const xss = require('xss-clean');
const helmet = require('helmet');

const passport = require('passport');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const asyncErrors = require('express-async-errors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // limit each IP to 100 requests per windowMs
});

// middleware setup
// Configure express-session middleware
app.use(
  session({
    secret: 'your-secret-key', // Replace with a secret key for session data encryption
    resave: false,
    saveUninitialized: false,
    // Other configuration options can be added as needed
  })
);

app.use(cors());
app.use(xss())

app.use(express.json());
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

// Database setup (using Mongoose)



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
    app.listen(port, console.log(`Server is listening on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();