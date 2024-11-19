const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
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

// Enable CORS with specific configuration
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allow specific headers
}));

// Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));
app.use("/bootstrap", express.static(path.join(__dirname, "node_modules/bootstrap/dist")));
app.use("/bootstrap-icons/font", express.static(path.join(__dirname, "node_modules/bootstrap-icons/font")));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Routes
app.use("/", indexRoute);
app.use("/account", accountRoute);
app.use("/search", searchRoute);
app.use("/notifications", notificationsRoute);
app.use("/settings", settingsRoute);
app.use("/user", userRoute);
app.use("/api", apiRoute);
app.use("/post", postRoute);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).render("error", {
    errorCode: 404,
    errorMsg: "Page Not Found"
  });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging
  res.status(500).render("error", {
    errorCode: 500,
    errorMsg: "Something went wrong. Please try again later."
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
