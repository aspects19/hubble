require('./setup');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const csurf = require('csurf');
const rateLimit = require('express-rate-limit');
const path = require('path');
const app = express();

const port = process.env.PORT || 3000;

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => req.session?.userId || req.ip
});

const limiter = createRateLimiter(15 * 60 * 1000, 100, 'Too many requests');
const authLimiter = createRateLimiter(60 * 60 * 1000, 1000, 'Too many auth requests');

// Core middleware
app.use(limiter);
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));
app.use(csurf());
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.header('Service-Worker-Allowed', '/');
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/bootstrap-icons/font', express.static(path.join(__dirname, 'node_modules/bootstrap-icons/font')));

// Service worker and manifest
app.get('/service-worker.js', (req, res) => {
  res.type('application/javascript').sendFile(path.join(__dirname, 'public/service-worker.js'));
});
app.get('/manifest.json', (req, res) => {
  res.type('application/json').sendFile(path.join(__dirname, 'public/manifest.json'));
});

// Routes with rate limiting
app.use('/account', authLimiter, require('./routes/account'));
app.use('/api', authLimiter, require('./routes/api'));
app.use('/search', createRateLimiter(5 * 60 * 1000, 50), require('./routes/search'));
app.use('/post', createRateLimiter(10 * 60 * 1000, 30), require('./routes/post'));

// Basic routes
[
  ['/', 'index'],
  ['/notifications', 'notifications'],
  ['/settings', 'settings'],
  ['/user', 'user']
].forEach(([url, route]) => app.use(url, require(`./routes/${route}`)));

// Error handlers
app.use((req, res) => res.status(404).render('error', { errorCode: 404, errorMsg: 'Page Not Found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { errorCode: 500, errorMsg: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
