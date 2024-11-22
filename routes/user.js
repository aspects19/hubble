const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const db = require('../models/Post');

// View own profile
router.get('/me', isAuthenticated, (req, res) => {
  try {
    const profile = db.prepare(`
      SELECT users.username, profiles.* 
      FROM users 
      LEFT JOIN profiles ON users.id = profiles.userId 
      WHERE users.id = ?
    `).get(req.session.userId);

    const posts = db.prepare(`
      SELECT posts.*, COUNT(likes.postId) as likeCount 
      FROM posts 
      LEFT JOIN likes ON posts.id = likes.postId 
      WHERE posts.userId = ? 
      GROUP BY posts.id 
      ORDER BY posts.created_at DESC
    `).all(req.session.userId);

    res.render('profile', {
      username: profile?.username,
      displayName: profile?.username, // Using username as displayName
      profile,
      posts: posts || [],
      isOwner: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { 
      errorCode: 500, 
      errorMsg: 'Failed to load profile' 
    });
  }
});

// Handle both /user/@username and /user/username patterns
router.get(['/@:username'], async (req, res) => {
  try {
    const username = req.params.username.replace('@', ''); // Remove @ if present
    
    const userProfile = db.prepare(`
      SELECT users.id as userId, users.username, profiles.* 
      FROM users 
      LEFT JOIN profiles ON users.id = profiles.userId 
      WHERE users.username = ?
    `).get(username);

    if (!userProfile) {
      return res.status(404).render('error', { 
        errorCode: 404, 
        errorMsg: 'User not found' 
      });
    }

    const posts = db.prepare(`
      SELECT posts.*, COUNT(likes.postId) as likeCount 
      FROM posts 
      LEFT JOIN likes ON posts.id = likes.postId 
      WHERE posts.userId = ? 
      GROUP BY posts.id 
      ORDER BY posts.created_at DESC
    `).all(userProfile.userId);

    res.render('profile', {
      username: userProfile.username,
      displayName: userProfile.username,
      profile: userProfile,
      posts: posts || [],
      isOwner: req.session?.userId === userProfile.userId
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { 
      errorCode: 500, 
      errorMsg: 'Failed to load profile' 
    });
  }
});

// Edit profile
router.post('/me', isAuthenticated, async (req, res) => {
  const { bio, location, website } = req.body;
  
  try {
    const stmt = db.prepare(`
      INSERT INTO profiles (userId, bio, location, website) 
      VALUES (?, ?, ?, ?)
      ON CONFLICT(userId) DO UPDATE SET 
        bio = excluded.bio,
        location = excluded.location, 
        website = excluded.website,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    stmt.run(req.session.userId, bio, location, website);
    res.redirect('/user/me');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

module.exports = router;
