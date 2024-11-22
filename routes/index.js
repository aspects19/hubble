const express = require('express');
const router = express.Router();
const db = require('../models/Post');

router.get('/', (req, res) => {
  try {
    let posts;
    if (req.session?.userId) {
      // Get personalized recommendations
      posts = db.prepare(`
        SELECT posts.*, users.username 
        FROM posts 
        JOIN users ON posts.userId = users.id 
        WHERE posts.userId IN (
          SELECT DISTINCT userId 
          FROM posts 
          GROUP BY userId 
          ORDER BY COUNT(*) DESC
        ) 
        ORDER BY posts.created_at DESC 
        LIMIT 20
      `).all();
    } else {
      // Get trending posts
      posts = db.prepare(`
        SELECT posts.*, users.username 
        FROM posts 
        JOIN users ON posts.userId = users.id 
        ORDER BY posts.likes DESC, posts.created_at DESC 
        LIMIT 20
      `).all();
    }
    res.render('index', { posts, user: req.session?.userId });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { 
      errorCode: 500, 
      errorMsg: 'Failed to load posts' 
    });
  }
});

module.exports = router;
