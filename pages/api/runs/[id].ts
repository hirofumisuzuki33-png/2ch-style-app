import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    const result = await pool.query('DELETE FROM generation_runs WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Run not found' });
    }

    res.status(200).json({ message: 'Run deleted' });
  } catch (error) {
    console.error('Error deleting run:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
