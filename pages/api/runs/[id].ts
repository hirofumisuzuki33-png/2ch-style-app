import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    const result = db.prepare('DELETE FROM generation_runs WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Run not found' });
    }

    res.status(200).json({ message: 'Run deleted' });
  } catch (error) {
    console.error('Error deleting run:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
