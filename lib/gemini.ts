import { GoogleGenerativeAI } from '@google/generative-ai';

// サーバーサイドの環境変数からAPIキーを取得（優先）
const serverApiKey = process.env.GEMINI_API_KEY;

if (!serverApiKey) {
  console.warn('GEMINI_API_KEY is not set in .env.local. Client-provided key will be used.');
}

export async function generateText(
  toolName: string,
  toolDescription: string,
  input: {
    title?: string;
    text: string;
    tone?: string;
    length?: string;
  },
  modelName: string = 'gemini-2.5-flash',
  clientApiKey?: string,
  customPrompt?: string
): Promise<string> {
  // APIキーの優先順位: 1) サーバー環境変数 2) クライアント提供
  const apiKey = serverApiKey || clientApiKey;

  // APIキーが設定されていない場合はダミー生成
  if (!apiKey) {
    return generateDummyText(toolName, input);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    // プロンプトを構築（カスタムプロンプトがあれば使用）
    let prompt: string;
    
    if (customPrompt) {
      // カスタムプロンプトの変数を置換
      prompt = customPrompt
        .replace(/\{\{toolName\}\}/g, toolName)
        .replace(/\{\{description\}\}/g, toolDescription)
        .replace(/\{\{title\}\}/g, input.title || '')
        .replace(/\{\{text\}\}/g, input.text)
        .replace(/\{\{tone\}\}/g, input.tone || 'ニュートラル')
        .replace(/\{\{length\}\}/g, input.length || '中程度');
    } else {
      // デフォルトプロンプト
      prompt = `あなたは「${toolName}」というツールです。\n`;
      prompt += `このツールの説明: ${toolDescription}\n\n`;
      prompt += `以下の情報に基づいて、適切なテキストを生成してください。\n\n`;

      if (input.title) {
        prompt += `タイトル: ${input.title}\n`;
      }

      prompt += `内容: ${input.text}\n`;

      if (input.tone) {
        prompt += `トーン: ${input.tone}\n`;
      }

      if (input.length) {
        const lengthMap: Record<string, string> = {
          short: '200文字程度',
          medium: '300〜500文字程度',
          long: '500文字以上',
        };
        prompt += `文字数: ${lengthMap[input.length] || input.length}\n`;
      }

      prompt += `\n生成するテキスト:`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error generating with Gemini:', error);
    // エラー時はダミー生成にフォールバック
    return generateDummyText(toolName, input);
  }
}

function generateDummyText(
  toolName: string,
  input: {
    title?: string;
    text: string;
    tone?: string;
    length?: string;
  }
): string {
  let output = `【${toolName}】で生成されたテキスト\n\n`;

  if (input.title) {
    output += `タイトル: ${input.title}\n\n`;
  }

  output += `入力内容: ${input.text}\n\n`;

  if (input.tone) {
    output += `トーン: ${input.tone}\n`;
  }

  if (input.length) {
    output += `文字数: ${input.length}\n`;
  }

  output += `\n--- 生成結果 ---\n\n`;
  output += `${input.text}に基づいて、${toolName}を使用して生成されたコンテンツです。\n\n`;
  output += `これはダミー生成です。.env.localファイルにGEMINI_API_KEYを設定すると、実際のGemini APIを使用できます。\n\n`;
  output += `入力されたテキストを元に、適切な形式で整形・拡張されたコンテンツがここに表示されます。`;

  return output;
}
