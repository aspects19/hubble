const Database = require('better-sqlite3');
const db = new Database('./myapp.db');

module.exports = db;