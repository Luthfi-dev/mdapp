
import winston from 'winston';
import path from 'path';

// This ensures the 'logs' directory exists at the project root
const logsDir = path.join(process.cwd(), 'logs');
try {
  require('fs').mkdirSync(logsDir, { recursive: true });
} catch (e) {
  console.error("Could not create logs directory", e);
}


// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
  let log = `${timestamp} ${level}: ${message}`;
  if (stack) {
    log += `\n${stack}`;
  }
  // If there's other metadata, stringify it
  if (Object.keys(metadata).length > 0) {
    log += `\n${JSON.stringify(metadata, null, 2)}`;
  }
  return log;
});

const logger = winston.createLogger({
  level: 'info', // Log 'info' and above ('warn', 'error')
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // Log the full stack trace
    winston.format.splat(),
    logFormat
  ),
  transports: [
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    new winston.transports.File({ 
        filename: path.join(logsDir, 'error.log'), 
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
    new winston.transports.File({ 
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
  ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
    level: 'debug', // Show all logs in development console
  }));
}

export default logger;
