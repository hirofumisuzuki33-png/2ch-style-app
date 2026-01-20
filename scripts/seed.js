const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

// カテゴリデータ
const categories = [
  { name: 'ブログ記事制作', sortOrder: 1 },
  { name: 'X(Twitter)', sortOrder: 2 },
  { name: 'Instagram', sortOrder: 3 },
  { name: 'メール', sortOrder: 4 },
  { name: 'マーケティング', sortOrder: 5 },
  { name: 'ビジネス文書', sortOrder: 6 },
];

// ツールデータ
const tools = [
  {
    categoryId: 1,
    name: 'ブログ記事タイトル生成',
    description: 'SEOに最適化された魅力的なブログ記事のタイトルを生成します。キーワードを入力するだけで、複数の候補を提案します。',
    subCategory: 'SEO',
    isPremium: false,
    metricValue: 1250,
  },
  {
    categoryId: 1,
    name: 'ブログ記事本文生成',
    description: 'テーマとキーワードから、構造化された高品質なブログ記事本文を生成します。見出しや段落を自動で構成します。',
    subCategory: 'コンテンツ',
    isPremium: true,
    metricValue: 980,
  },
  {
    categoryId: 1,
    name: 'メタディスクリプション生成',
    description: '検索結果に表示されるメタディスクリプションを最適化して生成します。クリック率向上に貢献します。',
    subCategory: 'SEO',
    isPremium: false,
    metricValue: 756,
  },
  {
    categoryId: 2,
    name: 'ツイート文章生成',
    description: '140文字以内で印象的なツイートを生成します。エンゲージメントを高める表現を提案します。',
    subCategory: 'SNS投稿',
    isPremium: false,
    metricValue: 2340,
  },
  {
    categoryId: 2,
    name: 'スレッド投稿生成',
    description: '複数ツイートで構成されるスレッド投稿を生成します。ストーリー性のある投稿を作成できます。',
    subCategory: 'SNS投稿',
    isPremium: true,
    metricValue: 1120,
  },
  {
    categoryId: 2,
    name: 'ハッシュタグ提案',
    description: '投稿内容に最適なハッシュタグを提案します。リーチ拡大に効果的なタグを選定します。',
    subCategory: 'SNS投稿',
    isPremium: false,
    metricValue: 1890,
  },
  {
    categoryId: 3,
    name: 'Instagram投稿キャプション',
    description: 'エンゲージメントを高めるInstagram投稿のキャプションを生成します。絵文字も適切に配置します。',
    subCategory: 'SNS投稿',
    isPremium: false,
    metricValue: 1560,
  },
  {
    categoryId: 3,
    name: 'ストーリーズテキスト生成',
    description: 'Instagram Stories用の短くて印象的なテキストを生成します。視覚的なインパクトを重視します。',
    subCategory: 'SNS投稿',
    isPremium: false,
    metricValue: 890,
  },
  {
    categoryId: 3,
    name: 'リール用スクリプト',
    description: 'Instagram Reels用の動画スクリプトを生成します。15〜60秒の動画に最適化された構成を提案します。',
    subCategory: 'コンテンツ',
    isPremium: true,
    metricValue: 670,
  },
  {
    categoryId: 4,
    name: 'ビジネスメール作成',
    description: 'フォーマルなビジネスメールを生成します。件名、本文、署名まで一貫した文章を作成します。',
    subCategory: 'ビジネス',
    isPremium: false,
    metricValue: 2100,
  },
  {
    categoryId: 4,
    name: 'お礼メール作成',
    description: '感謝の気持ちを伝えるお礼メールを生成します。状況に応じた適切な表現を使用します。',
    subCategory: 'ビジネス',
    isPremium: false,
    metricValue: 1450,
  },
  {
    categoryId: 4,
    name: 'フォローアップメール',
    description: '商談後や会議後のフォローアップメールを生成します。次のアクションを促す内容を提案します。',
    subCategory: 'ビジネス',
    isPremium: false,
    metricValue: 980,
  },
  {
    categoryId: 5,
    name: '広告コピー生成',
    description: '商品やサービスの魅力を伝える広告コピーを生成します。ターゲットに響く表現を提案します。',
    subCategory: '広告',
    isPremium: true,
    metricValue: 1780,
  },
  {
    categoryId: 5,
    name: 'ランディングページ見出し',
    description: 'コンバージョンを高めるランディングページの見出しを生成します。訴求力の高い表現を使用します。',
    subCategory: 'Web',
    isPremium: true,
    metricValue: 1340,
  },
  {
    categoryId: 5,
    name: 'プレスリリース作成',
    description: '企業のニュースを効果的に伝えるプレスリリースを生成します。メディア向けの構成を採用します。',
    subCategory: 'PR',
    isPremium: true,
    metricValue: 560,
  },
  {
    categoryId: 6,
    name: '企画書サマリー作成',
    description: '企画の要点を簡潔にまとめたサマリーを生成します。経営層への説明に最適です。',
    subCategory: '企画',
    isPremium: false,
    metricValue: 890,
  },
  {
    categoryId: 6,
    name: '議事録作成',
    description: '会議の内容から議事録を生成します。決定事項とアクションアイテムを明確にします。',
    subCategory: '会議',
    isPremium: false,
    metricValue: 1230,
  },
  {
    categoryId: 6,
    name: '報告書作成',
    description: 'プロジェクトの進捗や成果をまとめた報告書を生成します。データを効果的に説明します。',
    subCategory: 'レポート',
    isPremium: true,
    metricValue: 720,
  },
];

async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // 既存データをチェック
    const categoryCount = await pool.query('SELECT COUNT(*) FROM categories');
    if (parseInt(categoryCount.rows[0].count) > 0) {
      console.log('✓ Database already seeded, skipping...');
      return;
    }

    // カテゴリ投入
    for (const category of categories) {
      await pool.query(
        'INSERT INTO categories (name, "sortOrder") VALUES ($1, $2)',
        [category.name, category.sortOrder]
      );
    }
    console.log(`✓ Inserted ${categories.length} categories`);

    // ツール投入
    for (const tool of tools) {
      await pool.query(
        `INSERT INTO tools ("categoryId", name, description, "subCategory", "isPremium", "metricValue")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          tool.categoryId,
          tool.name,
          tool.description,
          tool.subCategory,
          tool.isPremium,
          tool.metricValue,
        ]
      );
    }
    console.log(`✓ Inserted ${tools.length} tools`);

    console.log('✓ Seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedDatabase();
