const express = require("express");
const router = express.Router();

// Define the /api/data route
router.get("/data", (req, res) => {
  res.json({ success: true, data: "Here is your data" });
});

module.exports = router;
