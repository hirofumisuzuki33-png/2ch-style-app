import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Sparkles, Copy, RefreshCw, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface Tool {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  subCategory?: string;
  isPremium: boolean;
}

export default function ToolDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // フォーム入力
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [tone, setTone] = useState('');
  const [length, setLength] = useState('');

  // 生成結果
  const [result, setResult] = useState('');

  useEffect(() => {
    if (!id) return;

    fetch(`/api/tools/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Tool not found');
        return res.json();
      })
      .then((data) => {
        setTool(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching tool:', error);
        toast({
          title: 'エラー',
          description: 'ツールが見つかりませんでした',
          variant: 'destructive',
        });
        router.push('/tools');
      });
  }, [id, router, toast]);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: '入力エラー',
        description: 'テキストを入力してください',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);

    try {
      // LocalStorageから設定を取得
      const selectedModel = typeof window !== 'undefined' 
        ? localStorage.getItem('gemini-model') || 'gemini-2.5-flash'
        : 'gemini-2.5-flash';
      
      const clientApiKey = typeof window !== 'undefined'
        ? localStorage.getItem('gemini-api-key') || undefined
        : undefined;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: id,
          input: { title, text, tone, length },
          model: selectedModel,
          apiKey: clientApiKey,
        }),
      });

      if (!res.ok) throw new Error('Generation failed');

      const data = await res.json();
      setResult(data.outputText);

      toast({
        title: '生成完了',
        description: 'テキストが生成されました',
      });
    } catch (error) {
      console.error('Error generating:', error);
      toast({
        title: 'エラー',
        description: '生成に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast({
      title: 'コピー完了',
      description: 'クリップボードにコピーしました',
    });
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (!tool) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link href="/tools">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              一覧に戻る
            </Button>
          </Link>

          <div className="bg-[#ffffee] border border-border p-3">
            <h1 className="text-2xl font-bold post-name">【{tool.name}】</h1>
            <p className="text-sm mt-1">{tool.description}</p>
            <div className="flex gap-2 mt-2">
              {tool.subCategory && (
                <Badge variant="secondary" className="text-xs">{tool.subCategory}</Badge>
              )}
              {tool.isPremium && (
                <Badge className="text-xs bg-[#ff6347] border-[#ff6347]">
                  ★プレミアム
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 入力フォーム */}
          <Card className="bg-card">
            <CardHeader className="bg-[#ffffee] border-b">
              <CardTitle className="text-lg font-bold post-name">■ 入力フォーム</CardTitle>
              <CardDescription className="text-xs">必要な情報を入力してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="space-y-1">
                <Label htmlFor="title" className="text-sm font-bold">タイトル（任意）</Label>
                <Input
                  id="title"
                  placeholder="タイトルを入力"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="text" className="text-sm font-bold">テキスト（必須）</Label>
                <Textarea
                  id="text"
                  placeholder="生成したい内容を入力してください"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="tone" className="text-sm font-bold">トーン（任意）</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">フォーマル</SelectItem>
                    <SelectItem value="casual">カジュアル</SelectItem>
                    <SelectItem value="friendly">フレンドリー</SelectItem>
                    <SelectItem value="professional">プロフェッショナル</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="length" className="text-sm font-bold">文字数（任意）</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger id="length">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">短い（〜200字）</SelectItem>
                    <SelectItem value="medium">中程度（200〜500字）</SelectItem>
                    <SelectItem value="long">長い（500字〜）</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    生成する
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 結果表示 */}
          <Card className="bg-card">
            <CardHeader className="bg-[#ffffee] border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold post-name">■ 生成結果</CardTitle>
                  <CardDescription className="text-xs">生成されたテキストが表示されます</CardDescription>
                </div>
                {result && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={generating}>
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {generating ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-3">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <p className="text-xs text-muted-foreground">
                      テキストを生成しています...
                    </p>
                  </div>
                </div>
              ) : result ? (
                <div className="bg-[#ffffee] border border-border p-3 whitespace-pre-wrap text-sm leading-relaxed">
                  {result}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                  <p>生成ボタンをクリックしてテキストを生成してください</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
