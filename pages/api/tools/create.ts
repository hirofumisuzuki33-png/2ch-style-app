import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      name, 
      description, 
      categoryId, 
      subCategory, 
      isPremium, 
      customPrompt 
    } = req.body;

    // バリデーション
    if (!name || !description || !categoryId) {
      return res.status(400).json({ 
        error: 'name, description, and categoryId are required' 
      });
    }

    // ツールを作成
    const result = await pool.query(
      `INSERT INTO tools (
        "categoryId", 
        name, 
        description, 
        "subCategory", 
        "isPremium", 
        "customPrompt", 
        "metricValue"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id, 
        "categoryId", 
        name, 
        description, 
        "subCategory", 
        "thumbnailUrl",
        tags,
        "isPremium", 
        "metricValue",
        "createdAt",
        "updatedAt",
        "customPrompt"`,
      [
        categoryId,
        name,
        description,
        subCategory || null,
        isPremium || false,
        customPrompt || null,
        0 // 初期利用回数は0
      ]
    );

    const newTool = result.rows[0];

    res.status(201).json({
      success: true,
      tool: newTool,
    });
  } catch (error) {
    console.error('Error creating tool:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
