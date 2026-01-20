import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    const result = await pool.query('SELECT * FROM tools WHERE id = $1', [id]);
    const tool = result.rows[0];

    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    res.status(200).json(tool);
  } catch (error) {
    console.error('Error fetching tool:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
