// logger.js
const winston = require("winston");
const moment = require("moment-timezone");
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json, metadata } = format;
const DailyRotateFile = require("winston-daily-rotate-file");

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};

const logFormat = printf(({ level, message }) => {
    const timeNow = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
    const context = metadata.function ? `[${metadata.function}]` : "";
    return `${timeNow} [${level}]${context}: ${message}`;
});
// Configure the logger
const logger = createLogger({
    levels,
    level: "info",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
        json()
    ),
    transports: [
        new transports.Console({
            format: combine(colorize(), logFormat),
        }),

        new DailyRotateFile({
            filename: "log/combined-%DATE%.log", // File name pattern
            datePattern: "YYYY-MM-DD", // Rotate logs daily
            zippedArchive: true, // Compress old logs
            maxSize: "50m", // Rotate if file size exceeds 20MB
            format: combine(logFormat),
        }),
    ],
});
module.exports = logger;
