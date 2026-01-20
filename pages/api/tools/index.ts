import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { categoryId, q, sort = 'popular', limit = '20', offset = '0' } = req.query;
    
    let query = 'SELECT * FROM tools WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // カテゴリフィルタ
    if (categoryId) {
      query += ` AND categoryId = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }

    // キーワード検索
    if (q && typeof q === 'string') {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex+1} OR tags ILIKE $${paramIndex+2})`;
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      paramIndex += 3;
    }

    // ソート
    if (sort === 'popular') {
      query += ' ORDER BY metricValue DESC, createdAt DESC';
    } else if (sort === 'new') {
      query += ' ORDER BY createdAt DESC';
    }

    // ページング用のカウント
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)::int as total');
    const countResult = await pool.query(countQuery, params);
    const total = countResult.rows[0].total;

    // ページング
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex+1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);
    const tools = result.rows;
    const hasMore = parseInt(offset as string) + tools.length < total;

    res.status(200).json({
      tools,
      total,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
