import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.sortorder as "sortOrder",
        COUNT(t.id)::int as count
      FROM categories c
      LEFT JOIN tools t ON c.id = t.categoryid
      GROUP BY c.id, c.name, c.sortorder
      ORDER BY c.sortorder ASC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
