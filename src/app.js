require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const favicon = require('express-favicon')
const mainRouter = require('./routes/mainRouter.js')
const helmet = require('helmet')
const session = require('express-session')
const passport = require('passport')
const mongoose = require('mongoose')
const asyncErrors = require('express-async-errors')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const xss = require('xss')
const mongoSanitize = require('mongo-sanitize')
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60 // limit each IP to 100 requests per windowMs
})

// middleware setup
app.use(cors())
app.use(xss())
app.use(limiter)
app.use(mongoSanitize())
app.use(express.json())
app.use(helmet())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(express.static('public'))
app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(bodyParser.json())
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())
app.use(
  session({ secret: 'your-secret-key', resave: false, saveUninitialized: true })
)

// Enable async/await error handling
asyncErrors(app)

// Database setup (using Mongoose)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

// Express routes
app.use('/api/v1', mainRouter)

// Error handling middleware (must be defined after all other routes and middleware)
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`)
})
