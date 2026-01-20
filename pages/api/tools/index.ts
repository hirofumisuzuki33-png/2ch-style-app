import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { categoryId, q, sort = 'popular', limit = '20', offset = '0' } = req.query;
    
    let query = `SELECT 
      id, 
      "categoryId" as "categoryId", 
      name, 
      description, 
      "subCategory" as "subCategory", 
      "thumbnailUrl" as "thumbnailUrl",
      tags,
      "isPremium" as "isPremium", 
      "metricValue" as "metricValue",
      "createdAt" as "createdAt",
      "updatedAt" as "updatedAt",
      "customPrompt" as "customPrompt"
    FROM tools WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    // カテゴリフィルタ
    if (categoryId) {
      query += ` AND "categoryId" = $${paramIndex}`;
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
      query += ' ORDER BY 10 DESC, 11 DESC';  // metricValue, createdAt
    } else if (sort === 'new') {
      query += ' ORDER BY 11 DESC';  // createdAt
    }

    // ページング用のカウント（ORDER BYを削除）
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*)::int as total FROM').replace(/ORDER BY.*$/, '');
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
