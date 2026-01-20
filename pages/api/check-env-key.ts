import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // .env.localにAPIキーが設定されているかチェック
  const hasKey = !!process.env.GEMINI_API_KEY;

  res.status(200).json({ hasKey });
}
