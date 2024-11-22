const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const db = require('../models/Post');

router.get('/create', isAuthenticated, (req, res) => {
  res.render('create-post');
});

router.post('/create', isAuthenticated, (req, res) => {
  const { content } = req.body;
  
  if (!content || content.length > 1000) {
    return res.status(400).json({ message: 'Invalid post content' });
  }

  try {
    const stmt = db.prepare('INSERT INTO posts (userId, content) VALUES (?, ?)');
    stmt.run(req.session.userId, content);
    res.status(201).json({ message: 'Post created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

router.get("/post/:postID", (req, res) => {
  const postID = req.params.postID;
  res.render("post.ejs", { postID: postID });
});

module.exports = router;
