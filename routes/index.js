const express = require("express");
const router = express.Router();

// Define the root route
router.get("/", (req, res) => {
  res.render("index"); // Renders index.ejs
});

module.exports = router;
