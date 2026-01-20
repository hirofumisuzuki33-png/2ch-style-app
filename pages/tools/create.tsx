import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
}

export default function CreateToolPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // フォーム状態
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  // カテゴリ取得
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((error) => {
        console.error('Error fetching categories:', error);
        toast({
          title: 'エラー',
          description: 'カテゴリの取得に失敗しました',
          variant: 'destructive',
        });
      });
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim() || !categoryId) {
      toast({
        title: '入力エラー',
        description: 'ツール名、説明、カテゴリは必須です',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/tools/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          categoryId: parseInt(categoryId),
          subCategory: subCategory || null,
          isPremium,
          customPrompt: customPrompt || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to create tool');

      const data = await res.json();

      toast({
        title: '作成完了',
        description: `「${name}」を作成しました`,
      });

      router.push('/tools');
    } catch (error) {
      console.error('Error creating tool:', error);
      toast({
        title: 'エラー',
        description: 'ツールの作成に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link href="/tools">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ツール一覧に戻る
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold">新しいツールを作成</h1>
            <p className="text-muted-foreground mt-2">
              カスタムテキスト生成ツールを作成できます
            </p>
          </motion.div>
        </div>

        <Separator />

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                ツール情報
              </CardTitle>
              <CardDescription>
                ツールの基本情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  ツール名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="例: マーケティングメール作成"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  説明 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="このツールの説明を入力してください"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    カテゴリ <span className="text-red-500">*</span>
                  </Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subCategory">サブカテゴリ（任意）</Label>
                  <Input
                    id="subCategory"
                    placeholder="例: SEO、SNS投稿"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="isPremium" className="cursor-pointer">
                  プレミアム機能として設定
                </Label>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="customPrompt" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  カスタムプロンプト（任意）
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  このツールの動作を定義するプロンプトを設定できます。
                  設定しない場合は、ツール名と説明から自動的にプロンプトが生成されます。
                </p>
                <Textarea
                  id="customPrompt"
                  placeholder="例: あなたはマーケティングの専門家です。顧客に響く魅力的なメール文章を作成してください。トーンは{{tone}}で、文字数は{{length}}程度でお願いします。"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  💡 ヒント: {'{{title}}'}, {'{{text}}'}, {'{{tone}}'}, {'{{length}}'} などの変数を使用できます
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>プロンプト例：</strong><br />
                  「あなたは{'{{toolName}}'}の専門家です。{'{{description}}'}
                  <br />入力内容：{'{{text}}'}
                  <br />この内容を元に、{'{{tone}}'}なトーンで、{'{{length}}'}の文章を作成してください。」
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg" 
                disabled={loading}
              >
                {loading ? (
                  <>作成中...</>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    ツールを作成
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}
