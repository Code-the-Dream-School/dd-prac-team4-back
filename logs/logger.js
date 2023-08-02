const winston = require('winston')

// Define the log levels and colors (optional)
const logLevels = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
}

winston.addColors(logLevels)

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/app.log' }),
    ],
})

module.exports = logger
