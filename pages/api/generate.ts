import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
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
    const toolResult = await pool.query('SELECT * FROM tools WHERE id = $1', [toolId]);
    const tool = toolResult.rows[0];
    
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    // カスタムプロンプトを取得
    const customPrompt = tool.customprompt || tool.tags || null;

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
    const result = await pool.query(
      `INSERT INTO generation_runs (toolId, inputJson, outputText, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        toolId,
        JSON.stringify(input),
        outputText,
        'success'
      ]
    );

    // メトリック値を更新（利用回数）
    await pool.query('UPDATE tools SET metricValue = metricValue + 1 WHERE id = $1', [toolId]);

    res.status(200).json({
      runId: result.rows[0].id,
      outputText,
    });
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
