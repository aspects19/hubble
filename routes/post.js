const express = require("express");
const router = express.Router();

// Define the /api/data route
router.get("/create", (req, res) => {
  res.render("create-post.ejs");
});

module.exports = router;
