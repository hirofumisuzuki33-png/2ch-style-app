const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data.db');
const db = new Database(dbPath);

console.log('Initializing database...');

// テーブル作成
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sortOrder INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoryId INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    subCategory TEXT,
    thumbnailUrl TEXT,
    tags TEXT,
    isPremium INTEGER DEFAULT 0,
    metricValue INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS generation_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    toolId INTEGER NOT NULL,
    inputJson TEXT NOT NULL,
    outputText TEXT NOT NULL,
    status TEXT DEFAULT 'success',
    errorMessage TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (toolId) REFERENCES tools(id)
  );

  CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(categoryId);
  CREATE INDEX IF NOT EXISTS idx_runs_tool ON generation_runs(toolId);
  CREATE INDEX IF NOT EXISTS idx_runs_created ON generation_runs(createdAt DESC);
`);

console.log('✓ Database initialized successfully!');
db.close();
