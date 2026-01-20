# テキスト生成ツール（生成ツール一覧型）

多数のテキスト生成ツールをカテゴリで絞り込み・検索し、入力から生成、結果表示、履歴保存までできるWebアプリケーションです。

## 機能

- ✨ **ツール一覧表示**: カテゴリチップとキーワード検索で絞り込み
- 🔄 **無限スクロール**: スムーズなツール閲覧体験
- 📝 **テキスト生成**: 入力フォームから簡単にテキスト生成
- 📚 **履歴管理**: 生成したテキストの履歴を保存・閲覧
- 🎨 **モダンUI**: shadcn/ui + Tailwind CSS + Framer Motion
- 🔒 **プレミアム表示**: 有料ツールの視覚的な区別

## 技術スタック

- **フレームワーク**: Next.js 14 (Pages Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui + Radix UI
- **アニメーション**: Framer Motion
- **アイコン**: Lucide React
- **データベース**: SQLite (better-sqlite3)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルをプロジェクトルートに作成し、Gemini APIキーを設定します：

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
```

**Gemini APIキーの取得方法：**
1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. 「APIキーを作成」をクリック
3. 生成されたAPIキーをコピーして `.env.local` に貼り付け

> 💡 APIキーを設定しない場合は、ダミー生成モードで動作します。

> ⚠️ **セキュリティ警告**: 
> - `.env.local` ファイルは `.gitignore` に含まれており、Gitリポジトリにコミットされません
> - **絶対にAPIキーをコードに直接記述しないでください**
> - PublicリポジトリにAPIキーを誤ってコミットすると、Githubが自動検出して無効化します
> - 詳細: [Secret Scanning について](https://docs.github.com/ja/code-security/secret-scanning/introduction/about-secret-scanning)

### 3. データベースの初期化とシードデータ投入

```bash
npm run init-db
npm run seed
```

これにより、以下が作成されます：
- `data.db` ファイル（SQLiteデータベース）
- カテゴリデータ（6カテゴリ）
- ツールデータ（18ツール）

### 4. 開発サーバーの起動

```bash
npx next dev -p 3001
```

ブラウザで [http://localhost:3001](http://localhost:3001) を開きます。

## プロジェクト構造

```
.
├── components/
│   ├── layout/          # レイアウトコンポーネント
│   │   ├── sidebar.tsx
│   │   └── main-layout.tsx
│   ├── tools/           # ツール関連コンポーネント
│   │   ├── category-chips.tsx
│   │   └── tool-card.tsx
│   └── ui/              # shadcn/ui コンポーネント
├── pages/
│   ├── api/             # APIルート
│   │   ├── categories.ts
│   │   ├── tools/
│   │   ├── generate.ts
│   │   └── runs/
│   ├── tools/           # ツール画面
│   │   ├── index.tsx    # 一覧
│   │   └── [id].tsx     # 詳細
│   ├── runs/            # 履歴画面
│   ├── settings/        # 設定画面
│   └── index.tsx        # ホーム（/toolsにリダイレクト）
├── lib/
│   ├── db.ts            # データベース接続
│   └── utils.ts         # ユーティリティ関数
├── scripts/
│   └── seed.ts          # シードデータ投入スクリプト
└── styles/
    └── globals.css      # グローバルスタイル
```

## 主な画面

### 1. ツール一覧画面 (`/tools`)
- カテゴリチップで絞り込み
- キーワード検索（デバウンス300ms）
- 2カラムのカード表示
- 無限スクロール

### 2. ツール詳細画面 (`/tools/[id]`)
- 入力フォーム（タイトル、テキスト、トーン、文字数）
- リアルタイム生成
- 結果表示とコピー機能
- 再生成機能

### 3. 履歴画面 (`/runs`)
- 生成履歴の一覧表示
- 詳細モーダル
- 個別削除・全削除
- コピー機能

### 4. 設定画面 (`/settings`)
- ユーザー情報表示
- 履歴の全削除
- アプリケーション情報

## API エンドポイント

- `GET /api/categories` - カテゴリ一覧取得
- `GET /api/tools` - ツール一覧取得（フィルタ・ページング対応）
- `GET /api/tools/:id` - ツール詳細取得
- `POST /api/generate` - テキスト生成
- `GET /api/runs` - 履歴一覧取得
- `DELETE /api/runs/:id` - 履歴削除
- `DELETE /api/runs` - 全履歴削除

## 実装済み機能

- ✅ **最新Gemini API統合**: Google Gemini 2.5/2.0シリーズによる高品質テキスト生成
- ✅ **モデル選択機能**: 4つのモデルから用途に応じて選択可能
  - Gemini 2.5 Pro - 最高性能、複雑な問題対応
  - Gemini 2.5 Flash - バランス型、コスパ最適（デフォルト）
  - Gemini 2.0 Flash - 標準、低レイテンシ
  - Gemini 2.0 Flash Lite - 軽量、最速レスポンス
- ✅ **認証なし**: ローカル環境での単一ユーザー想定
- ✅ **テキスト生成**: 18種類のツールで多様なコンテンツ生成
- ✅ **履歴管理**: 生成したテキストの保存と閲覧
- ⚠️ **画像生成なし**: テキスト生成のみ対応
- ⚠️ **決済なし**: プレミアム機能は表示のみ

## 🔒 セキュリティとAPI Keyの取り扱い

### 環境変数の管理

このプロジェクトでは、機密情報（APIキー）を環境変数ファイル `.env.local` で管理しています。

**✅ 正しい方法:**
```bash
# .env.local ファイルに記述
GEMINI_API_KEY=your_api_key_here
```

**❌ 間違った方法:**
```typescript
// コードに直接記述（絶対にしないでください！）
const apiKey = "AIzaSy..."; // NG!
```

### .gitignore による保護

`.env.local` ファイルは `.gitignore` に含まれており、以下のファイルは自動的にGitから除外されます：

- `.env.local` - 機密情報を含む環境変数
- `.env*.local` - すべてのローカル環境変数ファイル
- `data.db` - ローカルデータベース

### Githubのシークレットスキャン

PublicリポジトリにAPIキーを誤ってコミットした場合：
1. Githubが自動的に検出
2. リポジトリ所有者に警告
3. APIキーが失効される可能性

詳細: [Secret Scanning について](https://docs.github.com/ja/code-security/secret-scanning/introduction/about-secret-scanning)

### 環境変数の設定手順

1. `.env.local.example` を参考に `.env.local` を作成
2. 実際のAPIキーを設定
3. `.env.local` はコミットしない（自動的に除外されます）
4. チームメンバーには `.env.local.example` を共有

## Vercelへのデプロイ

このアプリケーションはVercelに簡単にデプロイできます。

### 前提条件

- Githubアカウント
- Vercelアカウント（[vercel.com](https://vercel.com)で無料登録）

### デプロイ手順

#### 1. GitHubリポジトリの作成

```bash
# まだGitリポジトリを初期化していない場合
git init
git add .
git commit -m "Initial commit"

# GitHubでリポジトリを作成してプッシュ
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

#### 2. Vercelでプロジェクトをインポート

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリを接続
4. 作成したリポジトリを選択
5. プロジェクト設定を確認：
   - **Framework Preset**: Next.js（自動検出）
   - **Build Command**: `npm run build`（自動設定）
   - **Install Command**: `npm install`（自動設定）

#### 3. 環境変数の設定

デプロイ前に環境変数を設定します：

1. 「Environment Variables」セクションで以下を追加：
   ```
   Name: GEMINI_API_KEY
   Value: your_actual_gemini_api_key
   ```
2. 必要に応じて他の環境変数も追加

#### 4. デプロイ実行

「Deploy」ボタンをクリックすると、自動的にビルドとデプロイが開始されます。

#### 5. デプロイ完了

- 数分でデプロイが完了します
- `https://your-project-name.vercel.app` のようなURLが発行されます
- 以降、`main`ブランチへのプッシュで自動デプロイされます

### 継続的デプロイ（CD）

Vercelは自動的に以下を実行します：
- **本番環境**: `main`ブランチへのプッシュで自動デプロイ
- **プレビュー環境**: プルリクエストごとに一時的なプレビューURLを生成

### カスタムドメインの設定

1. Vercel Dashboardでプロジェクトを開く
2. 「Settings」→「Domains」
3. カスタムドメインを追加
4. DNSレコードを設定（指示に従う）

### 注意事項

⚠️ **データベースについて**:
- このプロジェクトはSQLiteを使用しているため、Vercelの**Serverless環境では永続化されません**
- 本番環境では以下のいずれかに移行することを推奨：
  - **Vercel Postgres** (推奨)
  - **PlanetScale** (MySQL互換)
  - **Supabase** (PostgreSQL)
  - **Railway** (PostgreSQL/MySQL)

⚠️ **環境変数の管理**:
- 本番環境用とプレビュー環境用で異なるAPIキーを使用することを推奨
- Vercel Dashboardから環境ごとに設定可能

### トラブルシューティング

**ビルドエラーが出る場合:**
```bash
# ローカルでビルドテスト
npm run build
```

**環境変数が反映されない場合:**
- Vercel Dashboardで環境変数を再確認
- 再デプロイを実行（「Deployments」→「...」→「Redeploy」）

**データベースが初期化されない場合:**
- `package.json`の`postinstall`スクリプトを確認
- ビルドログを確認して、`init-db`と`seed`が実行されているか確認

## 今後の拡張予定

- 🔐 ユーザー認証・認可
- 💳 課金・決済機能
- 🖼️ 画像生成機能（Gemini Vision）
- 🎤 文字起こし機能
- 🌍 多言語対応
- 📊 利用統計・分析
- 🤖 他のLLM対応（OpenAI, Anthropic等）
- 🗄️ PostgreSQLへの移行（Vercel Postgres推奨）

## ライセンス

MIT

## 作成者

Hiro
