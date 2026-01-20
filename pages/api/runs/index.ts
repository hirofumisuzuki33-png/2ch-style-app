import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'DELETE') {
    return handleDeleteAll(req, res);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { toolId, limit = '20', offset = '0' } = req.query;
    
    let query = `
      SELECT 
        gr.*,
        t.name as toolName,
        t.categoryId
      FROM generation_runs gr
      LEFT JOIN tools t ON gr.toolId = t.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (toolId) {
      query += ' AND gr.toolId = ?';
      params.push(toolId);
    }

    query += ' ORDER BY gr.createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const runs = db.prepare(query).all(...params);

    res.status(200).json(runs);
  } catch (error) {
    console.error('Error fetching runs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function handleDeleteAll(req: NextApiRequest, res: NextApiResponse) {
  try {
    db.prepare('DELETE FROM generation_runs').run();
    res.status(200).json({ message: 'All runs deleted' });
  } catch (error) {
    console.error('Error deleting runs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
