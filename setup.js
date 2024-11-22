const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Set the ROOT environment variable to the root of the project
process.env.ROOT = path.resolve(__dirname);

console.log(`Project root set to: ${process.env.ROOT}`);

// Construct the database path using process.env.ROOT
const dbDir = path.join(process.env.ROOT, 'database');
const dbPath = path.join(dbDir, 'database.db');

// Ensure the database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`Created database directory at: ${dbDir}`);
}

// Open the database
const db = new Database(dbPath);

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