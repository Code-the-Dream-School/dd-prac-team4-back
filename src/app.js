const { app, connectDB } = require('./expressServer');
const logger = require('../logs/logger');

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
