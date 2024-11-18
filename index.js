const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

require("dotenv").config();

const port = process.env.PORT || 3000;

// Import routes
const indexRoute = require("./routes/index");
const accountRoute = require("./routes/account");
const searchRoute = require("./routes/search");
const notificationsRoute = require("./routes/notifications");
const settingsRoute = require("./routes/settings");
const userRoute = require("./routes/user");
const apiRoute = require("./routes/api");
const postRoute = require("./routes/post");

// Enable CORS
app.use(cors());

// Serve static files from the 'public' folder
app.use(express.static("public"));
app.use("/bootstrap", express.static(path.join(__dirname, "node_modules/bootstrap/dist")));
app.use("/bootstrap-icons/font", express.static(path.join(__dirname, "node_modules/bootstrap-icons/font")));

// Set EJS as view engine
app.set("view engine", "ejs");

// Use routes
app.use("/", indexRoute);
app.use("/account", accountRoute);
app.use("/post", postRoute);
app.use("/search", searchRoute);
app.use("/notifications", notificationsRoute);
app.use("/settings", settingsRoute);
app.use("/user", userRoute);
app.use("/api", apiRoute);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).render("error", {
    errorCode: 404,
    errorMsg: "Page Not Found"
  });
});

// Error-handling middleware
app.use((err, req, res) => {
  console.error(err.stack); // Log the error for debugging
  res.status(500).render("error", {
    errorCode: 500,
    errorMsg: "Something went wrong. Please try again later."
  });
});

// Start the server
app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
