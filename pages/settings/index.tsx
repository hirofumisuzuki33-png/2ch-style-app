import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Settings as SettingsIcon, Sparkles, Key, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/router';

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasEnvApiKey, setHasEnvApiKey] = useState(false);

  // 設定の読み込み
  useEffect(() => {
    const savedModel = localStorage.getItem('gemini-model');
    if (savedModel) {
      setSelectedModel(savedModel);
    }

    const savedApiKey = localStorage.getItem('gemini-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    // .env.localにAPIキーがあるかチェック
    fetch('/api/check-env-key')
      .then(res => res.json())
      .then(data => setHasEnvApiKey(data.hasKey))
      .catch(() => setHasEnvApiKey(false));
  }, []);

  const handleSaveModel = () => {
    localStorage.setItem('gemini-model', selectedModel);
    toast({
      title: '保存完了',
      description: `AIモデルを ${getModelDisplayName(selectedModel)} に変更しました`,
    });
  };

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: 'エラー',
        description: 'APIキーを入力してください',
        variant: 'destructive',
      });
      return;
    }

    if (!apiKey.startsWith('AIza')) {
      toast({
        title: '警告',
        description: 'Gemini APIキーは通常「AIza」で始まります。正しいキーか確認してください。',
        variant: 'destructive',
      });
      return;
    }

    localStorage.setItem('gemini-api-key', apiKey);
    toast({
      title: '保存完了',
      description: 'APIキーを保存しました。ブラウザのLocalStorageに安全に保存されています。',
    });
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini-api-key');
    setApiKey('');
    toast({
      title: '削除完了',
      description: 'APIキーを削除しました',
    });
  };

  const handleDeleteAllHistory = async () => {
    try {
      const res = await fetch('/api/runs', { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      toast({
        title: '削除完了',
        description: 'すべての履歴を削除しました',
      });
    } catch (error) {
      console.error('Error deleting history:', error);
      toast({
        title: 'エラー',
        description: '削除に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const getModelDisplayName = (model: string) => {
    const names: Record<string, string> = {
      'gemini-2.5-pro': 'Gemini 2.5 Pro',
      'gemini-2.5-flash': 'Gemini 2.5 Flash',
      'gemini-2.0-flash': 'Gemini 2.0 Flash',
      'gemini-2.0-flash-lite': 'Gemini 2.0 Flash Lite',
    };
    return names[model] || model;
  };

  return (
    <MainLayout>
      <div className="max-w-2xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">設定</h1>
              <p className="text-muted-foreground mt-1">
                アプリケーションの設定を管理します
              </p>
            </div>
          </div>
        </motion.div>

        <Separator />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Gemini APIキー設定
              </CardTitle>
              <CardDescription>
                Google AI StudioからAPIキーを取得して設定してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasEnvApiKey && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-600 dark:text-green-400">
                    .env.local ファイルにAPIキーが設定されています（推奨）
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="apiKey">
                  APIキー {!hasEnvApiKey && <span className="text-red-500">*</span>}
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="AIzaSy..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  取得方法：<a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a> → 「APIキーを作成」
                </p>
                <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>🔒 セキュリティ：</strong> LocalStorageに保存されます。.env.localファイルでの設定を推奨します。
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveApiKey} className="flex-1">
                  <Key className="mr-2 h-4 w-4" />
                  APIキーを保存
                </Button>
                {apiKey && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>APIキーを削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                          保存されているAPIキーが削除されます。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearApiKey}>
                          削除する
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AIモデル設定
              </CardTitle>
              <CardDescription>
                テキスト生成に使用するGemini AIモデルを選択してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">使用するモデル</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.5-pro">
                      <div className="flex flex-col">
                        <span className="font-medium">Gemini 2.5 Pro</span>
                        <span className="text-xs text-muted-foreground">最高性能 - 複雑な問題に対応、長文対応</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="gemini-2.5-flash">
                      <div className="flex flex-col">
                        <span className="font-medium">Gemini 2.5 Flash</span>
                        <span className="text-xs text-muted-foreground">バランス型 - 高速で多用途、コスパ最適</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="gemini-2.0-flash">
                      <div className="flex flex-col">
                        <span className="font-medium">Gemini 2.0 Flash</span>
                        <span className="text-xs text-muted-foreground">標準 - 低レイテンシ、コスト効率良</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="gemini-2.0-flash-lite">
                      <div className="flex flex-col">
                        <span className="font-medium">Gemini 2.0 Flash Lite</span>
                        <span className="text-xs text-muted-foreground">軽量 - 最速レスポンス、コスト重視</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  選択したモデル設定はブラウザに保存されます
                </p>
              </div>
              <Button onClick={handleSaveModel} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                モデル設定を保存
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>ユーザー情報</CardTitle>
              <CardDescription>
                現在のユーザー情報を表示しています（MVP版）
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">ユーザー名</p>
                  <p className="text-sm text-muted-foreground">Hiro</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">プラン</p>
                  <p className="text-sm text-muted-foreground">freeプラン</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>データ管理</CardTitle>
              <CardDescription>
                アプリケーションのデータを管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">生成履歴を削除</p>
                  <p className="text-sm text-muted-foreground">
                    すべての生成履歴を削除します
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      削除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        すべての生成履歴が削除されます。この操作は取り消せません。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllHistory}>
                        削除する
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>アプリケーション情報</CardTitle>
              <CardDescription>
                バージョンとライセンス情報
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">バージョン</span>
                <span className="text-sm text-muted-foreground">1.0.0 (MVP)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">環境</span>
                <span className="text-sm text-muted-foreground">ローカル開発版</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
