import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data.db');
const db = new Database(dbPath);

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

export default db;

// 型定義
export interface Category {
  id: number;
  name: string;
  sortOrder: number;
}

export interface Tool {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  subCategory?: string;
  thumbnailUrl?: string;
  tags?: string;
  isPremium: boolean;
  metricValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationRun {
  id: number;
  toolId: number;
  inputJson: string;
  outputText: string;
  status: 'success' | 'error';
  errorMessage?: string;
  createdAt: string;
}
