const winston = require('winston')

const capitalizeLevel = winston.format((info) => {
    info.level = info.level.toUpperCase()
    return info
})

const logger = winston.createLogger({
    // level: "debug",
    format: winston.format.combine(
        capitalizeLevel(),
        winston.format.errors({ stack: true }),
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
            if (stack) {
                return `${timestamp} [${level}]: ${message} - ${stack}`
            } else {
                return `${timestamp} [${level}]: ${message}`
            }
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/app.log' }),
    ],
})

module.exports = logger
