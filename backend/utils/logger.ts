import winston from 'winston';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Choose the aspect of your log customizing the log format
const format = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  errors({ stack: true }),
  json()
);

// Define which transports the logger must use to print out messages
const transports = [
  // Allow console logging only in development
  new winston.transports.Console({
    format: combine(
      colorize({ all: true }),
      simple()
    ),
  }),
  // Allow to print all the error level messages inside the error.log file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  // Allow to print all the messages inside the all.log file
  new winston.transports.File({
    filename: 'logs/all.log',
  }),
];

// Create the logger instance that has to be exported 
// and used to log messages.
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  format,
  transports,
});

// Create a stream object with a 'write' function that will be used by `morgan`
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
