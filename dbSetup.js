const Database = require('better-sqlite3');
const db = new Database('./database.db');

// Create the users table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`;

db.exec(createTableQuery);

console.log("✅ Users table created or already exists.");

db.close();