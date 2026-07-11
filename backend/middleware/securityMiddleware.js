const rateLimit = require('express-rate-limit');
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

const globalLimiter = isProduction
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        message: 'Too many requests from this IP, please try again later.',
      },
    })
  : (req, res, next) => next();

const authLimiter = isProduction
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        message: 'Too many authentication attempts, please try again later.',
      },
    })
  : (req, res, next) => next();

module.exports = {
  corsOptions,
  globalLimiter,
  authLimiter,
};
