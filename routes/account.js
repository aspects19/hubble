const express = require('express');
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const path = require('path');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Construct the database path using process.env.ROOT
const dbPath = path.join(process.env.ROOT, 'database/database.db');
const db = new Database(dbPath);

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiter to all requests
router.use(limiter);

// Render registration form
router.get('/register', (req, res) => {
  res.render('register');
});

// Render login form
router.get('/login', (req, res) => {
  res.render('login');
});

// Register route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    stmt.run(username, hashedPassword);
    console.log('User registered:', username);
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    console.error('Error during registration:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      res.status(400).json({ message: 'Username already exists' });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.userId = user.id;
        console.log('Login successful:', username);
        res.status(200).json({ message: 'Login successful' });
      } else {
        console.log('Password does not match for user:', username);
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      console.log('User not found:', username);
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});

// Render registration form
router.get('/register', (req, res) => {
  res.render('register');
});

// Render login form
router.get('/login', (req, res) => {
  res.render('login');
});

module.exports = router;
