import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'DELETE') {
    return handleDeleteAll(req, res);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { toolId, limit = '20', offset = '0' } = req.query;
    
    let query = `
      SELECT 
        gr.id,
        gr.toolid as "toolId",
        gr.inputjson as "inputJson",
        gr.outputtext as "outputText",
        gr.status,
        gr.errormessage as "errorMessage",
        gr.createdat as "createdAt",
        t.name as "toolName",
        t.categoryid as "categoryId"
      FROM generation_runs gr
      LEFT JOIN tools t ON gr.toolid = t.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (toolId) {
      query += ` AND gr.toolid = $${paramIndex}`;
      params.push(toolId);
      paramIndex++;
    }

    query += ` ORDER BY gr.createdat DESC LIMIT $${paramIndex} OFFSET $${paramIndex+1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching runs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleDeleteAll(req: NextApiRequest, res: NextApiResponse) {
  try {
    await pool.query('DELETE FROM generation_runs');
    res.status(200).json({ message: 'All runs deleted' });
  } catch (error) {
    console.error('Error deleting runs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
