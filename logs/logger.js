const winston = require('winston')

const capitalizeLevel = winston.format((info) => {
    info.level = info.level.toUpperCase()
    return info
})

winston.addColors(logLevels)

const logger = winston.createLogger({
    // level: "debug",
    levels: logLevels,
    format: winston.format.combine(
        capitalizeLevel(),
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/app.log' }),
    ],
})

module.exports = logger
