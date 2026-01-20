import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
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
    const stmt = db.prepare(`
      INSERT INTO tools (
        categoryId, 
        name, 
        description, 
        subCategory, 
        isPremium, 
        tags, 
        metricValue
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      categoryId,
      name,
      description,
      subCategory || null,
      isPremium ? 1 : 0,
      customPrompt || null, // tagsフィールドにカスタムプロンプトを保存
      0 // 初期利用回数は0
    );

    const newTool = db.prepare('SELECT * FROM tools WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      tool: newTool,
    });
  } catch (error) {
    console.error('Error creating tool:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
