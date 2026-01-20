import { Pool } from 'pg';

// PostgreSQL接続プールを作成
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

// データベース接続をテスト
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;

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
  customPrompt?: string;
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
