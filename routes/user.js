const express = require('express');
const router = express.Router();

// Define the /user/me route
router.get('/me', (req, res) => {
  const username = 'yourUsername'; // Hardcoded username
  const displayName = 'Your Display Name'; // Hardcoded display name
  res.render('profile', { username, displayName }); // Pass both 'username' and 'displayName'
});

// Define the /user/@username route
router.get('/@:username', (req, res) => {
  const { username } = req.params; // Extract username from the URL
  const displayName = 'Hardcoded Display Name'; // Hardcoded display name for now
  res.render('profile', { username, displayName }); // Pass both 'username' and 'displayName'
});

module.exports = router;
