const express = require("express");
const router = express.Router();

router.get("/create", (req, res) => {
  res.render("create-post.ejs");
});

router.get("/post/:postID", (req, res) => {
  const postID = req.params.postID;
  res.render("post.ejs", { postID: postID });
});

module.exports = router;
