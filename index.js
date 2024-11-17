const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3001;

// Import routes
const indexRoute = require('./routes/index');
const userRoute = require('./routes/user');
const apiRoute = require('./routes/api');

// Enable CORS
app.use(cors());

// Serve static files from the 'public' folder
app.use(express.static('public'));
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'));
app.use('/bootstrap-icons', express.static('node_modules/bootstrap-icons/'));

// Set EJS as view engine
app.set('view engine', 'ejs');

// Use routes
app.use('/', indexRoute);
app.use('/user', userRoute);
app.use('/api', apiRoute);

// Start the server
app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
