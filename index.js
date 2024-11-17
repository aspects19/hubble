const express = require('express');
const app = express();
const port = 3000;

// Serve static files from the 'public' folder
app.use(express.static('public'));
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'));
app.use('/bootstrap-icons', express.static('node_modules/bootstrap-icons/'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index'); // Renders index.ejs
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
