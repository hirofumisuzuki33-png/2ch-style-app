import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { generateText } from '@/lib/gemini';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { toolId, input, model, apiKey } = req.body;

    if (!toolId || !input) {
      return res.status(400).json({ error: 'toolId and input are required' });
    }

    // ツールの存在確認
    const tool = db.prepare('SELECT * FROM tools WHERE id = ?').get(toolId) as any;
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    // カスタムプロンプトを取得（tagsフィールドに保存されている）
    const customPrompt = tool.tags || null;

    // Gemini APIを使用してテキスト生成（モデル指定、APIキー、カスタムプロンプト）
    const outputText = await generateText(
      tool.name,
      tool.description,
      input,
      model || 'gemini-2.5-flash',
      apiKey,
      customPrompt
    );

    // 生成結果を保存
    const stmt = db.prepare(`
      INSERT INTO generation_runs (toolId, inputJson, outputText, status)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      toolId,
      JSON.stringify(input),
      outputText,
      'success'
    );

    // メトリック値を更新（利用回数）
    db.prepare('UPDATE tools SET metricValue = metricValue + 1 WHERE id = ?').run(toolId);

    res.status(200).json({
      runId: result.lastInsertRowid,
      outputText,
    });
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
