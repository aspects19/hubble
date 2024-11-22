const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../models/Post');

// Rate limiter middleware
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests, please try again later.' }
});

// Input validation middleware
const validateInput = (req, res, next) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  
  next();
};

// Routes
router.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/user/me');
  }
  res.render('register', { error: null });
});

router.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/user/me');
  }
  res.render('login', { error: null });
});

router.post('/register', limiter, validateInput, async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Use transaction to create user and profile
    db.transaction(() => {
      const user = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);
      db.prepare('INSERT INTO profiles (userId) VALUES (?)').run(user.lastInsertRowid);
    })();
    
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', limiter, validateInput, async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.save(() => {
      res.status(200).json({ message: 'Login successful' });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.redirect('/account/login');
  });
});

module.exports = router;
