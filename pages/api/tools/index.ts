import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { categoryId, q, sort = 'popular', limit = '20', offset = '0' } = req.query;
    
    let query = 'SELECT * FROM tools WHERE 1=1';
    const params: any[] = [];

    // カテゴリフィルタ
    if (categoryId) {
      query += ' AND categoryId = ?';
      params.push(categoryId);
    }

    // キーワード検索
    if (q && typeof q === 'string') {
      query += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)';
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // ソート
    if (sort === 'popular') {
      query += ' ORDER BY metricValue DESC, createdAt DESC';
    } else if (sort === 'new') {
      query += ' ORDER BY createdAt DESC';
    }

    // ページング用のカウント
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = db.prepare(countQuery).get(...params) as { total: number };
    const total = countResult.total;

    // ページング
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const tools = db.prepare(query).all(...params);
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
