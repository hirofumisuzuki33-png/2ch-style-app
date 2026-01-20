import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const categories = db.prepare(`
      SELECT 
        c.id,
        c.name,
        c.sortOrder,
        COUNT(t.id) as count
      FROM categories c
      LEFT JOIN tools t ON c.id = t.categoryId
      GROUP BY c.id
      ORDER BY c.sortOrder ASC
    `).all();

    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
