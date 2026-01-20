const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

async function initDatabase() {
  console.log('Initializing PostgreSQL database...');

  try {
    // 既存のテーブルを削除（開発環境のみ推奨）
    await pool.query(`DROP TABLE IF EXISTS generation_runs CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS tools CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS categories CASCADE;`);
    
    console.log('✓ Dropped existing tables');

    // テーブル作成
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        "sortOrder" INTEGER DEFAULT 0
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tools (
        id SERIAL PRIMARY KEY,
        "categoryId" INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        "subCategory" TEXT,
        "thumbnailUrl" TEXT,
        tags TEXT,
        "isPremium" BOOLEAN DEFAULT FALSE,
        "metricValue" INTEGER DEFAULT 0,
        "customPrompt" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("categoryId") REFERENCES categories(id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS generation_runs (
        id SERIAL PRIMARY KEY,
        "toolId" INTEGER NOT NULL,
        "inputJson" TEXT NOT NULL,
        "outputText" TEXT NOT NULL,
        status TEXT DEFAULT 'success',
        "errorMessage" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("toolId") REFERENCES tools(id)
      );
    `);

    // インデックス作成
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tools_category ON tools("categoryId");
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_runs_tool ON generation_runs("toolId");
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_runs_created ON generation_runs("createdAt" DESC);
    `);

    console.log('✓ Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

initDatabase();
