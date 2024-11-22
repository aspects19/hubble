const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

process.env.ROOT = path.resolve(__dirname);
console.log(`Project root set to: ${process.env.ROOT}`);

const dbDir = path.join(process.env.ROOT, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'database.db'));
db.pragma('foreign_keys = ON');

// Check if tables exist
const tablesExist = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name IN ('users', 'posts', 'likes', 'profiles', 'sessions')
`).all();

if (tablesExist.length < 5) {
  console.log("Creating database schema...");
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS profiles (
      userId INTEGER PRIMARY KEY,
      bio TEXT DEFAULT NULL,
      avatar TEXT DEFAULT NULL,
      location TEXT DEFAULT NULL,
      website TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

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

    CREATE TABLE IF NOT EXISTS likes (
      userId INTEGER NOT NULL,
      postId INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (userId, postId),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expired DATETIME NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_posts_likes ON posts(likes DESC);
    CREATE INDEX IF NOT EXISTS idx_posts_userId ON posts(userId);
    CREATE INDEX IF NOT EXISTS idx_sessions_expired ON sessions(expired);
  `);

  console.log("✅ Database schema created successfully");
} else {
  console.log("✅ Database schema already exists");
}

// Before creating tables, check for htmlContent column
const hasHtmlColumn = db.prepare(`
  SELECT COUNT(*) as count 
  FROM pragma_table_info('posts') 
  WHERE name='htmlContent'
`).get();

if (!hasHtmlColumn.count) {
  db.exec(`
    ALTER TABLE posts ADD COLUMN htmlContent TEXT;
  `);
  console.log("✅ Added htmlContent column to posts table");
}

db.close();