const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

// Set ROOT path
process.env.ROOT = path.resolve(__dirname);
console.log(`Project root set to: ${process.env.ROOT}`);

// Ensure database directory exists
const dbDir = path.join(process.env.ROOT, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new Database(path.join(dbDir, 'database.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Drop existing tables to avoid conflicts
db.exec(`
  DROP TABLE IF EXISTS likes;
  DROP TABLE IF EXISTS posts;
  DROP TABLE IF EXISTS users;
`);

// Create tables with consistent column naming
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Posts table
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Likes table for tracking user engagement
  CREATE TABLE IF NOT EXISTS likes (
    userId INTEGER NOT NULL,
    postId INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, postId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_posts_likes ON posts(likes DESC);
  CREATE INDEX IF NOT EXISTS idx_posts_userId ON posts(userId);
`);

console.log("✅ Database schema updated successfully");
db.close();